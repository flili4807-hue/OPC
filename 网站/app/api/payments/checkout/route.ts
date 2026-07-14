import { NextResponse } from "next/server";
import { createCheckout, type PaymentProvider } from "@/lib/payments";

export async function POST(request: Request) {
  const body = await request.json();
  const checkout = await createCheckout((body.provider ?? "mock") as PaymentProvider, body.leadId);
  return NextResponse.json(checkout);
}
