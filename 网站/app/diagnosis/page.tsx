"use client";

import { useMemo, useState } from "react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { RadarChart } from "@/components/RadarChart";
import { dsiDimensions, dsiRatingGuide, scoreDsi, cmmiDimensions } from "@/lib/scoring";
import type { ContactInfo, DsiAnswers } from "@/lib/types";

const defaultContact: ContactInfo = {
  company: "",
  contactName: "",
  phone: "",
  email: "",
  title: "",
  projectType: "AI项目",
  employeeScale: "50-200人",
  projectStage: "规划中",
  source: "DSI诊断"
};

const initialAnswers = Object.fromEntries(dsiDimensions.map((dimension) => [dimension.key, [1, 1, 1, 1]])) as DsiAnswers;

export default function DiagnosisPage() {
  const [contact, setContact] = useState(defaultContact);
  const [answers, setAnswers] = useState<DsiAnswers>(initialAnswers);
  const [reportUrl, setReportUrl] = useState("");
  const result = useMemo(() => scoreDsi(answers), [answers]);

  async function submit() {
    const cmmiAnswers = Object.fromEntries(cmmiDimensions.map((item) => [item, 2]));
    const res = await fetch("/api/diagnostics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contact, dsiAnswers: answers, cmmiAnswers })
    });
    const json = await res.json();
    if (json.reportUrl) setReportUrl(json.reportUrl);
  }

  return (
    <main>
      <Header />
      <section className="bg-ink py-16 text-white">
        <div className="mx-auto max-w-7xl px-5">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">DeliveryOS DSI</p>
          <h1 className="mt-3 text-4xl font-black">项目成功率诊断</h1>
          <p className="mt-4 max-w-2xl text-slate-300">五大维度、二十个问题，快速识别研发交付风险并生成PDF诊断报告。</p>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-12 lg:grid-cols-[1fr_420px]">
        <div className="space-y-8">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-bold">企业信息</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {[
                ["company", "公司名称"],
                ["contactName", "联系人"],
                ["phone", "联系电话"],
                ["email", "邮箱"],
                ["title", "职务"],
                ["projectType", "项目类型"],
                ["employeeScale", "员工规模"],
                ["projectStage", "项目阶段"]
              ].map(([key, label]) => (
                <label key={key} className="grid gap-2">
                  <span className="label">{label}</span>
                  <input className="field" value={(contact as any)[key]} onChange={(event) => setContact({ ...contact, [key]: event.target.value })} />
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-bold">星级说明</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-5">
              {dsiRatingGuide.map((guide, index) => (
                <div key={guide} className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                  <div className="mb-2 text-amber-500">{"★".repeat(index + 1)}</div>
                  {guide}
                </div>
              ))}
            </div>
          </div>

          {dsiDimensions.map((dimension) => (
            <div key={dimension.key} className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-xl font-bold">{dimension.name}</h2>
                  <p className="mt-2 text-sm text-slate-600">{dimension.description}</p>
                </div>
                <p className="text-sm font-semibold text-cyan-700">
                  {result.dimensions.find((item) => item.key === dimension.key)?.score ?? 0} / 20
                </p>
              </div>
              <div className="mt-5 space-y-4">
                {dimension.questions.map((question, index) => (
                  <div key={question} className="rounded-lg bg-slate-50 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <span className="text-sm font-medium leading-6 text-slate-800">{question}</span>
                      <StarRating
                        value={answers[dimension.key][index] ?? 1}
                        onChange={(value) => {
                          const next = { ...answers, [dimension.key]: [...answers[dimension.key]] };
                          next[dimension.key][index] = value;
                          setAnswers(next);
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <aside className="h-fit rounded-xl border border-slate-200 bg-white p-6 shadow-panel lg:sticky lg:top-24">
          <h2 className="text-xl font-bold">实时诊断结果</h2>
          <div className="mt-4 text-5xl font-black text-cyan-700">{result.total}</div>
          <p className="mt-2 text-lg font-semibold text-slate-900">{result.level}</p>
          <div className="mt-5 aspect-square">
            <RadarChart data={result.dimensions.map((item) => ({ label: item.name.slice(0, 4), value: item.score, max: item.max }))} />
          </div>
          <div className="mt-5 space-y-2 text-sm text-slate-600">
            {result.suggestions.slice(0, 3).map((item) => <p key={item}>{item}</p>)}
          </div>
          <button onClick={submit} className="btn-primary mt-6 w-full">提交并生成PDF报告</button>
          {reportUrl ? <a href={reportUrl} className="btn-secondary mt-3 w-full">下载诊断报告</a> : null}
        </aside>
      </section>
      <Footer />
    </main>
  );
}

function StarRating({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <div className="flex shrink-0 gap-1" aria-label={`${value}星`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`h-9 w-9 text-2xl leading-none transition ${star <= value ? "text-amber-400" : "text-slate-300 hover:text-amber-300"}`}
          aria-label={`${star}星`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
