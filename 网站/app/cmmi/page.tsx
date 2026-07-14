"use client";

import { useMemo, useState } from "react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { RadarChart } from "@/components/RadarChart";
import { cmmiRatingGuide, cmmiSurvey, scoreCmmi } from "@/lib/scoring";

const initialAnswers = Object.fromEntries(
  cmmiSurvey.flatMap((section) => section.questions.map((_, index) => [`${section.dimension}.${index}`, 1]))
);

export default function CmmiPage() {
  const [answers, setAnswers] = useState<Record<string, number>>(initialAnswers);
  const result = useMemo(() => scoreCmmi(answers), [answers]);
  const dimensionScores = useMemo(
    () =>
      cmmiSurvey.map((section) => {
        const score =
          section.questions.reduce((sum, _, index) => sum + (answers[`${section.dimension}.${index}`] ?? 1), 0) /
          section.questions.length;
        return { label: section.dimension.slice(0, 4), value: Number(score.toFixed(1)), max: 5 };
      }),
    [answers]
  );

  return (
    <main>
      <Header />
      <section className="bg-ink py-16 text-white">
        <div className="mx-auto max-w-7xl px-5">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">CMMI Assessment</p>
          <h1 className="mt-3 text-4xl font-black">CMMI研发成熟度评估</h1>
          <p className="mt-4 max-w-2xl text-slate-300">参考CMMI成熟度思想，评估组织在项目管理、需求、研发流程、质量和持续改进上的能力等级。</p>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-12 lg:grid-cols-[1fr_420px]">
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-bold">星级说明</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-5">
              {cmmiRatingGuide.map((guide, index) => (
                <div key={guide} className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                  <div className="mb-2 text-amber-500">{"★".repeat(index + 1)}</div>
                  {guide}
                </div>
              ))}
            </div>
          </div>

          {cmmiSurvey.map((section) => (
            <div key={section.dimension} className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-xl font-bold">{section.dimension}</h2>
                  <p className="mt-2 text-sm text-slate-600">{section.description}</p>
                </div>
                <p className="text-sm font-semibold text-cyan-700">
                  平均 {getSectionAverage(section.dimension, section.questions.length, answers).toFixed(1)} 星
                </p>
              </div>
              <div className="mt-5 space-y-4">
                {section.questions.map((question, index) => {
                  const id = `${section.dimension}.${index}`;
                  return (
                    <div key={question} className="rounded-lg bg-slate-50 p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <p className="text-sm font-medium leading-6 text-slate-800">{question}</p>
                        <StarRating value={answers[id] ?? 1} onChange={(value) => setAnswers({ ...answers, [id]: value })} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          </div>
        <aside className="h-fit rounded-xl border border-slate-200 bg-white p-6 shadow-panel">
          <h2 className="text-xl font-bold">评估输出</h2>
          <p className="mt-4 text-3xl font-black text-cyan-700">{result.levelName}</p>
          <p className="mt-1 text-sm font-semibold text-slate-500">综合成熟度 {result.average} / 5</p>
          <p className="mt-3 text-slate-600">{result.summary}</p>
          <div className="mt-5 aspect-square">
            <RadarChart data={dimensionScores} />
          </div>
          <div className="mt-5 rounded-xl border border-cyan-100 bg-cyan-50/60 p-4">
            <h3 className="text-base font-bold text-slate-950">优先改进建议</h3>
            <p className="mt-1 text-sm text-slate-600">根据低分能力域自动生成，用于指导下一步流程建设和咨询沟通。</p>
            <ol className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
              {result.suggestions.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-0.5 h-5 min-w-5 rounded-full bg-cyan-600 text-center text-xs font-bold leading-5 text-white">
                    {result.suggestions.indexOf(item) + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </div>
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

function getSectionAverage(dimension: string, count: number, answers: Record<string, number>) {
  let total = 0;
  for (let index = 0; index < count; index += 1) {
    total += answers[`${dimension}.${index}`] ?? 1;
  }
  return total / count;
}
