import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';
import tls from 'node:tls';
import net from 'node:net';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

loadEnv(path.join(__dirname, '.env'));

const PORT = Number(process.env.PORT || 8765);
const DATABASE_PATH = path.resolve(__dirname, process.env.DATABASE_PATH || './data/runxu-leads.sqlite');
const DATA_DIR = path.dirname(DATABASE_PATH);
const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS || 600000);
const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX || 5);
const FEISHU_CARD_ENABLED = boolEnv('FEISHU_CARD_ENABLED', true);
const FEISHU_CARD_MOCK = boolEnv('FEISHU_CARD_MOCK', boolEnv('FEISHU_MOCK', true));
const BITABLE_ENABLED = boolEnv('BITABLE_ENABLED', true);
const BITABLE_MOCK = boolEnv('BITABLE_MOCK', true);
const BITABLE_FIELD_MAP_PATH = path.resolve(__dirname, process.env.BITABLE_FIELD_MAP_PATH || './config/bitable-field-map.json');
const BITABLE_TIMEOUT_MS = Number(process.env.BITABLE_TIMEOUT_MS || 3000);
const rateBuckets = new Map();
let tenantTokenCache = { token: '', expiresAt: 0 };

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.txt': 'text/plain; charset=utf-8'
};

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

function hashValue(value) {
  return crypto.createHash('sha256').update(String(value || '')).digest('hex');
}

function nowIso() {
  return new Date().toISOString();
}

function boolEnv(key, defaultValue) {
  if (process.env[key] === undefined || process.env[key] === '') return defaultValue;
  return String(process.env[key]).toLowerCase() === 'true';
}

function generateLeadId() {
  const stamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
  return `lead_${stamp}_${crypto.randomBytes(4).toString('hex')}`;
}

function logSafe(message, meta = {}) {
  const safe = { ...meta };
  delete safe.contact;
  delete safe.projectBackground;
  console.log(`[runxu] ${message}`, safe);
}

function runSql(args, input = '') {
  return new Promise((resolve, reject) => {
    const child = spawn('sqlite3', args, { stdio: ['pipe', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve(stdout);
      else reject(new Error(stderr || `sqlite3 exited with ${code}`));
    });
    child.stdin.end(input);
  });
}

async function initDb() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  await runSql([DATABASE_PATH], `
CREATE TABLE IF NOT EXISTS diagnostic_leads (
  lead_id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  source TEXT NOT NULL,
  name TEXT NOT NULL,
  company TEXT NOT NULL,
  role TEXT,
  contact TEXT NOT NULL,
  contact_hash TEXT NOT NULL,
  project_background TEXT NOT NULL,
  consent INTEGER NOT NULL,
  score INTEGER NOT NULL,
  level TEXT NOT NULL,
  cmmi_reference TEXT NOT NULL,
  dimensions_json TEXT NOT NULL,
  weaknesses_json TEXT NOT NULL,
  answers_json TEXT NOT NULL,
  lead_quality TEXT NOT NULL,
  duplicate INTEGER NOT NULL,
  notify_email TEXT NOT NULL,
  notify_feishu TEXT NOT NULL,
  ip_hash TEXT,
  user_agent_hash TEXT
);
CREATE INDEX IF NOT EXISTS idx_diagnostic_leads_created_at ON diagnostic_leads(created_at);
CREATE INDEX IF NOT EXISTS idx_diagnostic_leads_contact_hash ON diagnostic_leads(contact_hash);
CREATE INDEX IF NOT EXISTS idx_diagnostic_leads_duplicate ON diagnostic_leads(duplicate);
CREATE INDEX IF NOT EXISTS idx_diagnostic_leads_quality ON diagnostic_leads(lead_quality);
`);
  await ensureColumn('diagnostic_leads', 'notify_bitable', "TEXT NOT NULL DEFAULT 'not_configured'");
  await ensureColumn('diagnostic_leads', 'bitable_record_id', "TEXT NOT NULL DEFAULT ''");
  await ensureColumn('diagnostic_leads', 'bitable_error', "TEXT NOT NULL DEFAULT ''");
  await ensureColumn('diagnostic_leads', 'feishu_error', "TEXT NOT NULL DEFAULT ''");
  await runSql([DATABASE_PATH], `CREATE INDEX IF NOT EXISTS idx_diagnostic_leads_bitable ON diagnostic_leads(notify_bitable);`);
}

async function ensureColumn(tableName, columnName, definition) {
  const info = await runSql([DATABASE_PATH, `PRAGMA table_info(${tableName});`]);
  const exists = info.split(/\r?\n/).some((line) => line.split('|')[1] === columnName);
  if (!exists) {
    await runSql([DATABASE_PATH], `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition};`);
  }
}

async function insertLead(lead) {
  const fields = {
    lead_id: lead.leadId,
    created_at: lead.createdAt,
    source: lead.source,
    name: lead.name,
    company: lead.company,
    role: lead.role,
    contact: lead.contact,
    contact_hash: lead.contactHash,
    project_background: lead.projectBackground,
    consent: lead.consent ? 1 : 0,
    score: lead.score,
    level: lead.level,
    cmmi_reference: lead.cmmiReference,
    dimensions_json: JSON.stringify(lead.dimensions),
    weaknesses_json: JSON.stringify(lead.weaknesses),
    answers_json: JSON.stringify(lead.answers),
    lead_quality: lead.leadQuality,
    duplicate: lead.duplicate ? 1 : 0,
    notify_email: lead.notifyEmail,
    notify_feishu: lead.notifyFeishu,
    notify_bitable: lead.notifyBitable,
    bitable_record_id: lead.bitableRecordId || '',
    bitable_error: lead.bitableError || '',
    feishu_error: lead.feishuError || '',
    ip_hash: lead.ipHash,
    user_agent_hash: lead.userAgentHash
  };
  const columns = Object.keys(fields).join(',');
  const values = Object.values(fields).map(sqlValue).join(',');
  await runSql([DATABASE_PATH], `INSERT INTO diagnostic_leads (${columns}) VALUES (${values});`);
}

function sqlValue(value) {
  if (typeof value === 'number') return String(value);
  if (value === null || value === undefined) return "''";
  return `'${String(value).replaceAll("'", "''")}'`;
}

async function updateNotifyStatus(leadId, status) {
  await runSql([DATABASE_PATH], `
UPDATE diagnostic_leads SET
  notify_email=${sqlValue(status.email)},
  notify_feishu=${sqlValue(status.feishu)},
  notify_bitable=${sqlValue(status.bitable)},
  bitable_record_id=${sqlValue(status.bitableRecordId || '')},
  bitable_error=${sqlValue(status.bitableError || '')},
  feishu_error=${sqlValue(status.feishuError || '')}
WHERE lead_id=${sqlValue(leadId)};
`);
}

async function countRecent(contactHash, sinceIso) {
  const sql = `SELECT COUNT(*) FROM diagnostic_leads WHERE contact_hash='${contactHash.replaceAll("'", "''")}' AND created_at>='${sinceIso}';`;
  const output = await runSql([DATABASE_PATH, sql]);
  return Number(output.trim() || 0);
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        reject(Object.assign(new Error('请求体过大'), { code: 'VALIDATION_ERROR', status: 413 }));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch {
        reject(Object.assign(new Error('请求格式错误'), { code: 'VALIDATION_ERROR', status: 400 }));
      }
    });
    req.on('error', reject);
  });
}

function validatePayload(payload) {
  const profile = payload.profile || {};
  const diagnostic = payload.diagnostic || {};
  const errors = [];
  if (!profile.name || profile.name.trim().length < 2 || profile.name.length > 20) errors.push('请填写姓名');
  if (!profile.company || profile.company.trim().length < 2 || profile.company.length > 50) errors.push('请填写公司或团队名称');
  if (profile.role && profile.role.length > 30) errors.push('职位或角色不能超过 30 字');
  if (!profile.contact || !isValidContact(profile.contact)) errors.push('请填写有效联系方式');
  if (!profile.projectBackground || profile.projectBackground.trim().length < 10 || profile.projectBackground.length > 500) errors.push('请简单说明项目背景或当前困扰');
  if (profile.consent !== true) {
    const error = new Error('请确认授权后生成诊断报告');
    error.code = 'CONSENT_REQUIRED';
    error.status = 400;
    throw error;
  }
  if (!Number.isInteger(diagnostic.score) || diagnostic.score < 0 || diagnostic.score > 100) errors.push('诊断分数异常');
  if (!Array.isArray(diagnostic.dimensions) || !Array.isArray(diagnostic.weaknesses) || typeof diagnostic.answers !== 'object') errors.push('诊断结果结构异常');
  if (errors.length) {
    const error = new Error(errors[0]);
    error.code = 'VALIDATION_ERROR';
    error.status = 400;
    throw error;
  }
}

function isValidContact(value) {
  const contact = String(value || '').trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)
    || /^1[3-9]\d{9}$/.test(contact)
    || /^[a-zA-Z0-9_-]{4,50}$/.test(contact)
    || /^飞书同(手机号|邮箱)$/.test(contact);
}

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  return String(Array.isArray(forwarded) ? forwarded[0] : forwarded || req.socket.remoteAddress || '').split(',')[0].trim();
}

function checkRateLimit(ipHash) {
  const now = Date.now();
  const bucket = rateBuckets.get(ipHash) || [];
  const recent = bucket.filter((time) => now - time < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX) {
    const error = new Error('提交过于频繁，请稍后再试');
    error.code = 'RATE_LIMITED';
    error.status = 429;
    throw error;
  }
  recent.push(now);
  rateBuckets.set(ipHash, recent);
}

function getLeadQuality(profile, diagnostic, duplicate) {
  if (duplicate) return 'unknown';
  if (profile.projectBackground.trim().length >= 30 && (diagnostic.score < 70 || diagnostic.weaknesses?.some((item) => item.score === 0))) return 'high';
  if (profile.projectBackground.trim().length >= 10 && isValidContact(profile.contact)) return 'medium';
  return 'unknown';
}

function buildFollowupAction(diagnostic) {
  const top = diagnostic.weaknesses?.map((item) => item.name).filter(Boolean).slice(0, 3).join('、') || '项目治理关键短板';
  return `优先围绕 ${top} 进行首次沟通，确认当前项目的治理断点和 30 天内可落地动作。`;
}

function buildFirstQuestion(diagnostic) {
  const first = diagnostic.weaknesses?.[0]?.name || '项目交付';
  return `当前项目在「${first}」上最影响交付结果的问题是什么？`;
}

function buildEmail(lead) {
  const subject = `【润序科技官网线索｜${lead.level}】${lead.company} - ${lead.name} - ${lead.score}分`;
  const top3 = lead.weaknesses.map((item, index) => `${index + 1}. ${item.name} ${item.score}分：${item.advice}`).join('\n');
  const dimensions = lead.dimensions.map((item) => `- ${item.name}：${item.score}`).join('\n');
  const text = `线索摘要
- 公司：${lead.company}
- 姓名：${lead.name}
- 联系方式：${lead.contact}
- 总分：${lead.score}
- 风险等级：${lead.level}
- 线索等级：${lead.leadQuality}
- 是否重复：${lead.duplicate ? '是' : '否'}

建议跟进动作：
${lead.followupAction}

建议首问问题：
${lead.firstQuestion}

项目背景：
${lead.projectBackground}

8 维得分：
${dimensions}

Top 3 短板：
${top3}

CMMI：${lead.cmmiReference}

免责声明：本工具用于项目管理诊断沟通，不等同于官方 CMMI 评估或认证。`;
  return { subject, text };
}

async function sendEmail(lead) {
  if (String(process.env.EMAIL_MOCK || 'true') === 'true') return 'mock';
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) return 'failed';
  const timeoutMs = Number(process.env.MAIL_TIMEOUT_MS || 3000);
  const { subject, text } = buildEmail(lead);
  const to = process.env.LEAD_NOTIFY_EMAIL || 'Laura_fan@126.com';
  try {
    await smtpSend({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 465),
      secure: String(process.env.SMTP_SECURE || 'true') === 'true',
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
      from: process.env.SMTP_USER,
      to,
      subject,
      text,
      timeoutMs
    });
    return 'success';
  } catch (error) {
    logSafe('email failed', { error: error.message });
    return 'failed';
  }
}

function smtpSend(options) {
  return new Promise((resolve, reject) => {
    const socket = options.secure
      ? tls.connect(options.port, options.host, { servername: options.host })
      : net.connect(options.port, options.host);
    let buffer = '';
    let step = 0;
    const commands = [
      `EHLO runxu-tech.local\r\n`,
      `AUTH LOGIN\r\n`,
      `${Buffer.from(options.user).toString('base64')}\r\n`,
      `${Buffer.from(options.pass).toString('base64')}\r\n`,
      `MAIL FROM:<${options.from}>\r\n`,
      `RCPT TO:<${options.to}>\r\n`,
      `DATA\r\n`,
      `From: ${options.from}\r\nTo: ${options.to}\r\nSubject: =?UTF-8?B?${Buffer.from(options.subject).toString('base64')}?=\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\n${options.text}\r\n.\r\n`,
      `QUIT\r\n`
    ];
    const timer = setTimeout(() => {
      socket.destroy();
      reject(new Error('SMTP timeout'));
    }, options.timeoutMs);
    function sendNext() {
      if (step >= commands.length) {
        clearTimeout(timer);
        resolve();
        socket.end();
        return;
      }
      socket.write(commands[step]);
      step += 1;
    }
    socket.on('data', (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split(/\r?\n/).filter(Boolean);
      const last = lines.at(-1) || '';
      if (/^[235]/.test(last)) {
        buffer = '';
        sendNext();
      } else if (/^[45]/.test(last)) {
        clearTimeout(timer);
        socket.destroy();
        reject(new Error(last));
      }
    });
    socket.on('secureConnect', sendNext);
    socket.on('connect', () => { if (!options.secure) sendNext(); });
    socket.on('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
  });
}

function truncateText(value, maxLength = 220) {
  const text = String(value || '').trim();
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
}

function buildFeishuCardText(lead) {
  const top3 = lead.weaknesses.map((item, index) => `${index + 1}. ${item.name} ${item.score}分`).join('\n');
  const dimensions = lead.dimensions.map((item) => `${item.name}:${item.score}`).join('｜');
  const bitableLink = process.env.BITABLE_VIEW_URL ? `\n多维表视图：${process.env.BITABLE_VIEW_URL}` : '';
  return `新官网自评诊断线索｜${lead.level}｜${lead.company}

【首屏摘要】
公司：${lead.company}
姓名：${lead.name}
联系方式：${lead.contact}
总分：${lead.score}
线索等级：${lead.leadQuality}${lead.duplicate ? '｜重复提交' : ''}

【项目经理诊断入口】
建议动作：${lead.followupAction}
首问问题：${lead.firstQuestion}

【雷达图数据】
${dimensions}

【Top 短板】
${top3 || '暂无'}

【项目背景】
${truncateText(lead.projectBackground, 260)}${bitableLink}`;
}

async function sendFeishuCard(lead) {
  if (!FEISHU_CARD_ENABLED) return { status: 'not_configured' };
  if (FEISHU_CARD_MOCK) return { status: 'mock' };
  const webhook = process.env.FEISHU_WEBHOOK_URL;
  if (!webhook) return { status: 'not_configured', error: 'FEISHU_WEBHOOK_URL missing' };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), Number(process.env.FEISHU_TIMEOUT_MS || 3000));
  try {
    const response = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ msg_type: 'text', content: { text: buildFeishuCardText(lead) } }),
      signal: controller.signal
    });
    if (response.ok) return { status: 'success' };
    return { status: 'failed', error: `Feishu webhook HTTP ${response.status}` };
  } catch (error) {
    return { status: 'failed', error: error.name === 'AbortError' ? 'Feishu webhook timeout' : error.message };
  } finally {
    clearTimeout(timer);
  }
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
  if (!fs.existsSync(BITABLE_FIELD_MAP_PATH)) return defaults;
  try {
    return { ...defaults, ...JSON.parse(fs.readFileSync(BITABLE_FIELD_MAP_PATH, 'utf8')) };
  } catch (error) {
    logSafe('bitable field map invalid, using defaults', { error: error.message });
    return defaults;
  }
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
  const timer = setTimeout(() => controller.abort(), BITABLE_TIMEOUT_MS);
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
  if (!BITABLE_ENABLED) return { status: 'not_configured' };
  if (BITABLE_MOCK) return { status: 'mock' };
  if (!process.env.BITABLE_APP_TOKEN || !process.env.BITABLE_TABLE_ID) {
    return { status: 'not_configured', error: 'BITABLE_APP_TOKEN or BITABLE_TABLE_ID missing' };
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), BITABLE_TIMEOUT_MS);
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

async function handleLeadSubmit(req, res) {
  try {
    const payload = await parseJsonBody(req);
    validatePayload(payload);
    const ipHash = hashValue(getClientIp(req));
    checkRateLimit(ipHash);
    const profile = payload.profile;
    const diagnostic = payload.diagnostic;
    const contactHash = hashValue(profile.contact.trim().toLowerCase());
    const sinceIso = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const duplicate = (await countRecent(contactHash, sinceIso)) > 0;
    const baseLead = {
      leadId: generateLeadId(),
      createdAt: nowIso(),
      source: 'runxu_website_questionnaire_v2',
      name: profile.name.trim(),
      company: profile.company.trim(),
      role: profile.role?.trim() || '',
      contact: profile.contact.trim(),
      contactHash,
      projectBackground: profile.projectBackground.trim(),
      consent: true,
      score: diagnostic.score,
      level: diagnostic.level,
      cmmiReference: diagnostic.cmmiReference,
      dimensions: diagnostic.dimensions,
      weaknesses: diagnostic.weaknesses,
      answers: diagnostic.answers,
      duplicate,
      leadQuality: getLeadQuality(profile, diagnostic, duplicate),
      notifyEmail: 'pending',
      notifyFeishu: 'pending',
      notifyBitable: 'pending',
      bitableRecordId: '',
      bitableError: '',
      feishuError: '',
      ipHash,
      userAgentHash: hashValue(req.headers['user-agent'] || ''),
      followupAction: buildFollowupAction(diagnostic),
      firstQuestion: buildFirstQuestion(diagnostic)
    };
    await insertLead(baseLead);
    baseLead.notifyEmail = await sendEmail(baseLead);
    const feishuResult = await sendFeishuCard(baseLead);
    const bitableResult = await writeBitableRecord(baseLead);
    baseLead.notifyFeishu = feishuResult.status;
    baseLead.feishuError = feishuResult.error || '';
    baseLead.notifyBitable = bitableResult.status;
    baseLead.bitableRecordId = bitableResult.recordId || '';
    baseLead.bitableError = bitableResult.error || '';
    await updateNotifyStatus(baseLead.leadId, {
      email: baseLead.notifyEmail,
      feishu: baseLead.notifyFeishu,
      bitable: baseLead.notifyBitable,
      bitableRecordId: baseLead.bitableRecordId,
      bitableError: baseLead.bitableError,
      feishuError: baseLead.feishuError
    });
    logSafe('lead saved', {
      leadId: baseLead.leadId,
      contactHash,
      score: baseLead.score,
      notifyEmail: baseLead.notifyEmail,
      notifyFeishu: baseLead.notifyFeishu,
      notifyBitable: baseLead.notifyBitable
    });
    sendJson(res, 200, {
      success: true,
      leadId: baseLead.leadId,
      reportUnlocked: true,
      duplicate,
      notifyStatus: {
        email: baseLead.notifyEmail,
        feishu: baseLead.notifyFeishu,
        bitable: baseLead.notifyBitable
      }
    });
  } catch (error) {
    const code = error.code || 'UNKNOWN_ERROR';
    const status = error.status || (code === 'UNKNOWN_ERROR' ? 500 : 400);
    logSafe('lead submit failed', { code, status, message: error.message });
    sendJson(res, status, { success: false, code, message: error.message || '提交失败，请稍后重试。' });
  }
}

function sendJson(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === '/') pathname = '/index.html';
  const filePath = path.resolve(__dirname, `.${pathname}`);
  if (!filePath.startsWith(__dirname) || filePath.includes(`${path.sep}data${path.sep}`) || filePath.includes(`${path.sep}.env`)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
    const type = MIME_TYPES[path.extname(filePath)] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type });
    res.end(data);
  });
}

await initDb();

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/api/leads/diagnostic') {
    handleLeadSubmit(req, res);
    return;
  }
  if (req.method === 'GET') {
    serveStatic(req, res);
    return;
  }
  res.writeHead(405);
  res.end('Method Not Allowed');
});

server.listen(PORT, '127.0.0.1', () => {
  logSafe(`Runxu Tech V2.0 server listening`, { url: `http://127.0.0.1:${PORT}/` });
});
