export interface QualificationRule {
  id: string;
  pixel_id: string;
  field_name: string;
  qualified_values: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface QualificationRuleInput {
  field_name: string;
  qualified_values: string[];
  is_active: boolean;
}

export interface SaveRulesResult {
  rules_saved: number;
  leads_requalified: number;
  newly_qualified: number;
}
