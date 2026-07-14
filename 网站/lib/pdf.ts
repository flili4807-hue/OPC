import PDFDocument from "pdfkit";
import type { LeadRecord } from "./types";

export async function generateReportPdf(lead: LeadRecord): Promise<Buffer> {
  const doc = new PDFDocument({ size: "A4", margin: 48 });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk) => chunks.push(chunk));
  const done = new Promise<Buffer>((resolve) => doc.on("end", () => resolve(Buffer.concat(chunks))));

  const fontPath = process.env.PDF_FONT_PATH;
  if (fontPath) {
    doc.registerFont("cn", fontPath);
    doc.font("cn");
  }

  pageTitle(doc, "企业研发交付健康度诊断报告");
  kv(doc, "企业", lead.contact.company);
  kv(doc, "联系人", `${lead.contact.contactName} / ${lead.contact.title}`);
  kv(doc, "手机号", lead.contact.phone);
  kv(doc, "邮箱", lead.contact.email);
  kv(doc, "项目类型", lead.contact.projectType);

  doc.addPage();
  pageTitle(doc, "项目成功率评分");
  doc.fontSize(32).fillColor("#0f766e").text(`${lead.dsiResult?.total ?? 0} / 100`);
  doc.fontSize(16).fillColor("#111827").text(`健康等级：${lead.dsiResult?.level ?? "未评估"}`);

  doc.addPage();
  pageTitle(doc, "五维分析");
  lead.dsiResult?.dimensions.forEach((item) => {
    doc.fontSize(13).fillColor("#111827").text(`${item.name}: ${item.score}/${item.max}`);
    doc.fontSize(10).fillColor("#4b5563").text(item.advice, { paragraphGap: 8 });
  });

  doc.addPage();
  pageTitle(doc, "CMMI成熟度结果");
  doc.fontSize(22).fillColor("#1d4ed8").text(lead.cmmiResult?.levelName ?? "未评估");
  doc.fontSize(12).fillColor("#374151").text(lead.cmmiResult?.summary ?? "");

  doc.addPage();
  pageTitle(doc, "风险分析");
  (lead.dsiResult?.risks ?? ["暂无风险数据"]).forEach((risk) => doc.fontSize(12).fillColor("#374151").text(`- ${risk}`, { paragraphGap: 6 }));

  doc.addPage();
  pageTitle(doc, "优化建议");
  [...(lead.dsiResult?.suggestions ?? []), ...(lead.cmmiResult?.suggestions ?? [])].forEach((item) =>
    doc.fontSize(12).fillColor("#374151").text(`- ${item}`, { paragraphGap: 6 })
  );

  doc.addPage();
  pageTitle(doc, "推荐服务方案");
  doc.fontSize(14).fillColor("#111827").text("AI研发交付健康诊断服务：999元");
  doc.fontSize(12).fillColor("#374151").text("包含1小时专家访谈、项目健康度分析、CMMI成熟度评估、PDF诊断报告和优化建议。");

  doc.end();
  return done;
}

function pageTitle(doc: PDFKit.PDFDocument, text: string) {
  doc.fontSize(22).fillColor("#0f172a").text(text, { paragraphGap: 24 });
}

function kv(doc: PDFKit.PDFDocument, key: string, value: string) {
  doc.fontSize(12).fillColor("#111827").text(`${key}：${value}`, { paragraphGap: 8 });
}
