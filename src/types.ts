export type MetricEvidenceState =
  | "COMPUTED"
  | "COMPUTED_UNCALIBRATED"
  | "MEASURED"
  | "RETRIEVED"
  | "USER_DECLARED"
  | "GENERATED_ESTIMATE"
  | "DEMO_SAMPLE"
  | "UNMEASURED";

export interface MetricValue {
  value: number | null;
  unit?: string;
  evidence_state: MetricEvidenceState;
  computation_source?: string;
  algorithm_version?: string;
  inputs_hash?: string;
  measured_at?: string;
  source_record_id?: string;
}

export interface Goal {
  title: string;
  description: string;
  status: "Planned" | "Critical" | "Deferred" | string;
}

export interface Moat {
  capabilityName: string;
  description: string;
  advantageScore: number;
}

export interface EinsteinVariable {
  name: string;
  impact: string;
}

export interface EinsteinProbability {
  modelName: string;
  successRate: number | null;
  latencyMs: number | null;
  measurementState?: string;
  variables: EinsteinVariable[];
  source_kind?: string;
  source_provider?: string;
  source_record_id?: string | null;
  retrieved_at?: string;
  evidence_state?: string;
  claim_validation_state?: string;
  provenance?: Record<string, any>;
  metric_provenance?: Record<string, MetricValue>;
}

export interface AcademicPaper {
  title: string;
  author: string;
  source: string;
  summary: string;
  relevance: string;
  url?: string;
  resolvableIdentifier?: string;
  retrievalTimestamp?: string;
  quotedClaimLocation?: string;
  verificationStatus?: string;
  digitalSignature?: string;
  source_kind?: string;
  source_provider?: string;
  source_record_id?: string | null;
  retrieved_at?: string;
  retrievalStatus?: string;
  evidence_state?: string;
  claim_validation_state?: string;
  provenance?: Record<string, any>;
}

export interface VirtualFile {
  path: string;
  content: string;
}

// Capability-Based Product Architecture Types

export interface CompanyGraph {
  domains: { name: string; description: string; products: string[] }[];
  products: { name: string; domain: string; businessValue: string; owner: string; source_kind?: string; provenance?: Record<string, any>; }[];
  canonicalSystems: { name: string; techStack: string; purpose: string }[];
  repositories: { name: string; url: string; capabilities: string[]; status: string; source_kind?: string; provenance?: Record<string, any>; }[];
  environments: (string | { name?: string; source_kind?: string; provenance?: Record<string, any>; })[];
  owners: { name: string; role: string; team: string; source_kind?: string; provenance?: Record<string, any>; }[];
  revenueStreams: { name: string; description: string; model: string }[];
  policies: { name: string; rule: string; scope: string }[];
  externalProviders: { name: string; service: string; sla: string }[];
}

export interface ExposedInterfaces {
  rest: string[];
  mcp: string[];
  sdk: string[];
  cli: string[];
  ui: string[];
  webhooks: string[];
}

export interface ExposureSurface {
  type: "API" | "MCP" | "SDK" | "UI" | "Job" | "Event" | "CLI" | "Webhook";
  identifier: string;
  description: string;
  status: "Active" | "Deprecated" | "Planned" | string;
  stableId?: string;
  semanticVersion?: string;
  priorVersionPointer?: string;
  deprecationFlag?: boolean;
  replacementPointer?: string;
}

export interface CapabilityPricing {
  billingUnit: string;
  priceFloor: number;
  includedQuota: string;
  overage: string;
  settlementCompat: string;
  costToServe: string;
  marginEstimate: number;
}

export interface CapabilityGovernance {
  requiredApprovals: string[];
  budgetRules: string;
  dataBoundaries: string;
  delegations: string;
  auditReqs: string;
  killSwitchRules: string;
  limits: string;
}

export interface CapabilityEvidence {
  evidenceProduced: string;
  hashAlgorithm: string;
  ledgerStorage: string;
  verifiable: boolean;
  privateDetails: string;
  completedProof: string;
  classification: "VERIFIED_EXISTING" | "INFERRED_FROM_CODE" | "RESEARCH_SUPPORTED" | "PROJECTED_BUSINESS_ASSUMPTION" | "UNVERIFIED_DESIGN_INTENT";
  verifiedOnChain?: boolean | null | string;
  testCoveragePercent?: number | null;
  measurementState?: string;
  provenance?: Record<string, any>;
  // Evidence Freshness fields
  evidenceTimestamp?: string;
  freshnessWindowDays?: number;
  nextRevalidationDue?: string;
  trustDecayFactor?: number; // 0.0 (untrusted/expired) to 1.0 (fresh)
}

export interface ApprovalWorkflow {
  approverRoles: string[];
  approvalTimestamps: Record<string, string>;
  requiredSignOffCount: number;
  overrideRationale?: string;
}

export interface DownstreamImpactAnalysis {
  affectedInterfaces: string[];
  staleAgentPackets: string[];
  reposNeedingMigration: string[];
  affectedPricingBundles: string[];
  affectedJurisdictionPolicies: string[];
}

export interface BundleInheritance {
  parentBundleId: string;
  pricingInherited: boolean;
  governanceRulesInherited: boolean;
  inheritedPriceFloor?: number;
  inheritedAccessPolicies?: string[];
}

export interface DataSovereigntyMapping {
  sourceOfTruth: string; // e.g., "git-main-blueprint" (authoritative schema definition)
  systemOfRecord: string; // e.g., "arbitrum-escrow-contract-ledger" (operational transactions store)
  truthConsistencyCheckUrl?: string;
}

export interface PromotionRule {
  targetMaturity: string;
  requiredEvidenceClass: string;
  requiredTestsCount: number;
  extraValidationNeeded: string;
}

export interface ProductionEligibility {
  minTests: number;
  requiredEvidence: string;
  securityReviewChecked: boolean;
  codeSignRequired: boolean;
}

export interface CapabilityVerification {
  unitTests: string[] | null;
  contractTests: string[] | null;
  fixtureTests: string[] | null;
  mcpTests: string[] | null;
  securityTests: string[] | null;
  latencySlo: string;
  driftChecks: string;
  promotionRules?: PromotionRule[];
  productionEligibilityThreshold?: ProductionEligibility;
}

export interface JurisdictionOverlay {
  dataBoundaryProfile: string;
  jurisdictionConstraints: string[];
  paymentRailConstraints: string[];
  auditRetentionProfile: string;
  allowedRegions?: string[];
  blockedRegions?: string[];
  modifiedBehaviorByRegion?: Record<string, string>;
  fallbackInteractionPattern?: string;
}

export interface Capability {
  id: string;
  name: string;
  purpose: string;
  businessOutcome: string;
  machineOutcome: string;
  inputs: string[];
  outputs: string[];
  preconditions: string[];
  postconditions: string[];
  owner: string;
  primaryOwner?: string;
  technicalOwner?: string;
  dataOwner?: string;
  complianceOwner?: string;
  canonicalSystem: string;
  canonicalDataDomain?: string;
  canonicalServiceSystem?: string;
  canonicalRepoImplementation?: string;
  nonCanonicalMirrors?: string[];
  supportingServices: string[];
  exposedInterfaces: ExposedInterfaces;
  exposureSurfaces: ExposureSurface[];
  pricingModel: CapabilityPricing;
  governance: CapabilityGovernance;
  evidence: CapabilityEvidence;
  verification: CapabilityVerification;
  dependencies: string[];
  // Lifecycle and State
  lifecycleState: "Draft" | "Approved" | "Active" | "Deprecated" | "Retired" | string;
  maturityState: "Conceptual" | "Partially Simulated" | "Sovereign Production" | string;
  verificationState: "Unverified" | "Verified" | "Drift Detected" | string;
  pricingState: "Unpriced" | "Draft Price" | "Active Pricing" | "Deprecated Pricing" | string;
  deprecationState: "None" | "Deprecation Warning Issued" | "Sunset Scheduled" | "Retired" | string;
  // Versioning and Lineage
  stableId?: string;
  semanticVersion?: string;
  priorVersionPointer?: string;
  deprecationFlag?: boolean;
  replacementPointer?: string;
  // Jurisdiction Overlay
  jurisdictionPolicy: JurisdictionOverlay;
  // Governance additions (User requested)
  approvalWorkflow?: ApprovalWorkflow;
  downstreamImpact?: DownstreamImpactAnalysis;
  bundleInheritance?: BundleInheritance;
  dataSovereignty?: DataSovereigntyMapping;
  source_kind?: string;
  provenance?: Record<string, any>;
  metric_provenance?: Record<string, MetricValue>;
}

export interface ProductOffering {
  name: string;
  description: string;
  capabilities: string[];
  priceModel: string;
  entitlements: string[];
}

export interface GapReport {
  system: string;
  missing: string;
  severity: "Critical" | "Medium" | "Low";
  impact: string;
}

export interface ExecutionPacket {
  id: string;
  title: string;
  targetRole: string;
  summary: string;
  objective: string;
  scope: string;
  files: string[];
  contracts: string;
  dependencies: string[];
  tests: string[];
  migrations: string;
  performanceTargets: string;
  securityConstraints: string;
  docsToUpdate: string[];
  definitionOfDone: string[];
  rollbackNotes: string;
}

export interface BlueprintResult {
  title: string;
  tagline: string;
  version?: string;
  timestamp: string;
  hash: string;
  highLevelGoals: Goal[];
  competitiveMoat: Moat[];
  einsteinProbability: EinsteinProbability;
  academicGrounding: AcademicPaper[];
  companyGraph: CompanyGraph;
  capabilities: Capability[];
  productOfferings: ProductOffering[];
  gapsReport: GapReport[];
  files: VirtualFile[];
  agentPackets?: ExecutionPacket[];
  source?: string;
  quota_fallback?: boolean;
  fallback_message?: string;
  evidence_state?: string;
  verification_state?: string;
  cacheStatus?: any;
  sekedTriage?: any;
  jurisdictionProfileName?: string;
  provenance?: Record<string, any>;
  metric_provenance?: Record<string, MetricValue>;
}

export interface ModelConfig {
  provider: "gemini" | "openai" | "anthropic" | "deepseek" | "llama" | "custom";
  apiKey: string;
  modelName: string;
  customUrl?: string;
  temperature: number;
  authMode?: "bearer" | "apiKeyHeader" | "customHeader" | "none";
  customHeaderName?: string;
}

export interface ExampleTemplate {
  name: string;
  description: string;
  icon: string;
  notes: string;
  targetPlatform: string;
  codebaseContext?: string;
}

export interface RevisionLog {
  version: string;
  timestamp: string;
  approvedBy: string;
  scopeChanges: string;
  hash: string;
}

export interface LockedConstitution {
  version: string;
  status: "LOCKED" | "DRAFT" | "PENDING_REVISION";
  approvedScope: string;
  contractSetDigest: string;
  architectureDigest: string;
  qualityGates: string[];
  dependencyRules: string[];
  revisions: RevisionLog[];
}
