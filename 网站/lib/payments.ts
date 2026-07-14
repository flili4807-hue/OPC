export type PaymentProvider = "wechat" | "alipay" | "stripe" | "mock";

export async function createCheckout(provider: PaymentProvider, leadId?: string) {
  const amount = 99900;
  if (provider === "stripe" && process.env.STRIPE_SECRET_KEY) {
    return { provider, amount, status: "reserved", message: "Stripe checkout integration placeholder", leadId };
  }
  if (provider === "wechat" && process.env.WECHAT_PAY_MCH_ID) {
    return { provider, amount, status: "reserved", message: "WeChat Pay integration placeholder", leadId };
  }
  if (provider === "alipay" && process.env.ALIPAY_APP_ID) {
    return { provider, amount, status: "reserved", message: "Alipay integration placeholder", leadId };
  }
  return { provider: "mock", amount, status: "pending", checkoutUrl: `/service?checkout=mock&leadId=${leadId ?? ""}` };
}
