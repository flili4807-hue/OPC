import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

loadEnv(path.join(rootDir, '.env'));

const databasePath = path.resolve(rootDir, process.env.DATABASE_PATH || './data/runxu-leads.sqlite');
const exportDir = path.join(rootDir, 'data', 'exports');
const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 12);
const outputPath = path.join(exportDir, `leads-${stamp}.csv`);

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

function runSqlCsv(sql) {
  return new Promise((resolve, reject) => {
    const child = spawn('sqlite3', ['-header', '-csv', databasePath, sql], { stdio: ['ignore', 'pipe', 'pipe'] });
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

if (!fs.existsSync(databasePath)) {
  console.error(`数据库不存在：${databasePath}`);
  process.exit(1);
}

fs.mkdirSync(exportDir, { recursive: true });

const sql = `
SELECT
  lead_id AS leadId,
  created_at AS createdAt,
  company,
  name,
  role,
  contact,
  score,
  level,
  lead_quality AS leadQuality,
  duplicate,
  notify_email AS notifyEmail,
  notify_feishu AS notifyFeishu,
  notify_bitable AS notifyBitable,
  bitable_record_id AS bitableRecordId,
  bitable_error AS bitableError,
  project_background AS projectBackground
FROM diagnostic_leads
ORDER BY created_at DESC;
`;

const csv = await runSqlCsv(sql);
fs.writeFileSync(outputPath, csv, 'utf8');
console.log(outputPath);
