import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

loadEnv(path.join(rootDir, '.env'));

const databasePath = path.resolve(rootDir, process.env.DATABASE_PATH || './data/runxu-leads.sqlite');
const bitableFieldMapPath = path.resolve(rootDir, process.env.BITABLE_FIELD_MAP_PATH || './config/bitable-field-map.json');
const bitableTimeoutMs = Number(process.env.BITABLE_TIMEOUT_MS || 3000);
let tenantTokenCache = { token: '', expiresAt: 0 };

const args = parseArgs(process.argv.slice(2));
const limit = Number(args.limit || 20);
const status = args.status || 'failed';
const dryRun = Boolean(args['dry-run']);

if (!fs.existsSync(databasePath)) {
  console.error(`数据库不存在：${databasePath}`);
  process.exit(1);
}

if (!['failed', 'not_configured', 'pending', 'mock'].includes(status)) {
  console.error('status 仅支持 failed / not_configured / pending / mock');
  process.exit(1);
}

const rows = await queryLeads(status, limit);

if (dryRun) {
  console.log(JSON.stringify({
    dryRun: true,
    status,
    count: rows.length,
    leadIds: rows.map((row) => row.leadId)
  }, null, 2));
  process.exit(0);
}

let success = 0;
let failed = 0;
for (const lead of rows) {
  const result = await writeBitableRecord(lead);
  await updateBitableStatus(lead.leadId, result);
  if (result.status === 'success' || result.status === 'mock') success += 1;
  else failed += 1;
  console.log(JSON.stringify({
    leadId: lead.leadId,
    status: result.status,
    recordId: result.recordId || ''
  }));
}

console.log(JSON.stringify({ total: rows.length, success, failed }, null, 2));

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const index = trimmed.indexOf('=');
    if (index === -1) return;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  });
}

function parseArgs(items) {
  const parsed = {};
  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    if (!item.startsWith('--')) continue;
    const key = item.slice(2);
    const next = items[index + 1];
    if (!next || next.startsWith('--')) {
      parsed[key] = true;
    } else {
      parsed[key] = next;
      index += 1;
    }
  }
  return parsed;
}

function sqlValue(value) {
  if (typeof value === 'number') return String(value);
  if (value === null || value === undefined) return "''";
  return `'${String(value).replaceAll("'", "''")}'`;
}

function runSqlJson(sql) {
  return new Promise((resolve, reject) => {
    const child = spawn('sqlite3', ['-json', databasePath, sql], { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(stderr || `sqlite3 exited with ${code}`));
        return;
      }
      resolve(stdout.trim() ? JSON.parse(stdout) : []);
    });
  });
}

function runSql(sql) {
  return new Promise((resolve, reject) => {
    const child = spawn('sqlite3', [databasePath, sql], { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve(stdout);
      else reject(new Error(stderr || `sqlite3 exited with ${code}`));
    });
  });
}

async function queryLeads(notifyStatus, maxRows) {
  const sql = `
SELECT
  lead_id AS leadId,
  created_at AS createdAt,
  source,
  name,
  company,
  role,
  contact,
  project_background AS projectBackground,
  score,
  level,
  cmmi_reference AS cmmiReference,
  dimensions_json AS dimensionsJson,
  weaknesses_json AS weaknessesJson,
  answers_json AS answersJson,
  lead_quality AS leadQuality,
  duplicate
FROM diagnostic_leads
WHERE notify_bitable=${sqlValue(notifyStatus)}
ORDER BY created_at DESC
LIMIT ${Number.isFinite(maxRows) && maxRows > 0 ? Math.floor(maxRows) : 20};
`;
  const rows = await runSqlJson(sql);
  return rows.map((row) => {
    const dimensions = parseJson(row.dimensionsJson, []);
    const weaknesses = parseJson(row.weaknessesJson, []);
    return {
      ...row,
      duplicate: Number(row.duplicate) === 1,
      dimensions,
      weaknesses,
      answers: parseJson(row.answersJson, {}),
      firstQuestion: buildFirstQuestion(weaknesses),
      followupAction: buildFollowupAction(weaknesses)
    };
  });
}

function parseJson(value, fallback) {
  try {
    return JSON.parse(value || '');
  } catch {
    return fallback;
  }
}

function buildFollowupAction(weaknesses) {
  const top = weaknesses.map((item) => item.name).filter(Boolean).slice(0, 3).join('、') || '项目治理关键短板';
  return `优先围绕 ${top} 进行首次沟通，确认当前项目的治理断点和 30 天内可落地动作。`;
}

function buildFirstQuestion(weaknesses) {
  const first = weaknesses[0]?.name || '项目交付';
  return `当前项目在「${first}」上最影响交付结果的问题是什么？`;
}

function loadBitableFieldMap() {
  const defaults = {
    leadId: '线索ID',
    createdAt: '提交时间',
    source: '来源',
    company: '公司/团队',
    name: '姓名',
    role: '角色',
    contact: '联系方式',
    score: '总分',
    level: '风险等级',
    leadQuality: '线索等级',
    duplicate: '是否重复',
    dimensions: '雷达图数据',
    weaknesses: 'Top短板',
    firstQuestion: '建议首问',
    followupAction: '建议跟进动作',
    projectBackground: '项目背景',
    followStatus: '跟进状态',
    bitableStatus: '写入状态'
  };
  if (!fs.existsSync(bitableFieldMapPath)) return defaults;
  return { ...defaults, ...JSON.parse(fs.readFileSync(bitableFieldMapPath, 'utf8')) };
}

function buildBitableFields(lead) {
  const map = loadBitableFieldMap();
  const dimensions = lead.dimensions.map((item) => `${item.name}:${item.score}`).join('｜');
  const weaknesses = lead.weaknesses.map((item, index) => `${index + 1}. ${item.name} ${item.score}分：${item.advice || ''}`).join('\n');
  const raw = {
    leadId: lead.leadId,
    createdAt: Date.parse(lead.createdAt) || Date.now(),
    source: lead.source,
    company: lead.company,
    name: lead.name,
    role: lead.role || '',
    contact: lead.contact,
    score: lead.score,
    level: lead.level,
    leadQuality: lead.leadQuality,
    duplicate: lead.duplicate ? '是' : '否',
    dimensions,
    weaknesses,
    firstQuestion: lead.firstQuestion,
    followupAction: lead.followupAction,
    projectBackground: lead.projectBackground,
    followStatus: '未跟进',
    bitableStatus: 'success'
  };
  return Object.fromEntries(Object.entries(raw).map(([key, value]) => [map[key] || key, value]));
}

async function getTenantAccessToken() {
  if (tenantTokenCache.token && tenantTokenCache.expiresAt > Date.now() + 5 * 60 * 1000) return tenantTokenCache.token;
  if (!process.env.FEISHU_APP_ID || !process.env.FEISHU_APP_SECRET) {
    throw new Error('FEISHU_APP_ID or FEISHU_APP_SECRET missing');
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), bitableTimeoutMs);
  try {
    const response = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        app_id: process.env.FEISHU_APP_ID,
        app_secret: process.env.FEISHU_APP_SECRET
      }),
      signal: controller.signal
    });
    const data = await response.json();
    if (!response.ok || data.code !== 0 || !data.tenant_access_token) {
      throw new Error(`tenant_access_token failed: ${data.msg || response.status}`);
    }
    tenantTokenCache = {
      token: data.tenant_access_token,
      expiresAt: Date.now() + Number(data.expire || 7200) * 1000
    };
    return tenantTokenCache.token;
  } finally {
    clearTimeout(timer);
  }
}

async function writeBitableRecord(lead) {
  if (String(process.env.BITABLE_ENABLED || 'true').toLowerCase() !== 'true') return { status: 'not_configured' };
  if (String(process.env.BITABLE_MOCK || 'true').toLowerCase() === 'true') return { status: 'mock' };
  if (!process.env.BITABLE_APP_TOKEN || !process.env.BITABLE_TABLE_ID) {
    return { status: 'not_configured', error: 'BITABLE_APP_TOKEN or BITABLE_TABLE_ID missing' };
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), bitableTimeoutMs);
  try {
    const token = await getTenantAccessToken();
    const url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${encodeURIComponent(process.env.BITABLE_APP_TOKEN)}/tables/${encodeURIComponent(process.env.BITABLE_TABLE_ID)}/records`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ fields: buildBitableFields(lead) }),
      signal: controller.signal
    });
    const data = await response.json();
    if (response.ok && data.code === 0) {
      return { status: 'success', recordId: data.data?.record?.record_id || data.data?.record_id || '' };
    }
    return { status: 'failed', error: `Bitable HTTP ${response.status}: ${data.msg || data.code || 'unknown'}` };
  } catch (error) {
    return { status: 'failed', error: error.name === 'AbortError' ? 'Bitable timeout' : error.message };
  } finally {
    clearTimeout(timer);
  }
}

async function updateBitableStatus(leadId, result) {
  await runSql(`
UPDATE diagnostic_leads SET
  notify_bitable=${sqlValue(result.status)},
  bitable_record_id=${sqlValue(result.recordId || '')},
  bitable_error=${sqlValue(result.error || '')}
WHERE lead_id=${sqlValue(leadId)};
`);
}
