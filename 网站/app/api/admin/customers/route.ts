import { NextResponse } from "next/server";
import { listLeads, updateLeadStatus } from "@/lib/store";
import type { LeadRecord } from "@/lib/types";

export async function GET() {
  const leads = await listLeads();
  return NextResponse.json({ leads });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const lead = await updateLeadStatus(body.id, body.salesStatus as LeadRecord["salesStatus"]);
  return NextResponse.json({ lead });
}
