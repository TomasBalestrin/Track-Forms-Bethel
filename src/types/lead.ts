export interface LeadSubmission {
  id: string;
  pixel_id: string;
  email: string | null;
  form_data: Record<string, unknown>;
  fbclid: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  submission_id: string | null;
  is_qualified: boolean;
  fb_sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ParsedWebhookPayload {
  email: string | null;
  fbclid: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  form_data: Record<string, unknown>;
}

export type LeadFilter = "all" | "qualified" | "unqualified";

export interface ListLeadsParams {
  pixelId: string;
  filter?: LeadFilter;
  page?: number;
  pageSize?: number;
}

export interface ListLeadsResult {
  data: LeadSubmission[];
  total: number;
  page: number;
  pageSize: number;
}
