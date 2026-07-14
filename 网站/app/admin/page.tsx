"use client";

import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import type { LeadRecord } from "@/lib/types";

export default function AdminPage() {
  const [leads, setLeads] = useState<LeadRecord[]>([]);

  useEffect(() => {
    fetch("/api/admin/customers")
      .then((res) => res.json())
      .then((json) => setLeads(json.leads ?? []));
  }, []);

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return {
      today: leads.filter((lead) => lead.createdAt.startsWith(today)).length,
      diagnostics: leads.filter((lead) => lead.dsiResult).length,
      purchases: leads.filter((lead) => lead.purchaseStatus === "已支付").length,
      revenue: leads.reduce((sum, lead) => sum + (lead.paymentAmount ?? 0), 0)
    };
  }, [leads]);

  return (
    <main>
      <Header />
      <section className="mx-auto max-w-7xl px-5 py-10">
        <h1 className="text-3xl font-black">客户增长后台</h1>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {[
            ["今日新增客户", stats.today],
            ["诊断数量", stats.diagnostics],
            ["购买数量", stats.purchases],
            ["收入金额", `¥${stats.revenue / 100}`]
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-5">
            <h2 className="text-xl font-bold">客户列表</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  {["客户名称", "联系方式", "DSI", "CMMI", "购买状态", "销售状态", "提交时间"].map((item) => <th key={item} className="px-4 py-3">{item}</th>)}
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-semibold"><a className="text-cyan-700 hover:underline" href={`/admin/customers/${lead.id}`}>{lead.contact.company}</a></td>
                    <td className="px-4 py-3">{lead.contact.contactName} / {lead.contact.phone}</td>
                    <td className="px-4 py-3">{lead.dsiResult?.total ?? "-"}</td>
                    <td className="px-4 py-3">{lead.cmmiResult?.levelName ?? "-"}</td>
                    <td className="px-4 py-3">{lead.purchaseStatus}</td>
                    <td className="px-4 py-3">{lead.salesStatus}</td>
                    <td className="px-4 py-3">{new Date(lead.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
                {!leads.length ? <tr><td className="px-4 py-8 text-slate-500" colSpan={7}>暂无客户数据，提交诊断问卷后会进入销售池。</td></tr> : null}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
