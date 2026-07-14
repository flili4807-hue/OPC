import type { LeadRecord } from "./types";

export async function syncLeadToFeishu(lead: LeadRecord) {
  const appId = process.env.FEISHU_APP_ID;
  const appSecret = process.env.FEISHU_APP_SECRET;
  const bitableToken = process.env.BITABLE_TOKEN;
  const tableId = process.env.BITABLE_TABLE_ID;
  if (!appId || !appSecret || !bitableToken || !tableId) {
    return { skipped: true, reason: "Feishu env vars are not configured" };
  }

  const tokenRes = await fetch("https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ app_id: appId, app_secret: appSecret })
  });
  const tokenJson = await tokenRes.json();
  if (!tokenJson.tenant_access_token) throw new Error("Failed to get Feishu tenant token");

  const record = {
    fields: {
      客户名称: lead.contact.company,
      公司: lead.contact.company,
      联系人: lead.contact.contactName,
      职位: lead.contact.title,
      手机号: lead.contact.phone,
      邮箱: lead.contact.email,
      项目类型: lead.contact.projectType,
      员工规模: lead.contact.employeeScale,
      项目阶段: lead.contact.projectStage,
      DSI评分: lead.dsiResult?.total ?? 0,
      CMMI等级: lead.cmmiResult?.levelName ?? "",
      购买状态: lead.purchaseStatus,
      销售状态: lead.salesStatus,
      跟进记录: lead.notes.join("\n")
    }
  };

  const res = await fetch(`https://open.feishu.cn/open-apis/bitable/v1/apps/${bitableToken}/tables/${tableId}/records`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${tokenJson.tenant_access_token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(record)
  });
  if (!res.ok) throw new Error(`Feishu sync failed: ${res.status}`);
  return res.json();
}
