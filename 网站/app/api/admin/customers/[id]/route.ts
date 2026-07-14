import { NextResponse } from "next/server";
import { getLead } from "@/lib/store";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const lead = await getLead(params.id);
  if (!lead) return NextResponse.json({ error: "客户不存在" }, { status: 404 });
  return NextResponse.json({ lead });
}
