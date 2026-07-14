import { NextResponse } from "next/server";
import { createLead } from "@/lib/store";
import { scoreCmmi, scoreDsi } from "@/lib/scoring";
import { syncLeadToFeishu } from "@/lib/feishu";
import type { CmmiAnswers, ContactInfo, DsiAnswers } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const contact = body.contact as ContactInfo;
    const dsiAnswers = body.dsiAnswers as DsiAnswers | undefined;
    const cmmiAnswers = body.cmmiAnswers as CmmiAnswers | undefined;
    if (!contact?.company || !contact?.contactName || !contact?.phone) {
      return NextResponse.json({ error: "缺少企业、联系人或手机号" }, { status: 400 });
    }
    const lead = await createLead({
      contact,
      dsiAnswers,
      dsiResult: dsiAnswers ? scoreDsi(dsiAnswers) : undefined,
      cmmiAnswers,
      cmmiResult: cmmiAnswers ? scoreCmmi(cmmiAnswers) : undefined,
      purchaseStatus: body.purchaseStatus ?? "未购买"
    });
    syncLeadToFeishu(lead).catch((error) => console.error("Feishu sync failed", error));
    return NextResponse.json({ lead, reportUrl: `/api/reports/${lead.id}` });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "提交失败" }, { status: 500 });
  }
}
