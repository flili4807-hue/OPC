import type { CmmiAnswers, CmmiResult, DsiAnswers, DsiDimensionKey, DsiResult } from "./types";

export const dsiRatingGuide = [
  "1星：缺失或主要依赖个人经验",
  "2星：有局部动作，但不稳定、不可持续",
  "3星：已有基本机制，能支撑常规项目",
  "4星：机制稳定，并能跨角色协同执行",
  "5星：数据化、可预测，并能持续优化"
];

export const dsiDimensions: Array<{ key: DsiDimensionKey; name: string; description: string; questions: string[]; advice: string }> = [
  {
    key: "goals",
    name: "目标与需求管理",
    description: "判断项目是否有清晰目标、业务价值、需求基线和变更控制。",
    questions: [
      "项目目标是否清晰，并被业务、产品、研发、测试等核心角色共同理解？",
      "是否定义可衡量的业务成功指标，例如转化率、效率、收入、成本或用户体验？",
      "核心需求、PRD或用户故事是否经过跨角色评审，并形成明确结论？",
      "需求变更是否经过影响分析、优先级判断、审批和版本记录？"
    ],
    advice: "补齐目标、指标、PRD评审和变更控制机制，避免需求漂移。"
  },
  {
    key: "planning",
    name: "计划与资源管理",
    description: "判断项目计划是否可信，资源、里程碑和关键路径是否可控。",
    questions: [
      "项目是否有完整计划，覆盖范围、里程碑、任务拆解、依赖和交付节奏？",
      "关键里程碑是否有明确交付标准、验收责任人和延期预案？",
      "是否识别关键路径、外部依赖、资源瓶颈和不可压缩工期？",
      "人力、技术、预算和业务资源是否与项目目标和交付周期匹配？"
    ],
    advice: "建立里程碑、关键路径和资源容量视图，提升计划可执行性。"
  },
  {
    key: "engineering",
    name: "技术研发治理",
    description: "判断技术方案、研发风险、质量标准和AI效果评估是否充分。",
    questions: [
      "关键技术方案是否经过架构、性能、安全、成本和可维护性评审？",
      "是否识别技术风险，并制定验证方案、降级方案或替代方案？",
      "是否定义质量指标，例如缺陷密度、自动化覆盖率、稳定性、性能和安全指标？",
      "AI项目是否定义模型效果、数据质量、评测集、上线监控和回滚标准？"
    ],
    advice: "引入技术评审、风险台账、质量门禁和AI效果评估基线。"
  },
  {
    key: "collaboration",
    name: "协作流程管理",
    description: "判断跨团队协作、风险升级、项目工具和SOP是否形成闭环。",
    questions: [
      "项目是否建立从需求、设计、开发、测试到上线的端到端协作流程？",
      "是否有固定的风险识别、问题升级、决策同步和阻塞清理机制？",
      "项目管理工具中的任务、责任人、状态、风险和依赖是否持续更新？",
      "高频交付动作是否沉淀为SOP、模板或检查清单，降低重复沟通成本？"
    ],
    advice: "沉淀跨角色协作流程和SOP，让交付过程可复制、可审计。"
  },
  {
    key: "metrics",
    name: "数据度量体系",
    description: "判断项目是否通过数据看清进度、质量、风险和改进效果。",
    questions: [
      "是否定义研发效能、交付质量、进度偏差、风险暴露和业务结果指标？",
      "是否有项目Dashboard，实时呈现进度、缺陷、阻塞、风险和资源状态？",
      "是否定期复盘项目偏差、线上问题、协作瓶颈和决策质量？",
      "复盘结论是否沉淀为组织资产，并在后续项目中复用和验证？"
    ],
    advice: "建设研发效能指标、项目看板和复盘资产库，形成持续改进闭环。"
  }
];

export const cmmiDimensions = ["项目管理", "需求管理", "研发流程", "质量管理", "配置管理", "度量分析", "持续改进"];

export const cmmiRatingGuide = [
  "1星：依赖个人经验，过程不可预测",
  "2星：项目层面已管理，有基本计划和跟踪",
  "3星：组织级流程已定义，有标准模板和SOP",
  "4星：通过数据量化管理，可预测质量和交付",
  "5星：持续优化，并可引入AI智能改进"
];

export const cmmiSurvey = [
  {
    dimension: "项目管理",
    description: "评估项目计划、跟踪、风险和干系人管理是否形成稳定机制。",
    questions: [
      "项目启动时是否形成明确的范围、目标、里程碑和交付物定义？",
      "项目计划是否持续维护，并能反映资源、进度、风险和依赖变化？",
      "项目执行过程是否有固定节奏的跟踪、预警、决策和升级机制？",
      "项目结项是否进行复盘，并将经验沉淀为后续项目资产？"
    ]
  },
  {
    dimension: "需求管理",
    description: "评估需求从提出、分析、评审、变更到验收的闭环能力。",
    questions: [
      "需求是否有统一入口、责任人、优先级和业务价值说明？",
      "PRD或用户故事是否经过跨角色评审，并形成可追溯结论？",
      "需求变更是否经过影响分析、审批和版本记录？",
      "需求是否能追溯到设计、开发、测试、上线和业务结果？"
    ]
  },
  {
    dimension: "研发流程",
    description: "评估研发过程是否标准化、可复制，并能覆盖AI项目特点。",
    questions: [
      "团队是否定义了从需求到上线的标准研发流程和准入准出标准？",
      "技术方案、接口设计、代码评审和发布流程是否有明确规范？",
      "研发流程是否能适配敏捷迭代、跨团队协作和紧急需求处理？",
      "AI项目是否包含数据、模型、评测、上线监控等专门流程？"
    ]
  },
  {
    dimension: "质量管理",
    description: "评估质量标准、测试策略、缺陷治理和发布门禁能力。",
    questions: [
      "项目是否在早期定义质量目标、测试策略和验收标准？",
      "缺陷是否按严重级别、根因、责任环节和修复时效进行管理？",
      "上线前是否有稳定的质量门禁、回归测试和发布评审机制？",
      "线上问题是否复盘并反向改进需求、设计、开发和测试流程？"
    ]
  },
  {
    dimension: "配置管理",
    description: "评估代码、文档、环境、版本和发布资产是否受控。",
    questions: [
      "代码、文档、配置、模型和数据资产是否有统一版本管理？",
      "环境配置、发布包和依赖版本是否可追溯、可回滚？",
      "权限、分支、变更和发布记录是否符合团队治理要求？",
      "关键交付资产是否形成组织级模板、基线和复用机制？"
    ]
  },
  {
    dimension: "度量分析",
    description: "评估团队是否用数据衡量效率、质量、风险和交付结果。",
    questions: [
      "团队是否定义研发效能、质量、交付和业务结果指标？",
      "是否有项目Dashboard展示进度、风险、缺陷、吞吐和阻塞？",
      "是否定期基于数据分析交付偏差、质量趋势和效率瓶颈？",
      "指标是否用于预测风险、辅助决策，而不仅是事后统计？"
    ]
  },
  {
    dimension: "持续改进",
    description: "评估组织是否具备复盘、改进闭环和AI增强治理能力。",
    questions: [
      "团队是否定期开展项目复盘，并形成可执行改进项？",
      "改进项是否有责任人、截止时间、验证标准和效果追踪？",
      "组织是否沉淀流程资产、最佳实践、检查清单和培训机制？",
      "是否使用AI Agent辅助PRD检查、周报、风险识别和项目治理？"
    ]
  }
];

const cmmiImprovementAdvice: Record<string, string> = {
  项目管理: "项目管理：建立项目章程、里程碑计划、风险台账和例会节奏，确保范围、进度、依赖和决策可跟踪。",
  需求管理: "需求管理：统一需求入口，补齐PRD评审、变更影响分析和需求到上线结果的追溯链路。",
  研发流程: "研发流程：明确需求、设计、开发、测试、发布的准入准出标准，并沉淀技术评审和发布检查清单。",
  质量管理: "质量管理：定义质量目标、测试策略、缺陷分级、上线门禁和线上问题复盘机制。",
  配置管理: "配置管理：统一代码、文档、配置、环境和发布资产版本管理，确保关键变更可追溯、可回滚。",
  度量分析: "度量分析：建设项目Dashboard，跟踪进度偏差、缺陷趋势、吞吐效率、阻塞项和风险暴露。",
  持续改进: "持续改进：把复盘结论转为改进项，明确责任人、截止时间和验证标准，并沉淀组织级资产。"
};

export function scoreDsi(answers: DsiAnswers): DsiResult {
  const dimensions = dsiDimensions.map((dimension) => {
    const values = answers[dimension.key] ?? [];
    const raw = values.reduce((sum, value) => sum + Number(value || 0), 0);
    const score = Math.max(0, Math.min(20, Math.round(((raw - 4) / 16) * 20)));
    return { key: dimension.key, name: dimension.name, score, max: 20, advice: dimension.advice };
  });
  const total = dimensions.reduce((sum, item) => sum + item.score, 0);
  const level = total >= 90 ? "优秀" : total >= 70 ? "健康" : total >= 50 ? "亚健康" : "高风险";
  const weak = dimensions.filter((item) => item.score < 14);
  return {
    total,
    level,
    dimensions,
    risks: weak.length
      ? weak.map((item) => `${item.name}低于健康线，可能影响项目成功率。`)
      : ["当前五大维度均达到健康线，建议继续用数据化方式跟踪趋势。"],
    suggestions: weak.length
      ? weak.map((item) => item.advice)
      : ["将当前治理实践沉淀为组织级模板，并引入AI Agent自动检查、提醒和复盘。"]
  };
}

export function scoreCmmi(answers: CmmiAnswers): CmmiResult {
  const dimensionScores = Object.fromEntries(
    cmmiSurvey.map((section) => {
      const values = section.questions
        .map((_, index) => Number(answers[`${section.dimension}.${index}`] ?? answers[section.dimension] ?? 1))
        .filter(Boolean);
      const average = values.reduce((sum, value) => sum + value, 0) / values.length;
      return [section.dimension, Number(average.toFixed(1))];
    })
  );
  const values = Object.values(dimensionScores).map(Number).filter(Boolean);
  const average = values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 1;
  const level = Math.max(1, Math.min(5, Math.floor(average + 0.25)));
  const levelMap: Record<number, { name: string; summary: string }> = {
    1: { name: "Level 1 初始级", summary: "流程依赖个人经验，项目结果不可预测。" },
    2: { name: "Level 2 已管理级", summary: "项目层面具备计划、需求管理和项目跟踪能力。" },
    3: { name: "Level 3 已定义级", summary: "组织级流程、SOP和标准模板已逐步建立。" },
    4: { name: "Level 4 量化管理级", summary: "通过数据度量和质量预测管理研发交付。" },
    5: { name: "Level 5 优化级", summary: "持续改进机制成熟，并可引入AI智能优化。" }
  };
  const weak = cmmiDimensions.filter((dimension) => (dimensionScores[dimension] ?? 1) < Math.max(3, level));
  return {
    level,
    levelName: levelMap[level].name,
    average: Number(average.toFixed(1)),
    summary: levelMap[level].summary,
    suggestions: weak.length
      ? weak.map((dimension) => cmmiImprovementAdvice[dimension])
      : ["继续推动量化管理、组织级复盘和AI辅助治理，提升持续优化能力。"]
  };
}
