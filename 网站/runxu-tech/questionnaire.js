const form = document.getElementById('diagnosticForm');
const scoreLabel = document.getElementById('scoreLabel');
const scoreValue = document.getElementById('scoreValue');
const scoreLevel = document.getElementById('scoreLevel');
const scoreBar = document.getElementById('scoreBar');
const scoreAdvice = document.getElementById('scoreAdvice');
const resultCta = document.getElementById('resultCta');

function getLevel(score) {
  if (score >= 85) return ['高成功概率 · CMMI L4-L5', '过程稳定，建议继续强化数据驱动和组织级最佳实践沉淀。'];
  if (score >= 70) return ['可控推进 · CMMI L3-L4', '项目基本可控，建议加强风险前置、发布门禁和复盘闭环。'];
  if (score >= 55) return ['需要治理 · CMMI L2-L3', '存在明显交付风险，建议优先补齐计划、依赖、风险和质量机制。'];
  if (score >= 40) return ['高风险 · CMMI L1-L2', '项目强依赖个人推动，建议先做项目治理重构再加速交付。'];
  return ['极高风险 · CMMI L1', '缺少基本管理控制，建议先完成目标、范围、组织和质量体系梳理。'];
}

function calculate() {
  const selects = [...form.querySelectorAll('select')];
  const values = selects.map((select) => Number(select.value));
  const score = Math.round((values.reduce((sum, value) => sum + value, 0) / (selects.length * 5)) * 100);

  const [level, advice] = getLevel(score);
  scoreLabel.textContent = '项目成功率得分';
  scoreValue.textContent = String(score);
  scoreLevel.textContent = level;
  scoreBar.style.width = `${score}%`;
  resultCta.hidden = false;
  scoreAdvice.textContent = `${advice} 建议带着评测结果预约一次 30 分钟项目诊断。`;
}

if (form) {
  form.addEventListener('change', calculate);
  calculate();
}
