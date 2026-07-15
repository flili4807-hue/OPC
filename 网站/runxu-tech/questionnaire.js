const form = document.getElementById('diagnosticForm');
const scoreLabel = document.getElementById('scoreLabel');
const scoreValue = document.getElementById('scoreValue');
const scoreLevel = document.getElementById('scoreLevel');
const scoreBar = document.getElementById('scoreBar');
const scoreAdvice = document.getElementById('scoreAdvice');
const radarCanvas = document.getElementById('radarChart');
const radarEmptyHint = document.getElementById('radarEmptyHint');
const dimensionList = document.getElementById('dimensionList');
const weaknessList = document.getElementById('weaknessList');
const copyButton = document.getElementById('copySummary');
const manualSummaryWrap = document.getElementById('manualSummaryWrap');
const manualSummary = document.getElementById('manualSummary');
const openLeadFormButton = document.getElementById('openLeadForm');
const leadModal = document.getElementById('leadModal');
const leadForm = document.getElementById('leadForm');
const leadStatus = document.getElementById('leadStatus');
const submitLeadButton = document.getElementById('submitLead');
const privacyToggle = document.getElementById('privacyToggle');
const privacyPanel = document.getElementById('privacyPanel');
const unlockedReport = document.getElementById('unlockedReport');
const fullAdviceList = document.getElementById('fullAdviceList');
const nextActionText = document.getElementById('nextActionText');

const LEAD_DRAFT_KEY = 'runxu:v2:leadDraft';
const REQUEST_TIMEOUT_MS = 10000;
const STATIC_PAGE_HOSTS = ['github.io'];

const DIMENSIONS = [
  { key: 'A', name: '目标与范围', short: '目标', fields: ['A1', 'A2', 'A3'], advice: '优先明确业务目标、用户目标、成功指标、本期范围和不做事项。' },
  { key: 'B', name: '组织与职责', short: '组织', fields: ['B1', 'B2', 'B3'], advice: '建立项目 Owner、RACI 职责矩阵、跨团队依赖响应机制。' },
  { key: 'C', name: '需求与变更', short: '需求', fields: ['C1', 'C2', 'C3'], advice: '建立 PRD/原型/技术方案准入，明确变更评估、审批和排期影响。' },
  { key: 'D', name: '计划与风险', short: '计划', fields: ['D1', 'D2', 'D3'], advice: '建立里程碑、关键路径、风险台账、决策事项和回滚预案。' },
  { key: 'E', name: '质量与测试', short: '质量', fields: ['E1', 'E2', 'E3'], advice: '补齐测试计划、缺陷等级、准入准出、发布门禁和 Go/No-Go 机制。' },
  { key: 'F', name: '数据与效能', short: '数据', fields: ['F1', 'F2', 'F3'], advice: '建立进度、质量、效率、风险指标和可视化效能看板。' },
  { key: 'G', name: '工具链与流程', short: '工具', fields: ['G1', 'G2', 'G3'], advice: '将需求、任务、缺陷、风险、版本在线化管理，建立版本和 CI/CD 机制。' },
  { key: 'H', name: '复盘与持续改进', short: '复盘', fields: ['H1', 'H2', 'H3'], advice: '建立版本复盘、问题闭环、SOP 模板和知识库沉淀机制。' }
];

let latestResult = null;
let appState = 'locked';
let resizeTimer = null;
let copyTimer = null;

function getScoreLevel(score) {
  if (score >= 85) return { level: '高成功概率', cmmi: '参考映射：CMMI L4-L5', advice: '过程稳定，建议继续强化数据驱动和组织级最佳实践沉淀。' };
  if (score >= 70) return { level: '可控推进', cmmi: '参考映射：CMMI L3-L4', advice: '项目基本可控，建议加强风险前置、发布门禁和复盘闭环。' };
  if (score >= 55) return { level: '需要治理', cmmi: '参考映射：CMMI L2-L3', advice: '存在明显交付风险，建议优先补齐计划、依赖、风险和质量机制。' };
  if (score >= 40) return { level: '高风险', cmmi: '参考映射：CMMI L1-L2', advice: '项目强依赖个人推动，建议先做项目治理重构再加速交付。' };
  return { level: '极高风险', cmmi: '参考映射：CMMI L1', advice: '当前更适合先做基础治理梳理，建议优先明确目标、范围、组织职责和质量机制。' };
}

function getDimensionStatus(score) {
  if (score >= 85) return { status: '优势维度', statusClass: 'is-strong' };
  if (score >= 70) return { status: '稳定维度', statusClass: 'is-stable' };
  if (score >= 55) return { status: '待加强', statusClass: 'is-warning' };
  if (score >= 40) return { status: '风险维度', statusClass: 'is-risk' };
  return { status: '核心短板', statusClass: 'is-critical' };
}

function readAnswers() {
  const answers = {};
  form.querySelectorAll('select').forEach((select) => {
    answers[select.name] = Number(select.value || 0);
  });
  return answers;
}

function calculateResult(answers) {
  const values = Object.values(answers);
  const totalScore = Math.round((values.reduce((sum, value) => sum + value, 0) / 120) * 100);
  const scoreLevelInfo = getScoreLevel(totalScore);
  const dimensions = DIMENSIONS.map((dimension, index) => {
    const raw = dimension.fields.reduce((sum, field) => sum + (answers[field] || 0), 0);
    const score = Math.round((raw / 15) * 100);
    return { ...dimension, order: index, score, ...getDimensionStatus(score) };
  });
  const weaknesses = [...dimensions].sort((a, b) => (a.score - b.score) || (a.order - b.order)).slice(0, 3);
  const result = { totalScore, ...scoreLevelInfo, dimensions, weaknesses, answers };
  result.nextAction = generateNextAction(result);
  result.summaryText = generateSummary(result);
  return result;
}

function generateNextAction(result) {
  const names = result.weaknesses.map((item) => item.name).join('、');
  return `建议首次诊断优先围绕「${names}」展开，确认当前项目的治理断点、关键风险和 30 天内可落地的改进动作。`;
}

function renderScore(result) {
  scoreLabel.textContent = '项目成功率自评得分';
  scoreValue.textContent = String(result.totalScore);
  scoreLevel.textContent = `${result.level} · ${result.cmmi}`;
  scoreBar.style.width = `${result.totalScore}%`;
  scoreAdvice.textContent = `${result.advice} 提交咨询信息后，可查看完整治理建议和下一步诊断重点。`;
}

function renderDimensions(dimensions) {
  dimensionList.innerHTML = dimensions.map((dimension) => `
    <article class="dimension-item ${dimension.statusClass}">
      <div>
        <strong>${dimension.key}. ${dimension.name}</strong>
        <span>${dimension.status}</span>
      </div>
      <b>${dimension.score}</b>
      <i aria-hidden="true"><em style="width:${dimension.score}%"></em></i>
    </article>
  `).join('');
}

function renderWeaknesses(weaknesses) {
  const unlocked = appState === 'unlocked';
  weaknessList.innerHTML = weaknesses.map((dimension) => `
    <li>
      <div><strong>${dimension.name}</strong><span>${dimension.score} 分</span></div>
      <p>${unlocked ? dimension.advice : '提交咨询信息后查看完整治理建议。'}</p>
    </li>
  `).join('');
}

function renderUnlockedReport(result) {
  if (!unlockedReport || !fullAdviceList || !nextActionText) return;
  const unlocked = appState === 'unlocked';
  unlockedReport.hidden = !unlocked;
  if (!unlocked) return;
  fullAdviceList.innerHTML = result.weaknesses.map((dimension) => `
    <article>
      <strong><span>${dimension.name}</span><span>${dimension.score} 分 · ${dimension.status}</span></strong>
      <p>${dimension.advice}</p>
    </article>
  `).join('');
  nextActionText.textContent = result.nextAction;
}

function drawRadar(dimensions) {
  if (!radarCanvas) return;
  const rect = radarCanvas.getBoundingClientRect();
  const cssSize = Math.max(240, Math.round(Math.min(rect.width || 280, 320)));
  const ratio = window.devicePixelRatio || 1;
  radarCanvas.width = cssSize * ratio;
  radarCanvas.height = cssSize * ratio;
  radarCanvas.style.width = `${cssSize}px`;
  radarCanvas.style.height = `${cssSize}px`;

  const ctx = radarCanvas.getContext('2d');
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.clearRect(0, 0, cssSize, cssSize);

  const center = cssSize / 2;
  const radius = cssSize * 0.34;
  const labelRadius = radius + 30;
  const axisCount = dimensions.length;
  const startAngle = -Math.PI / 2;

  ctx.lineWidth = 1;
  ctx.font = '12px Inter, "PingFang SC", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (let layer = 1; layer <= 5; layer += 1) {
    const layerRadius = (radius / 5) * layer;
    ctx.beginPath();
    dimensions.forEach((_, index) => {
      const angle = startAngle + (Math.PI * 2 * index) / axisCount;
      const x = center + Math.cos(angle) * layerRadius;
      const y = center + Math.sin(angle) * layerRadius;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.strokeStyle = 'rgba(104, 163, 255, .18)';
    ctx.stroke();
  }

  dimensions.forEach((dimension, index) => {
    const angle = startAngle + (Math.PI * 2 * index) / axisCount;
    const axisX = center + Math.cos(angle) * radius;
    const axisY = center + Math.sin(angle) * radius;
    const labelX = center + Math.cos(angle) * labelRadius;
    const labelY = center + Math.sin(angle) * labelRadius;
    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.lineTo(axisX, axisY);
    ctx.strokeStyle = 'rgba(104, 163, 255, .24)';
    ctx.stroke();
    ctx.fillStyle = 'rgba(216, 228, 245, .92)';
    ctx.fillText(dimension.short, labelX, labelY);
  });

  ctx.beginPath();
  dimensions.forEach((dimension, index) => {
    const angle = startAngle + (Math.PI * 2 * index) / axisCount;
    const pointRadius = radius * (dimension.score / 100);
    const x = center + Math.cos(angle) * pointRadius;
    const y = center + Math.sin(angle) * pointRadius;
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fillStyle = 'rgba(57, 120, 255, .24)';
  ctx.strokeStyle = 'rgba(104, 163, 255, .95)';
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(center, center, 4, 0, Math.PI * 2);
  ctx.fillStyle = '#c9ff57';
  ctx.fill();
  radarEmptyHint.hidden = !dimensions.every((dimension) => dimension.score === 0);
}

function generateSummary(result) {
  const dimensionLines = result.dimensions.map((dimension) => `- ${dimension.name}：${dimension.score}`).join('\n');
  const weaknessLines = result.weaknesses.map((dimension, index) => `${index + 1}. ${dimension.name} ${dimension.score}：${dimension.advice}`).join('\n');
  return `【Runxu Tech 项目管理自评诊断摘要】
总分：${result.totalScore}
等级：${result.level} · ${result.cmmi}

8 维度得分：
${dimensionLines}

短板 Top 3：
${weaknessLines}

下一步建议：
${result.nextAction}

说明：本工具用于项目管理诊断沟通，不等同于官方 CMMI 评估或认证，不是完整解决方案。`;
}

function renderManualSummary(result, shouldShow = false) {
  if (!manualSummary || !manualSummaryWrap) return;
  manualSummary.value = result.summaryText;
  if (shouldShow) {
    manualSummaryWrap.hidden = false;
    manualSummary.focus();
    manualSummary.select();
  }
}

function calculateAndRender() {
  latestResult = calculateResult(readAnswers());
  renderScore(latestResult);
  renderDimensions(latestResult.dimensions);
  renderWeaknesses(latestResult.weaknesses);
  drawRadar(latestResult.dimensions);
  renderUnlockedReport(latestResult);
  renderManualSummary(latestResult, false);
}

async function copySummary() {
  if (!latestResult) calculateAndRender();
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable');
    await navigator.clipboard.writeText(latestResult.summaryText);
    copyButton.innerHTML = '已复制 <span>✓</span>';
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => {
      copyButton.innerHTML = appState === 'unlocked' ? '复制报告摘要 <span>↗</span>' : '复制当前摘要 <span>↗</span>';
    }, 1800);
  } catch (error) {
    renderManualSummary(latestResult, true);
  }
}

function saveLeadDraft() {
  if (!leadForm) return;
  const data = Object.fromEntries(new FormData(leadForm).entries());
  data.consent = leadForm.elements.consent.checked ? '1' : '';
  sessionStorage.setItem(LEAD_DRAFT_KEY, JSON.stringify(data));
}

function restoreLeadDraft() {
  if (!leadForm) return;
  try {
    const raw = sessionStorage.getItem(LEAD_DRAFT_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    ['name', 'company', 'contact', 'role', 'projectBackground'].forEach((key) => {
      if (data[key] !== undefined) leadForm.elements[key].value = data[key];
    });
    leadForm.elements.consent.checked = data.consent === '1';
  } catch (error) {
    sessionStorage.removeItem(LEAD_DRAFT_KEY);
  }
}

function setState(nextState) {
  appState = nextState;
  document.body.dataset.leadState = nextState;
  if (copyButton) {
    copyButton.innerHTML = nextState === 'unlocked' ? '复制报告摘要 <span>↗</span>' : '复制当前摘要 <span>↗</span>';
  }
  calculateAndRender();
}

function openLeadModal() {
  if (appState === 'unlocked') {
    unlockedReport?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }
  restoreLeadDraft();
  leadModal.hidden = false;
  setState('form_open');
  leadForm?.elements.name?.focus();
}

function closeLeadModal() {
  saveLeadDraft();
  leadModal.hidden = true;
  if (appState !== 'unlocked') setState('locked');
}

function clearErrors() {
  leadForm.querySelectorAll('.field-error').forEach((node) => { node.textContent = ''; });
  leadForm.querySelectorAll('.is-invalid').forEach((node) => node.classList.remove('is-invalid'));
  leadStatus.textContent = '';
  leadStatus.className = 'lead-status';
}

function setLeadStatus(type, message) {
  leadStatus.className = type ? `lead-status is-${type}` : 'lead-status';
  leadStatus.textContent = message;
}

function setSubmitButton(state) {
  if (!submitLeadButton) return;
  if (state === 'submitting') {
    submitLeadButton.disabled = true;
    submitLeadButton.innerHTML = '提交中，请稍候...';
    return;
  }
  if (state === 'success') {
    submitLeadButton.disabled = true;
    submitLeadButton.innerHTML = '已提交，正在打开报告 <span>✓</span>';
    return;
  }
  submitLeadButton.disabled = false;
  submitLeadButton.innerHTML = '提交并生成报告 <span>→</span>';
}

function setFieldError(field, message) {
  const error = leadForm.querySelector(`[data-error-for="${field}"]`);
  const input = leadForm.elements[field];
  if (error) error.textContent = message;
  if (input) input.classList.add('is-invalid');
}

function isValidContact(value) {
  const contact = value.trim();
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
  const mobile = /^1[3-9]\d{9}$/.test(contact);
  const feishu = /^[a-zA-Z0-9_-]{4,50}$/.test(contact) || /^飞书同(手机号|邮箱)$/.test(contact);
  return email || mobile || feishu;
}

function validateLeadForm() {
  clearErrors();
  const values = Object.fromEntries(new FormData(leadForm).entries());
  const errors = [];
  if (!values.name?.trim() || values.name.trim().length < 2) errors.push(['name', '请填写姓名']);
  if (!values.company?.trim() || values.company.trim().length < 2) errors.push(['company', '请填写公司或团队名称']);
  if (!values.contact?.trim()) errors.push(['contact', '请填写手机号、邮箱或飞书号']);
  else if (!isValidContact(values.contact)) errors.push(['contact', '请填写有效联系方式']);
  if (!values.projectBackground?.trim() || values.projectBackground.trim().length < 10) errors.push(['projectBackground', '请简单说明项目背景或当前困扰']);
  if (!leadForm.elements.consent.checked) errors.push(['consent', '请确认授权后生成诊断报告']);
  errors.forEach(([field, message]) => setFieldError(field, message));
  if (errors.length) leadForm.elements[errors[0][0]]?.focus?.();
  return { valid: errors.length === 0, values };
}

function buildDiagnosticPayload() {
  if (!latestResult) calculateAndRender();
  return {
    score: latestResult.totalScore,
    level: latestResult.level,
    cmmiReference: latestResult.cmmi,
    dimensions: latestResult.dimensions.map(({ key, name, score, status }) => ({ key, name, score, status })),
    weaknesses: latestResult.weaknesses.map(({ key, name, score, status, advice }) => ({ key, name, score, status, advice })),
    answers: latestResult.answers,
    nextAction: latestResult.nextAction
  };
}

async function postWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function isStaticHosting() {
  return window.location.protocol === 'file:'
    || STATIC_PAGE_HOSTS.some((host) => window.location.hostname.endsWith(host));
}

function unlockReportLocally() {
  sessionStorage.removeItem(LEAD_DRAFT_KEY);
  setState('unlocked');
  setSubmitButton('success');
  setLeadStatus('success', '提交成功，诊断报告已生成。正在为你打开报告...');
  window.setTimeout(() => {
    leadModal.hidden = true;
    unlockedReport?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 700);
}

async function submitLead(event) {
  event.preventDefault();
  if (appState === 'submitting' || submitLeadButton.disabled) return;
  const { valid, values } = validateLeadForm();
  if (!valid) return;
  saveLeadDraft();
  setState('submitting');
  setSubmitButton('submitting');
  setLeadStatus('', '正在提交并生成报告，请勿重复点击...');
  let shouldRestoreButton = true;

  const payload = {
    profile: {
      name: values.name.trim(),
      company: values.company.trim(),
      role: values.role?.trim() || '',
      contact: values.contact.trim(),
      projectBackground: values.projectBackground.trim(),
      consent: leadForm.elements.consent.checked
    },
    diagnostic: buildDiagnosticPayload(),
    clientMeta: {
      page: 'questionnaire.html',
      userAgent: navigator.userAgent,
      submittedAt: new Date().toISOString()
    }
  };

  try {
    const response = await postWithTimeout('/api/leads/diagnostic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }, REQUEST_TIMEOUT_MS);
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success || !data.reportUnlocked) {
      throw new Error(data.message || '提交失败，请稍后重试。');
    }
    sessionStorage.removeItem(LEAD_DRAFT_KEY);
    setLeadStatus('success', '提交成功，诊断报告已生成。我们已收到你的信息，将基于评测结果与你联系。');
    setSubmitButton('success');
    shouldRestoreButton = false;
    setState('unlocked');
    window.setTimeout(() => {
      leadModal.hidden = true;
      unlockedReport?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 900);
  } catch (error) {
    if (isStaticHosting()) {
      console.warn('[runxu] static hosting mode, unlock report locally:', error);
      unlockReportLocally();
      return;
    }
    setState('failed');
    setLeadStatus('error', error.name === 'AbortError' ? '提交超时，请稍后重试。你的填写内容已保留。' : (error.message || '提交失败，请稍后重试。你的填写内容已保留。'));
  } finally {
    if (shouldRestoreButton) setSubmitButton('default');
  }
}

function handleResize() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (latestResult) drawRadar(latestResult.dimensions);
  }, 150);
}

if (form) {
  form.addEventListener('change', () => {
    if (appState !== 'unlocked') appState = 'locked';
    calculateAndRender();
  });
  copyButton?.addEventListener('click', copySummary);
  openLeadFormButton?.addEventListener('click', openLeadModal);
  leadForm?.addEventListener('input', saveLeadDraft);
  leadForm?.addEventListener('change', saveLeadDraft);
  leadForm?.addEventListener('submit', submitLead);
  privacyToggle?.addEventListener('click', () => { privacyPanel.hidden = !privacyPanel.hidden; });
  leadModal?.addEventListener('click', (event) => {
    if (event.target.matches('[data-close-lead]')) closeLeadModal();
  });
  window.addEventListener('resize', handleResize);
  setState('locked');
}
