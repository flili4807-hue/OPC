import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

const cases = [
  ["大型直播项目稳定性治理", "百万级流量保障，稳定交付"],
  ["研发效能体系建设", "研发效率提升20%+，线上问题下降70%+"],
  ["AI Agent项目治理", "建立AI项目交付流程"]
];

export default function CasesPage() {
  return (
    <main>
      <Header />
      <section className="bg-ink py-16 text-white">
        <div className="mx-auto max-w-7xl px-5">
          <h1 className="text-4xl font-black">案例中心</h1>
          <p className="mt-4 max-w-2xl text-slate-300">围绕稳定性、效能和AI项目治理，沉淀可复用的研发交付实践。</p>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-5 px-5 py-12 md:grid-cols-3">
        {cases.map(([title, result]) => (
          <article key={title} className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-bold text-slate-950">{title}</h2>
            <p className="mt-4 text-slate-600">{result}</p>
          </article>
        ))}
      </section>
      <Footer />
    </main>
  );
}
