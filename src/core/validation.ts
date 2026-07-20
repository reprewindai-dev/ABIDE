import { z } from "zod";

// Zod schema for Goal
export const GoalSchema = z.object({
  title: z.string(),
  description: z.string(),
  status: z.string()
});

// Zod schema for Moat
export const MoatSchema = z.object({
  capabilityName: z.string(),
  description: z.string(),
  advantageScore: z.number()
});

// Zod schema for EinsteinVariable
export const EinsteinVariableSchema = z.object({
  name: z.string(),
  impact: z.string()
});

// Zod schema for EinsteinProbability
export const EinsteinProbabilitySchema = z.object({
  modelName: z.string(),
  successRate: z.number(),
  latencyMs: z.number(),
  variables: z.array(EinsteinVariableSchema)
});

// Zod schema for AcademicPaper
export const AcademicPaperSchema = z.object({
  title: z.string(),
  author: z.string(),
  source: z.string(),
  summary: z.string(),
  relevance: z.string(),
  // Strict academic requirements added to avoid credibility risk
  resolvableIdentifier: z.string().url().optional(),
  retrievalTimestamp: z.string().optional(),
  quotedClaimLocation: z.string().optional(),
  verificationStatus: z.string().optional(),
  digitalSignature: z.string().optional()
});

// Zod schema for VirtualFile
export const VirtualFileSchema = z.object({
  path: z.string(),
  content: z.string()
});

// Zod schema for Domain
export const DomainSchema = z.object({
  name: z.string(),
  description: z.string(),
  products: z.array(z.string())
});

// Zod schema for Product
export const ProductSchema = z.object({
  name: z.string(),
  domain: z.string(),
  businessValue: z.string(),
  owner: z.string()
});

// Zod schema for CanonicalSystem
export const CanonicalSystemSchema = z.object({
  name: z.string(),
  techStack: z.string(),
  purpose: z.string()
});

// Zod schema for Repository
export const RepositorySchema = z.object({
  name: z.string(),
  url: z.string().url(),
  capabilities: z.array(z.string()),
  status: z.string()
});

// Zod schema for Owner
export const OwnerSchema = z.object({
  name: z.string(),
  role: z.string(),
  team: z.string()
});

// Zod schema for RevenueStream
export const RevenueStreamSchema = z.object({
  name: z.string(),
  description: z.string(),
  model: z.string()
});

// Zod schema for Policy
export const PolicySchema = z.object({
  name: z.string(),
  rule: z.string(),
  scope: z.string()
});

// Zod schema for ExternalProvider
export const ExternalProviderSchema = z.object({
  name: z.string(),
  service: z.string(),
  sla: z.string()
});

// Zod schema for CompanyGraph
export const CompanyGraphSchema = z.object({
  domains: z.array(DomainSchema),
  products: z.array(ProductSchema),
  canonicalSystems: z.array(CanonicalSystemSchema),
  repositories: z.array(RepositorySchema),
  environments: z.array(z.string()),
  owners: z.array(OwnerSchema),
  revenueStreams: z.array(RevenueStreamSchema),
  policies: z.array(PolicySchema),
  externalProviders: z.array(ExternalProviderSchema)
});

// Zod schema for ExposedInterfaces
export const ExposedInterfacesSchema = z.object({
  rest: z.array(z.string()),
  mcp: z.array(z.string()),
  sdk: z.array(z.string()),
  cli: z.array(z.string()),
  ui: z.array(z.string()),
  webhooks: z.array(z.string())
});

// Zod schema for ExposureSurface
export const ExposureSurfaceSchema = z.object({
  type: z.enum(["API", "MCP", "SDK", "UI", "Job", "Event", "CLI", "Webhook"]),
  identifier: z.string(),
  description: z.string(),
  status: z.string(),
  stableId: z.string().optional(),
  semanticVersion: z.string().optional(),
  priorVersionPointer: z.string().optional(),
  deprecationFlag: z.boolean().optional(),
  replacementPointer: z.string().optional()
});

// Zod schema for CapabilityPricing
export const CapabilityPricingSchema = z.object({
  billingUnit: z.string(),
  priceFloor: z.number(),
  includedQuota: z.string(),
  overage: z.string(),
  settlementCompat: z.string(),
  costToServe: z.string(),
  marginEstimate: z.number()
});

// Zod schema for CapabilityGovernance
export const CapabilityGovernanceSchema = z.object({
  requiredApprovals: z.array(z.string()),
  budgetRules: z.string(),
  dataBoundaries: z.string(),
  delegations: z.string(),
  auditReqs: z.string(),
  killSwitchRules: z.string(),
  limits: z.string()
});

// Zod schema for CapabilityEvidence
export const CapabilityEvidenceSchema = z.object({
  evidenceProduced: z.string(),
  hashAlgorithm: z.string(),
  ledgerStorage: z.string(),
  verifiable: z.boolean(),
  privateDetails: z.string(),
  completedProof: z.string(),
  classification: z.enum([
    "VERIFIED_EXISTING",
    "INFERRED_FROM_CODE",
    "RESEARCH_SUPPORTED",
    "PROJECTED_BUSINESS_ASSUMPTION",
    "UNVERIFIED_DESIGN_INTENT"
  ]),
  evidenceTimestamp: z.string().optional(),
  freshnessWindowDays: z.number().optional(),
  nextRevalidationDue: z.string().optional(),
  trustDecayFactor: z.number().optional()
});

// Zod schema for ProductionEligibility
export const ProductionEligibilitySchema = z.object({
  minTests: z.number(),
  requiredEvidence: z.string(),
  securityReviewChecked: z.boolean(),
  codeSignRequired: z.boolean()
});

// Zod schema for PromotionRule
export const PromotionRuleSchema = z.object({
  targetMaturity: z.string(),
  requiredEvidenceClass: z.string(),
  requiredTestsCount: z.number(),
  extraValidationNeeded: z.string()
});

// Zod schema for CapabilityVerification
export const CapabilityVerificationSchema = z.object({
  unitTests: z.array(z.string()),
  contractTests: z.array(z.string()),
  fixtureTests: z.array(z.string()),
  mcpTests: z.array(z.string()),
  securityTests: z.array(z.string()),
  latencySlo: z.string(),
  driftChecks: z.string(),
  promotionRules: z.array(PromotionRuleSchema).optional(),
  productionEligibilityThreshold: ProductionEligibilitySchema.optional()
});

// Zod schema for JurisdictionOverlay
export const JurisdictionOverlaySchema = z.object({
  dataBoundaryProfile: z.string(),
  jurisdictionConstraints: z.array(z.string()),
  paymentRailConstraints: z.array(z.string()),
  auditRetentionProfile: z.string(),
  allowedRegions: z.array(z.string()).optional(),
  blockedRegions: z.array(z.string()).optional(),
  modifiedBehaviorByRegion: z.record(z.string(), z.string()).optional(),
  fallbackInteractionPattern: z.string().optional()
});

// Zod schema for Capability
export const CapabilitySchema = z.object({
  id: z.string(),
  name: z.string(),
  purpose: z.string(),
  businessOutcome: z.string(),
  machineOutcome: z.string(),
  inputs: z.array(z.string()),
  outputs: z.array(z.string()),
  preconditions: z.array(z.string()),
  postconditions: z.array(z.string()),
  owner: z.string(),
  canonicalSystem: z.string(),
  supportingServices: z.array(z.string()),
  exposedInterfaces: ExposedInterfacesSchema,
  exposureSurfaces: z.array(ExposureSurfaceSchema),
  pricingModel: CapabilityPricingSchema,
  governance: CapabilityGovernanceSchema,
  evidence: CapabilityEvidenceSchema,
  verification: CapabilityVerificationSchema,
  dependencies: z.array(z.string()),
  lifecycleState: z.string(),
  // Canonical field is observedMaturity. Keep maturityState optional for legacy imports.
  observedMaturity: z.string().optional(),
  maturityState: z.string().optional(),
  verificationState: z.string(),
  pricingState: z.string(),
  deprecationState: z.string(),
  jurisdictionPolicy: JurisdictionOverlaySchema,
  stableId: z.string().optional(),
  semanticVersion: z.string().optional(),
  priorVersionPointer: z.string().optional(),
  deprecationFlag: z.boolean().optional(),
  replacementPointer: z.string().optional()
});

// Zod schema for ProductOffering
export const ProductOfferingSchema = z.object({
  name: z.string(),
  description: z.string(),
  capabilities: z.array(z.string()),
  priceModel: z.string(),
  entitlements: z.array(z.string())
});

// Zod schema for GapReport
export const GapReportSchema = z.object({
  system: z.string(),
  missing: z.string(),
  severity: z.enum(["Critical", "Medium", "Low"]),
  impact: z.string()
});

// Zod schema for AgentPacket
export const AgentPacketSchema = z.object({
  id: z.string(),
  title: z.string(),
  targetRole: z.string(),
  summary: z.string(),
  objective: z.string(),
  scope: z.string(),
  files: z.array(z.string()),
  contracts: z.string(),
  dependencies: z.array(z.string()),
  tests: z.array(z.string()),
  migrations: z.string(),
  performanceTargets: z.string(),
  securityConstraints: z.string(),
  docsToUpdate: z.array(z.string()),
  definitionOfDone: z.array(z.string()),
  rollbackNotes: z.string()
});

// Zod schema for CanonicalBlueprintV1
export const CanonicalBlueprintV1Schema = z.object({
  title: z.string(),
  tagline: z.string(),
  timestamp: z.string(),
  hash: z.string(),
  highLevelGoals: z.array(GoalSchema),
  competitiveMoat: z.array(MoatSchema),
  einsteinProbability: EinsteinProbabilitySchema,
  academicGrounding: z.array(AcademicPaperSchema),
  companyGraph: CompanyGraphSchema,
  capabilities: z.array(CapabilitySchema),
  productOfferings: z.array(ProductOfferingSchema),
  gapsReport: z.array(GapReportSchema),
  files: z.array(VirtualFileSchema),
  agentPackets: z.array(AgentPacketSchema).optional(),
  source: z.string().optional(),
  quota_fallback: z.boolean().optional(),
  fallback_message: z.string().optional(),
  compilationMetadata: z.object({
    mode: z.string(),
    requestedProvider: z.string(),
    resolvedProvider: z.string(),
    fallbackReason: z.string(),
    semanticValidationAvailable: z.boolean(),
    repositoryValidationAvailable: z.boolean(),
    templateAugmentation: z.string(),
    humanApproval: z.string(),
    approvalEligibility: z.string(),
    executionEligibility: z.string(),
    claimClassification: z.string()
  }).optional(),
  inputProvenance: z.object({
    suppliedText: z.string(),
    targetPlatform: z.string().nullable(),
    selectedJurisdiction: z.string().nullable(),
    templateAugmentation: z.string()
  }).optional()
});

// Zod schema for PlanStep
export const PlanStepSchema = z.object({
  stepId: z.string().uuid(),
  sequence: z.number().int().positive(),
  capability: z.string(),
  lane: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  inputSchema: z.record(z.string(), z.unknown()),
  expectedOutput: z.record(z.string(), z.unknown()),
  riskLevel: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  requiresApproval: z.boolean(),
  approvalToken: z.string().optional(),
  idempotencyKey: z.string(),
  executedAt: z.string().optional(),
  resultHash: z.string().optional()
});

// Zod schema for PlanIR
export const PlanIRSchema = z.object({
  planId: z.string().uuid(),
  version: z.string(),
  status: z.enum(["DRAFT", "COMPILED", "PENDING_APPROVAL", "APPROVED", "REJECTED", "EXECUTING", "COMPLETE", "HALTED"]),
  tenantId: z.string(),
  agentId: z.string(),
  compiledAt: z.string(),
  approvedAt: z.string().optional(),
  intent: z.string().max(2000),
  steps: z.array(PlanStepSchema),
  canonicalHash: z.string(),
  signature: z.string().optional(),
  einsteinScore: z.number().optional(),
  ssrnValidated: z.boolean().optional(),
  x402ReservationId: z.string().optional(),
  pglReceiptId: z.string().optional(),
  replayable: z.boolean()
});

// Zod schema for ApprovalToken
export const ApprovalTokenSchema = z.object({
  issuer: z.string(),
  tenantId: z.string(),
  planId: z.string().uuid(),
  canonicalHash: z.string(),
  stepId: z.string().uuid(),
  allowedCapability: z.string(),
  allowedRepositories: z.array(z.string()),
  allowedFiles: z.array(z.string()),
  issuedAt: z.string(),
  expiresAt: z.string(),
  nonce: z.string(),
  signature: z.string()
});

// Zod schema for Checkpoint
export const CheckpointSchema = z.object({
  checkpointId: z.string(),
  parentCheckpointId: z.string().nullable().optional(),
  blueprintHash: z.string(),
  packetHash: z.string(),
  repositoryCommitSha: z.string(),
  modifiedFiles: z.array(z.string()),
  testResults: z.record(z.string(), z.unknown()),
  unresolvedWork: z.string(),
  agentIdentity: z.string(),
  timestamp: z.string()
});

// Zod schema for ExecutionEvidence
export const ExecutionEvidenceSchema = z.object({
  testResults: z.record(z.string(), z.unknown()),
  diffs: z.array(z.object({
    filePath: z.string(),
    diffContent: z.string()
  }))
});
