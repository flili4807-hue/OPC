import { randomUUID } from "crypto";
import { getSupabaseAdmin } from "./supabase";
import type { ContactInfo, LeadRecord } from "./types";

const memoryStore: LeadRecord[] = [];

export async function createLead(input: Partial<LeadRecord> & { contact: ContactInfo }) {
  const lead: LeadRecord = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    contact: input.contact,
    dsiAnswers: input.dsiAnswers,
    dsiResult: input.dsiResult,
    cmmiAnswers: input.cmmiAnswers,
    cmmiResult: input.cmmiResult,
    purchaseStatus: input.purchaseStatus ?? "未购买",
    salesStatus: input.salesStatus ?? "新客户",
    paymentAmount: input.paymentAmount,
    notes: input.notes ?? []
  };

  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { error } = await supabase.from("leads").insert({
      id: lead.id,
      created_at: lead.createdAt,
      contact: lead.contact,
      dsi_answers: lead.dsiAnswers,
      dsi_result: lead.dsiResult,
      cmmi_answers: lead.cmmiAnswers,
      cmmi_result: lead.cmmiResult,
      purchase_status: lead.purchaseStatus,
      sales_status: lead.salesStatus,
      payment_amount: lead.paymentAmount,
      notes: lead.notes
    });
    if (error) throw error;
  } else {
    memoryStore.unshift(lead);
  }
  return lead;
}

export async function listLeads() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return memoryStore;
  const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data.map(rowToLead);
}

export async function getLead(id: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return memoryStore.find((lead) => lead.id === id) ?? null;
  const { data, error } = await supabase.from("leads").select("*").eq("id", id).single();
  if (error) return null;
  return rowToLead(data);
}

export async function updateLeadStatus(id: string, salesStatus: LeadRecord["salesStatus"]) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    const lead = memoryStore.find((item) => item.id === id);
    if (lead) lead.salesStatus = salesStatus;
    return lead ?? null;
  }
  const { data, error } = await supabase.from("leads").update({ sales_status: salesStatus }).eq("id", id).select("*").single();
  if (error) throw error;
  return rowToLead(data);
}

function rowToLead(row: any): LeadRecord {
  return {
    id: row.id,
    createdAt: row.created_at,
    contact: row.contact,
    dsiAnswers: row.dsi_answers,
    dsiResult: row.dsi_result,
    cmmiAnswers: row.cmmi_answers,
    cmmiResult: row.cmmi_result,
    purchaseStatus: row.purchase_status,
    salesStatus: row.sales_status,
    paymentAmount: row.payment_amount,
    notes: row.notes ?? []
  };
}
