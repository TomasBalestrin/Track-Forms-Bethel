import type { SupabaseClient } from "@supabase/supabase-js";

import { evaluateQualification } from "@/lib/qualification/engine";
import type {
  LeadSubmission,
  ListLeadsParams,
  ListLeadsResult,
  ParsedWebhookPayload,
} from "@/types/lead";
import type { QualificationRule } from "@/types/rule";

export class LeadServiceError extends Error {
  constructor(
    message: string,
    public readonly code: "not_found" | "conflict" | "unknown" = "unknown"
  ) {
    super(message);
    this.name = "LeadServiceError";
  }
}

export const DEFAULT_LEADS_PAGE_SIZE = 50;

interface UpsertLeadArgs {
  pixelId: string;
  submissionId: string | null;
  parsed: ParsedWebhookPayload;
}

interface UpsertLeadResult {
  lead: LeadSubmission;
  isNew: boolean;
  alreadyProcessed: boolean;
}

export const leadService = {
  /**
   * Upsert com duas estratégias de idempotência:
   * 1) submission_id (Framer-Webhook-Submission-Id) → evita replay exato.
   * 2) (pixel_id, email) → atualiza o lead existente para o mesmo email.
   */
  async upsertLead(
    supabase: SupabaseClient,
    args: UpsertLeadArgs
  ): Promise<UpsertLeadResult> {
    const { pixelId, submissionId, parsed } = args;

    // 1) Idempotência por submission_id
    if (submissionId) {
      const { data: existingBySub } = await supabase
        .from("lead_submissions")
        .select("*")
        .eq("submission_id", submissionId)
        .eq("pixel_id", pixelId)
        .maybeSingle();

      if (existingBySub) {
        return {
          lead: existingBySub as LeadSubmission,
          isNew: false,
          alreadyProcessed: true,
        };
      }
    }

    const payload = {
      pixel_id: pixelId,
      email: parsed.email,
      form_data: parsed.form_data,
      fbclid: parsed.fbclid,
      utm_source: parsed.utm_source,
      utm_medium: parsed.utm_medium,
      utm_campaign: parsed.utm_campaign,
      utm_content: parsed.utm_content,
      utm_term: parsed.utm_term,
      submission_id: submissionId,
    };

    // 2) Deduplicação por (pixel_id, email) — quando houver email
    if (parsed.email) {
      const { data: existingByEmail, error: findErr } = await supabase
        .from("lead_submissions")
        .select("*")
        .eq("pixel_id", pixelId)
        .eq("email", parsed.email)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (findErr) {
        throw new LeadServiceError(findErr.message);
      }

      if (existingByEmail) {
        const { data: updated, error: updateErr } = await supabase
          .from("lead_submissions")
          .update({
            form_data: payload.form_data,
            fbclid: payload.fbclid ?? existingByEmail.fbclid,
            utm_source: payload.utm_source ?? existingByEmail.utm_source,
            utm_medium: payload.utm_medium ?? existingByEmail.utm_medium,
            utm_campaign: payload.utm_campaign ?? existingByEmail.utm_campaign,
            utm_content: payload.utm_content ?? existingByEmail.utm_content,
            utm_term: payload.utm_term ?? existingByEmail.utm_term,
            submission_id: submissionId ?? existingByEmail.submission_id,
          })
          .eq("id", existingByEmail.id)
          .select("*")
          .single();

        if (updateErr) throw new LeadServiceError(updateErr.message);
        return {
          lead: updated as LeadSubmission,
          isNew: false,
          alreadyProcessed: false,
        };
      }
    }

    const { data: inserted, error: insertErr } = await supabase
      .from("lead_submissions")
      .insert(payload)
      .select("*")
      .single();

    if (insertErr) throw new LeadServiceError(insertErr.message);
    return {
      lead: inserted as LeadSubmission,
      isNew: true,
      alreadyProcessed: false,
    };
  },

  async getSampleLeads(
    supabase: SupabaseClient,
    pixelId: string,
    limit = 5
  ): Promise<LeadSubmission[]> {
    const { data, error } = await supabase
      .from("lead_submissions")
      .select("*")
      .eq("pixel_id", pixelId)
      .order("created_at", { ascending: true })
      .limit(limit);

    if (error) throw new LeadServiceError(error.message);
    return (data ?? []) as LeadSubmission[];
  },

  async listLeads(
    supabase: SupabaseClient,
    params: ListLeadsParams
  ): Promise<ListLeadsResult> {
    const {
      pixelId,
      filter = "all",
      page = 1,
      pageSize = DEFAULT_LEADS_PAGE_SIZE,
    } = params;

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const query = supabase
      .from("lead_submissions")
      .select("*", { count: "exact" })
      .eq("pixel_id", pixelId);

    if (filter === "qualified") {
      query.eq("is_qualified", true);
    } else if (filter === "unqualified") {
      query.eq("is_qualified", false);
    }

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw new LeadServiceError(error.message);

    return {
      data: (data ?? []) as LeadSubmission[],
      total: count ?? 0,
      page,
      pageSize,
    };
  },

  async updateQualification(
    supabase: SupabaseClient,
    leadId: string,
    isQualified: boolean
  ): Promise<LeadSubmission> {
    const { data, error } = await supabase
      .from("lead_submissions")
      .update({ is_qualified: isQualified })
      .eq("id", leadId)
      .select("*")
      .single();

    if (error) throw new LeadServiceError(error.message);
    return data as LeadSubmission;
  },

  async updateFbSentAt(
    supabase: SupabaseClient,
    leadId: string,
    sentAt: Date = new Date()
  ): Promise<LeadSubmission> {
    const { data, error } = await supabase
      .from("lead_submissions")
      .update({ fb_sent_at: sentAt.toISOString() })
      .eq("id", leadId)
      .select("*")
      .single();

    if (error) throw new LeadServiceError(error.message);
    return data as LeadSubmission;
  },

  /**
   * Reavalia todos os leads de um pixel contra um snapshot de regras.
   * Retorna contagem de leads requalificados e quantos passaram de
   * not-qualified → qualified (newly_qualified).
   */
  async requalifyAll(
    supabase: SupabaseClient,
    pixelId: string,
    rules: QualificationRule[]
  ): Promise<{
    requalified: number;
    newlyQualified: LeadSubmission[];
  }> {
    const { data: leads, error } = await supabase
      .from("lead_submissions")
      .select("*")
      .eq("pixel_id", pixelId);

    if (error) throw new LeadServiceError(error.message);

    const newlyQualified: LeadSubmission[] = [];
    let requalified = 0;

    for (const raw of (leads ?? []) as LeadSubmission[]) {
      const wasQualified = raw.is_qualified;
      const shouldBeQualified = evaluateQualification(
        raw.form_data ?? {},
        rules
      );

      if (wasQualified !== shouldBeQualified) {
        const { data: updated, error: upErr } = await supabase
          .from("lead_submissions")
          .update({ is_qualified: shouldBeQualified })
          .eq("id", raw.id)
          .select("*")
          .single();

        if (upErr) throw new LeadServiceError(upErr.message);
        requalified += 1;
        if (!wasQualified && shouldBeQualified) {
          newlyQualified.push(updated as LeadSubmission);
        }
      }
    }

    return { requalified, newlyQualified };
  },
};
