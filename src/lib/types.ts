export type StandardCategory =
  | "Security"
  | "Performance"
  | "Reliability"
  | "Scalability"
  | "Observability"
  | "API Design"
  | "Data Management"
  | "General";

export type Severity = "critical" | "warning" | "info";

export interface Standard {
  id: string;
  name: string;
  description: string;
  category: StandardCategory;
  severity: Severity;
  enabled: boolean;
}

export type VerificationStatus = "pass" | "fail" | "warning" | "not_applicable";

export interface VerificationResult {
  standardId: string;
  standardName: string;
  category: StandardCategory;
  severity: Severity;
  status: VerificationStatus;
  details: string;
  suggestion?: string;
}

export interface VerificationReport {
  id: string;
  timestamp: string;
  inputType: "swagger" | "diagram";
  inputName: string;
  results: VerificationResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
    notApplicable: number;
  };
  aiRecommendations?: string[];
}

export interface AIRecommendation {
  name: string;
  description: string;
  category: StandardCategory;
  severity: Severity;
  rationale: string;
}
