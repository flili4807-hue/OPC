"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import type { LeadRecord } from "@/lib/types";

export default function CustomerDetailPage({ params }: { params: { id: string } }) {
  const [lead, setLead] = useState<LeadRecord | null>(null);

  useEffect(() => {
    fetch(`/api/admin/customers/${params.id}`)
      .then((res) => res.json())
      .then((json) => setLead(json.lead ?? null));
  }, [params.id]);

  return (
    <main>
      <Header />
      <section className="mx-auto max-w-5xl px-5 py-10">
        {!lead ? <p className="text-slate-500">加载中...</p> : (
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h1 className="text-3xl font-black">{lead.contact.company}</h1>
              <p className="mt-2 text-slate-600">{lead.contact.contactName} / {lead.contact.title} / {lead.contact.phone}</p>
              <a href={`/api/reports/${lead.id}`} className="btn-primary mt-5">下载PDF报告</a>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <Panel title="评分结果" data={{ DSI: lead.dsiResult, CMMI: lead.cmmiResult }} />
              <Panel title="问卷答案" data={{ dsiAnswers: lead.dsiAnswers, cmmiAnswers: lead.cmmiAnswers }} />
              <Panel title="客户沟通记录" data={lead.notes} />
              <Panel title="销售信息" data={{ purchaseStatus: lead.purchaseStatus, salesStatus: lead.salesStatus }} />
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function Panel({ title, data }: { title: string; data: unknown }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-xl font-bold">{title}</h2>
      <pre className="mt-4 max-h-96 overflow-auto rounded-lg bg-slate-950 p-4 text-xs text-slate-100">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
