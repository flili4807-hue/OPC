import Link from "next/link";
import { ContactAssistant } from "@/components/ContactAssistant";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

const agents = ["PRD质量检查Agent", "项目周报Agent", "会议纪要Agent", "风险识别Agent", "研发经理Agent"];
const painSolutions = [
  {
    pain: "需求反复变更，目标不清",
    solution: "用DSI模型检查目标、指标、PRD评审和变更控制",
    href: "/diagnosis"
  },
  {
    pain: "项目计划看似完整，实际不断延期",
    solution: "识别关键路径、资源瓶颈、里程碑风险和延期预案",
    href: "/diagnosis"
  },
  {
    pain: "风险暴露太晚，管理层只能事后救火",
    solution: "AI Agent自动提取周报、会议纪要和阻塞项中的风险信号",
    href: "/#agent"
  },
  {
    pain: "研发流程靠经验，质量结果不可预测",
    solution: "用CMMI成熟度评估定位流程、质量、配置和度量短板",
    href: "/cmmi"
  },
  {
    pain: "项目复盘没有沉淀，下个项目重复踩坑",
    solution: "沉淀SOP、检查清单、度量看板和组织级改进资产",
    href: "/service"
  }
];

const industryCases = [
  {
    code: "LIVE-01",
    title: "大型直播项目稳定性治理",
    problem: "高并发场景下系统频繁抖动，跨团队协同链路长。",
    method: "全链路压测、容量评估、限流降级、灰度发布和风险预案。",
    result: "支撑百万级流量保障，重大节点稳定交付。"
  },
  {
    code: "GALA-02",
    title: "春晚级零容错交付工程",
    problem: "多团队协作、窗口期短、上线风险不可逆。",
    method: "统一指挥体系、分钟级预案、关键路径监控和发布门禁。",
    result: "复杂活动连续稳定交付，核心链路可控。"
  },
  {
    code: "ASIA-03",
    title: "亚运会多系统协同治理",
    problem: "跨系统、多场馆、多角色并行推进，信息同步成本高。",
    method: "统一数据台账、事件驱动协作、风险分层和复盘机制。",
    result: "多系统协作效率提升，交付过程透明可追踪。"
  },
  {
    code: "CMMI-04",
    title: "研发流程成熟度体系建设",
    problem: "研发过程依赖个人经验，度量体系缺失。",
    method: "CMMI能力域评估、SOP设计、质量门禁和持续改进机制。",
    result: "研发效率提升20%+，线上问题下降70%+。"
  },
  {
    code: "AI-05",
    title: "AI Agent系统交付治理",
    problem: "AI系统效果难评估，模型、数据、工程链路难以稳定上线。",
    method: "Agent链路设计、评测体系、上线门禁和交付治理闭环。",
    result: "AI项目交付过程可控，风险可解释。"
  }
];

const credentials = [
  ["字节跳动集团奖", "集团级表彰，认可复杂项目交付中的突出贡献"],
  ["360 OS 优秀个人", "操作系统级产品线优秀个人奖"],
  ["Spot Bonus 优秀团队奖", "多次获得，认可团队级项目治理与交付能力"],
  ["Spot Bonus 优秀个人奖", "个人级项目贡献表彰"]
];

const productSystem = [
  {
    title: "AI研发交付健康诊断",
    recommended: true,
    price: "999",
    items: ["项目成功率评估", "CMMI成熟度评估", "风险清单", "雷达图分析", "30天优化建议"],
    href: "/service"
  },
  {
    title: "PMO体系设计",
    items: ["流程设计", "组织治理", "度量体系", "交付标准", "团队培训"],
    href: "/experts"
  },
  {
    title: "系统交付治理陪跑",
    items: ["AI链路设计", "落地陪跑", "持续优化", "风险预警", "体系迭代"],
    href: "/service"
  }
];

const productCapabilities = [
  {
    layer: "诊断能力",
    title: "项目成功率诊断 DSI",
    desc: "用100分项目成功指数评估目标需求、计划资源、技术治理、协作流程和数据度量。",
    href: "/diagnosis"
  },
  {
    layer: "成熟度能力",
    title: "CMMI研发成熟度评估",
    desc: "基于项目管理、需求、研发流程、质量、配置、度量和持续改进七个能力域定位组织短板。",
    href: "/cmmi"
  },
  {
    layer: "Agent能力",
    title: "AI项目治理Agent",
    desc: "覆盖PRD检查、周报、会议纪要、风险识别和研发经理辅助，降低人工治理成本。",
    href: "/#agent"
  },
  {
    layer: "转化能力",
    title: "999元诊断服务",
    desc: "先购买诊断服务，再进入项目问卷，完成专家访谈、报告生成和后续咨询转化。",
    href: "/service"
  }
];

export default function HomePage() {
  return (
    <main>
      <Header />
      <section className="relative overflow-hidden bg-ink text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(34,211,238,.28),transparent_28%),radial-gradient(circle_at_78%_24%,rgba(124,58,237,.24),transparent_32%),linear-gradient(135deg,rgba(15,23,42,.15),rgba(8,13,25,.92))]" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent" />
        <div className="relative mx-auto flex min-h-[640px] max-w-6xl flex-col items-center justify-center px-5 py-20 text-center">
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.34em] text-cyan-200">DeliveryOS · AI Delivery Governance</p>
          <h1 className="max-w-5xl text-4xl font-black leading-tight md:text-6xl">AI时代，让研发交付从经验驱动走向智能治理</h1>
          <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-300">
              DeliveryOS通过AI Agent、PMO体系和CMMI成熟度模型，帮助企业提升项目成功率，实现研发交付数字化。
          </p>
          <div className="mt-8 flex max-w-3xl flex-wrap justify-center gap-3">
            {[
              ["100分", "项目成功指数"],
              ["5维", "交付健康诊断"],
              ["7域", "CMMI成熟度评估"],
              ["AI Agent", "治理自动化"]
            ].map(([value, label]) => (
              <div key={label} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 py-2">
                <p className="text-base font-black text-cyan-200">{value}</p>
                <p className="text-xs text-slate-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="product" className="relative overflow-hidden bg-ink py-24 text-white">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,.06)_1px,transparent_1px)] bg-[size:72px_72px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(34,211,238,.14),transparent_28%)]" />
        <div className="relative mx-auto max-w-7xl px-5">
          <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300">Operating System</p>
              <h2 className="mt-4 text-3xl font-black md:text-4xl">把研发交付治理变成可诊断、可度量、可改进的系统</h2>
            </div>
            <p className="text-lg leading-8 text-slate-400">
              DeliveryOS不是再增加一个项目管理工具，而是在客户已有工具之上增加诊断、规则、Agent和经营转化能力，让管理层能看清风险，让团队能复用方法。
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-4">
            {productCapabilities.map((item) => (
              <div key={item.title} className="rounded-xl border border-white/10 bg-slate-900/70 p-6 transition hover:border-cyan-300/60">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">{item.layer}</p>
                <h3 className="mt-4 font-black text-white">{item.title}</h3>
                <p className="mt-3 min-h-24 text-sm leading-6 text-slate-400">{item.desc}</p>
                <Link href={item.href} className="mt-5 inline-flex text-sm font-black text-cyan-200 hover:text-cyan-100">
                  了解详情 →
                </Link>
              </div>
            ))}
          </div>
          <div className="mt-10 rounded-xl border border-white/10 bg-slate-900/50 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">Typical Pain Coverage</p>
            <div className="mt-5 grid gap-3 md:grid-cols-5">
              {painSolutions.map((item, index) => (
                <Link key={item.pain} href={item.href} className="rounded-lg border border-white/10 bg-white/5 p-4 transition hover:border-cyan-300/60">
                  <p className="text-xs font-black text-cyan-300">{String(index + 1).padStart(2, "0")}</p>
                  <p className="mt-3 text-sm font-bold leading-6 text-white">{item.pain}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="agent" className="relative overflow-hidden bg-ink py-24 text-white">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/30 to-transparent" />
        <div className="mx-auto max-w-7xl px-5">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300">AI Agents</p>
            <h2 className="mt-4 text-3xl font-black md:text-4xl">AI项目治理Agent矩阵</h2>
            <p className="mt-4 text-lg text-slate-400">把项目经理、研发经理和PMO的高频治理动作产品化，降低人工跟踪和信息整理成本。</p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-5">
            {agents.map((agent, index) => (
              <div key={agent} className="rounded-xl border border-white/10 bg-slate-900/70 p-5">
                <p className="text-xs font-black text-cyan-300">{String(index + 1).padStart(2, "0")}</p>
                <p className="mt-4 font-black text-white">{agent}</p>
                <p className="mt-3 text-sm leading-6 text-slate-500">自动检查、提取、生成和预警，服务研发交付治理闭环。</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-ink py-24 text-white">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,.07)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,.07)_1px,transparent_1px)] bg-[size:72px_72px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(34,211,238,.12),transparent_35%)]" />
        <div className="relative mx-auto max-w-7xl px-5">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300">Industry Cases</p>
            <h2 className="mt-4 text-3xl font-black md:text-4xl">行业案例</h2>
            <p className="mt-4 text-lg text-slate-400">方法论已在大型复杂系统、直播活动、AI平台和研发流程建设中得到验证。</p>
          </div>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {industryCases.map((item) => (
              <article key={item.code} className="rounded-xl border border-white/10 bg-slate-900/70 p-6 shadow-panel">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">{item.code}</p>
                <h3 className="mt-4 text-xl font-black text-white">{item.title}</h3>
                <div className="mt-6 space-y-5 text-sm leading-7">
                  <CaseLine label="Problem" value={item.problem} tone="text-red-300" />
                  <CaseLine label="Method" value={item.method} tone="text-cyan-300" />
                  <CaseLine label="Result" value={item.result} tone="text-emerald-300" />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-ink py-24 text-white">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,.06)_1px,transparent_1px)] bg-[size:72px_72px]" />
        <div className="relative mx-auto max-w-6xl px-5">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300">Credentials</p>
            <h2 className="mt-4 text-3xl font-black md:text-4xl">企业级荣誉与实践经验</h2>
            <p className="mt-4 text-lg text-slate-400">多年一线产研体系实战，服务高复杂度、高稳定性要求的项目场景。</p>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {credentials.map(([title, desc], index) => (
              <div key={title} className={`rounded-xl border bg-slate-900/70 p-7 ${index === 0 ? "border-cyan-400/45" : "border-white/10"}`}>
                <div className="flex items-center gap-5">
                  <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-400/10 text-lg font-black text-cyan-200">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-xl font-black text-white">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-ink py-24 text-white">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,.06)_1px,transparent_1px)] bg-[size:72px_72px]" />
        <div className="relative mx-auto max-w-7xl px-5">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300">Product System</p>
            <h2 className="mt-4 text-3xl font-black md:text-4xl">产品体系</h2>
            <p className="mt-4 text-lg text-slate-400">从诊断到治理，覆盖产研体系建设全链路。</p>
          </div>
          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {productSystem.map((item) => (
              <div key={item.title} className={`rounded-xl border bg-slate-900/70 p-7 ${item.recommended ? "border-cyan-400/50" : "border-white/10"}`}>
                {item.recommended ? <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Recommended</p> : null}
                <h3 className="mt-3 text-2xl font-black text-white">{item.title}</h3>
                {"price" in item ? <p className="mt-6 text-4xl font-black text-white">{item.price}<span className="ml-2 text-sm font-semibold text-slate-500">元/次</span></p> : null}
                <ul className="mt-8 space-y-3 text-sm text-slate-400">
                  {item.items.map((entry) => (
                    <li key={entry} className="flex gap-3">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-cyan-300" />
                      <span>{entry}</span>
                    </li>
                  ))}
                </ul>
                <Link href={item.href} className={item.recommended ? "mt-8 inline-flex w-full justify-center rounded-lg bg-amber-400 px-5 py-3 text-sm font-black text-ink transition hover:bg-amber-300" : "mt-8 inline-flex w-full justify-center rounded-lg border border-cyan-300/70 px-5 py-3 text-sm font-black text-cyan-200 transition hover:bg-cyan-300/10"}>
                  {item.recommended ? "立即预约诊断" : "了解详情"}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ContactAssistant />
      <Footer />
    </main>
  );
}

function CaseLine({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div>
      <p className={`text-xs font-black uppercase tracking-[0.2em] ${tone}`}>{label}</p>
      <p className="mt-1 text-slate-300">{value}</p>
    </div>
  );
}
