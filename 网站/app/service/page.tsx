"use client";

import { useState } from "react";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export default function ServicePage() {
  const [checkout, setCheckout] = useState("");
  const [canStartDiagnosis, setCanStartDiagnosis] = useState(false);

  async function buy(provider: string) {
    const res = await fetch("/api/payments/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider })
    });
    const json = await res.json();
    setCheckout(`${json.provider} · ${json.status} · ¥${json.amount / 100}`);
    setCanStartDiagnosis(true);
  }

  return (
    <main>
      <Header />
      <section className="bg-ink py-16 text-white">
        <div className="mx-auto max-w-7xl px-5">
          <h1 className="text-4xl font-black">AI研发交付健康诊断服务</h1>
          <p className="mt-4 text-2xl font-bold text-cyan-200">999元</p>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-12 lg:grid-cols-[1fr_420px]">
        <div className="rounded-xl border border-white/10 bg-slate-900/80 p-8 text-white">
          <h2 className="text-2xl font-black">服务流程</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {["购买诊断服务", "填写项目诊断问卷", "专家访谈与报告交付"].map((item, index) => (
              <div key={item} className="rounded-lg border border-white/10 bg-white/5 p-5">
                <p className="text-xs font-black text-cyan-300">{String(index + 1).padStart(2, "0")}</p>
                <p className="mt-3 font-semibold">{item}</p>
              </div>
            ))}
          </div>
          <h2 className="mt-10 text-2xl font-black">服务包含</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {["1小时专家访谈", "项目健康度分析", "CMMI成熟度评估", "PDF诊断报告", "优化建议"].map((item) => (
              <div key={item} className="rounded-lg border border-white/10 bg-white/5 p-5 font-semibold text-slate-200">{item}</div>
            ))}
          </div>
        </div>
        <aside className="h-fit rounded-xl border border-cyan-300/30 bg-slate-900/80 p-6 text-white shadow-panel">
          <h2 className="text-xl font-bold">购买服务</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">完成购买后进入项目诊断问卷，问卷结果会进入后台销售池和诊断报告流程。</p>
          <div className="mt-5 grid gap-3">
            <button onClick={() => buy("wechat")} className="btn-primary">微信支付</button>
            <button onClick={() => buy("alipay")} className="rounded-lg border border-cyan-300/60 px-5 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/10">支付宝</button>
            <button onClick={() => buy("stripe")} className="rounded-lg border border-cyan-300/60 px-5 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/10">Stripe</button>
          </div>
          {checkout ? <p className="mt-4 rounded-lg bg-white/5 p-3 text-sm text-slate-300">{checkout}</p> : null}
          {canStartDiagnosis ? (
            <Link href="/diagnosis" className="mt-4 inline-flex w-full justify-center rounded-lg bg-amber-400 px-5 py-3 text-sm font-black text-ink transition hover:bg-amber-300">
              进入项目诊断问卷
            </Link>
          ) : null}
        </aside>
      </section>
      <Footer />
    </main>
  );
}
