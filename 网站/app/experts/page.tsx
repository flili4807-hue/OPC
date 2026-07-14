import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

const projects = ["抖音世界杯", "春晚直播", "亚运会", "云游戏", "大模型训练平台", "多模态AI", "Agent平台"];
const skills = ["PMO体系建设", "CMMI认证", "研发效能提升", "AI项目治理"];
const honors = ["字节跳动集团奖", "Spotbonus优秀个人", "Spotbonus优秀项目奖", "360优秀个人"];

export default function ExpertsPage() {
  return (
    <main>
      <Header />
      <section className="bg-ink py-16 text-white">
        <div className="mx-auto max-w-7xl px-5">
          <h1 className="text-4xl font-black">专家团队</h1>
          <p className="mt-4 text-xl text-cyan-200">AI研发交付治理专家</p>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-12 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-bold">经验背景</h2>
          <p className="mt-4 text-slate-600">8年研发技术经验，10年以上互联网项目管理经验，覆盖大型互联网项目、AI平台和企业级研发治理。</p>
        </div>
        {[["项目经历", projects], ["核心能力", skills], ["荣誉", honors]].map(([title, items]) => (
          <div key={title as string} className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-bold">{title as string}</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {(items as string[]).map((item) => <span key={item} className="rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">{item}</span>)}
            </div>
          </div>
        ))}
      </section>
      <Footer />
    </main>
  );
}
