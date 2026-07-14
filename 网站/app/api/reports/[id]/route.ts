import { NextResponse } from "next/server";
import { generateReportPdf } from "@/lib/pdf";
import { getLead } from "@/lib/store";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const lead = await getLead(params.id);
  if (!lead) return NextResponse.json({ error: "报告不存在" }, { status: 404 });
  const pdf = await generateReportPdf(lead);
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="deliveryos-diagnostic-${lead.id}.pdf"`
    }
  });
}
