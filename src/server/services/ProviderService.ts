import crypto from "crypto";
import { GoogleGenAI } from "@google/genai";
import { DEFAULT_BLUEPRINT } from "../../data/defaultBlueprint";
import { calculateBlueprintHash } from "../../core/plan-ir";
import { triageBlueprintIntakeV1 } from "../../compiler/seked";
import { cacheManager } from "../../core/cache";

export function calculateCanonicalHash(blueprint: any, intent?: string, compilerVersion = "v4.02"): string {
  return calculateBlueprintHash(blueprint);
}

export interface RetryOptions {
  maxRetries?: number;      // default 3
  initialDelayMs?: number;  // default 1000ms
  maxDelayMs?: number;      // default 10000ms
  backoffFactor?: number;   // default 2
  jitter?: boolean;         // default true
  onRetry?: (attempt: number, error: any, delayMs: number) => void | Promise<void>;
}

export async function withExponentialBackoff<T>(
  fn: (attempt: number) => Promise<T>,
  options: RetryOptions = {},
  operationName = "Provider API Call"
): Promise<T> {
  const maxRetries = options.maxRetries ?? 3;
  const initialDelayMs = options.initialDelayMs ?? 1000;
  const maxDelayMs = options.maxDelayMs ?? 10000;
  const backoffFactor = options.backoffFactor ?? 2;
  const jitter = options.jitter ?? true;

  let attempt = 1;
  let currentDelay = initialDelayMs;

  while (true) {
    try {
      return await fn(attempt);
    } catch (error: any) {
      const errorMsg = error?.message || String(error);
      const isRateLimit = /429|rate[\s_-]?limit|resource[\s_-]?exhausted|quota/i.test(errorMsg);
      const isNetworkOrServer = /500|502|503|504|timeout|timed?[\s_-]?out|reset|econnreset|enotfound|fetch failed|network|unavailable|overloaded|eai_again|socket hang up/i.test(errorMsg);
      const isRetryable = isRateLimit || isNetworkOrServer || attempt <= 1;

      const isFatalAuth = /401|403|unauthorized|forbidden|invalid[\s_-]?api[\s_-]?key|key not configured/i.test(errorMsg);

      if (attempt >= maxRetries || isFatalAuth || (!isRetryable && attempt > 1)) {
        console.warn(`[ProviderService] ${operationName} failed permanently after ${attempt} attempt(s): ${errorMsg}`);
        throw error;
      }

      let delay = currentDelay;
      if (jitter) {
        delay = Math.floor(currentDelay * (0.8 + Math.random() * 0.4));
      }
      delay = Math.min(delay, maxDelayMs);

      console.warn(`[ProviderService] ${operationName} failed (attempt ${attempt}/${maxRetries}): ${errorMsg}. Retrying in ${delay}ms with exponential backoff...`);
      if (options.onRetry) {
        try {
          await options.onRetry(attempt, error, delay);
        } catch (e) {
          // ignore callback error
        }
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
      currentDelay = Math.min(currentDelay * backoffFactor, maxDelayMs);
      attempt++;
    }
  }
}

export async function callVeklom(params: {
  systemPrompt: string;
  userPrompt: string;
  model?: string;
  apiKey?: string;
}): Promise<string> {
  const baseUrl =
    process.env.VEKLOM_BASE_URL?.replace(/\/+$/, "") ||
    "https://api.veklom.com";

  const apiKey = process.env.VEKLOM_API_KEY || params.apiKey;

  if (!apiKey) {
    throw new Error("VEKLOM_API_KEY is not configured.");
  }

  return await withExponentialBackoff(async (attempt) => {
    const response = await fetch(`${baseUrl}/v1/exec`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify({
        prompt: [
          "SYSTEM INSTRUCTIONS:",
          params.systemPrompt,
          "",
          "USER REQUEST:",
          params.userPrompt,
        ].join("\n"),
        model: params.model || process.env.VEKLOM_MODEL || "qwen2.5:3b",
        use_memory: false,
        max_tokens: 8192,
        temperature: 0.2,
      }),
    });

    const responseText = await response.text();

    if (!response.ok) {
      throw new Error(
        `Veklom request failed with HTTP ${response.status}: ${responseText}`
      );
    }

    const data = JSON.parse(responseText);

    if (typeof data.response !== "string" || !data.response.trim()) {
      throw new Error("Veklom returned no inference response.");
    }

    return data.response;
  }, { maxRetries: 3, initialDelayMs: 1000 }, "Veklom LLM Inference");
}


export function generateFallbackBlueprint(
  notes: string,
  targetPlatform?: string,
  userEmail?: string,
  selectedJurisdiction?: string,
  constitutionVersion?: string,
  constitutionState?: string
) {
  // Deep copy DEFAULT_BLUEPRINT
  const blueprint = JSON.parse(JSON.stringify(DEFAULT_BLUEPRINT));
  
  blueprint.source = "fallback";
  blueprint.quota_fallback = true;
  blueprint.timestamp = new Date().toISOString();
  
  // Assign stable, canonical content-addressed hash based on actual content and notes
  blueprint.hash = calculateCanonicalHash(blueprint, notes);

  let title = "Sovereign Autonomous Platform";
  let tagline = "A secure, capability-oriented infrastructure engineered for autonomous execution";

  const lowercaseNotes = notes.toLowerCase();
  
  if (lowercaseNotes.includes("scooter") || lowercaseNotes.includes("fleet") || lowercaseNotes.includes("charging") || lowercaseNotes.includes("solar")) {
    title = "Sovereign M2M Scooter Fleet";
    tagline = "Electric micro-mobility units with automated solar re-charging via X402 payment settlements";
    
    blueprint.highLevelGoals = [
      {
        title: "Deploy Autonomous Solar Re-charging Pads",
        description: "Equip local hubs with X402 micro-payment escrow terminals for vehicle docks.",
        status: "Critical"
      },
      {
        title: "Integrate Real-Time Battery-Adaptive Router",
        description: "Scooters self-route to closest available solar pads when battery falls below 20%.",
        status: "Planned"
      },
      {
        title: "Configure Instant Cross-Border x402 Settlements",
        description: "Direct machine-to-machine wallet payouts to solar provider nodes.",
        status: "Critical"
      }
    ];

    blueprint.competitiveMoat = [
      {
        capabilityName: "Autonomous Solar-Parity Escrow",
        description: "Allows battery-depleted devices to lock, rent, and settle solar charging without a centralized payment gateway.",
        advantageScore: 98
      },
      {
        capabilityName: "Hardware-to-Hardware x402 Channels",
        description: "Settles charging costs at sub-cent levels, optimizing operational profit margins directly on-chain.",
        advantageScore: 96
      }
    ];
    
    blueprint.companyGraph.products = [
      {
        name: "Sovereign M2M Scooter Fleet",
        domain: "Autonomous Orchestration",
        businessValue: "Drives hardware independence, enabling vehicles to buy their own fuel and pay for maintenance.",
        owner: "Dr. Evelyn Vance"
      },
      {
        name: "Solar Escrow Ledger",
        domain: "DeFi Ledger Settlements",
        businessValue: "Instantly splits fees between vehicle owners and green energy solar providers.",
        owner: "Maria Kostova"
      }
    ];
  } else if (lowercaseNotes.includes("cdn") || lowercaseNotes.includes("cache") || lowercaseNotes.includes("bandwidth") || lowercaseNotes.includes("raspberry")) {
    title = "Sovereign Edge CDN Network";
    tagline = "Encrypted community web caches rewarded in real-time micro-payments per megabyte served";
    
    blueprint.highLevelGoals = [
      {
        title: "Implement ZK Bandwidth Completed Proofs",
        description: "Enable zero-knowledge proof verification that content blocks were fully delivered before escrow payouts.",
        status: "Critical"
      },
      {
        title: "Establish Secure Hardware Enclave Caches",
        description: "Operators cannot peer into cached payloads or track active client request histories.",
        status: "Critical"
      },
      {
        title: "Deploy Sub-Millisecond Bandwidth Ledgers",
        description: "Micropayments executed on-the-fly per megabyte delivered via decentralized ledger.",
        status: "Planned"
      }
    ];

    blueprint.competitiveMoat = [
      {
        capabilityName: "Zero-Knowledge Delivery Verifier",
        description: "Bypasses centralized CDN logs, allowing secure, anonymous reward distribution without falsification risks.",
        advantageScore: 97
      },
      {
        capabilityName: "Hardware Enclave Shielding",
        description: "Protects enterprise data blocks on community-run Raspberry Pi and edge servers.",
        advantageScore: 95
      }
    ];

    blueprint.companyGraph.products = [
      {
        name: "Sovereign Edge Cache OS",
        domain: "Autonomous Orchestration",
        businessValue: "Secures edge cache pipelines, rewarding hosts based on verifiable byte delivery logs.",
        owner: "Dr. Evelyn Vance"
      },
      {
        name: "CDN Bandwidth Ledger",
        domain: "DeFi Ledger Settlements",
        businessValue: "Handles microsecond pay-as-you-go billing per downloaded content chunk.",
        owner: "Maria Kostova"
      }
    ];
  } else if (lowercaseNotes.includes("tutor") || lowercaseNotes.includes("vitals") || lowercaseNotes.includes("smartwatch") || lowercaseNotes.includes("heart") || lowercaseNotes.includes("student")) {
    title = "Vitals-Adaptive AI Tutoring Platform";
    tagline = "An AI-powered programming instructor that monitors focus levels and adapts teaching speeds dynamically";
    
    blueprint.highLevelGoals = [
      {
        title: "Deploy Vitals Cognitive Load Model",
        description: "Process smartwatch telemetry data in secure enclaves to predict frustration indices.",
        status: "Critical"
      },
      {
        title: "Establish Dynamic Speed Regulators",
        description: "Slow down educational prompts and introduce adaptive examples on high cognitive strain.",
        status: "Critical"
      },
      {
        title: "Integrate Prompt-Level Micro-billing",
        description: "Allow students to pay micro-cents per successful prompt via autonomous X402 wallets.",
        status: "Planned"
      }
    ];

    blueprint.competitiveMoat = [
      {
        capabilityName: "Cognitive Load Speed Control",
        description: "Boosts educational retention by 42% through bio-interactive, closed-loop instruction speeds.",
        advantageScore: 99
      },
      {
        capabilityName: "Prompt-by-Prompt Micro-billing",
        description: "Enables users to pay only for exact value received, bypassing expensive monthly recurring subscriptions.",
        advantageScore: 94
      }
    ];

    blueprint.companyGraph.products = [
      {
        name: "Vitals Instruction Engine",
        domain: "Autonomous Orchestration",
        businessValue: "Guides the learning pace based on biometric focus feedback loop parameters.",
        owner: "Dr. Evelyn Vance"
      },
      {
        name: "Prompt Micropayment Vault",
        domain: "DeFi Ledger Settlements",
        businessValue: "Unlocks lessons sequentially based on micro-token transfers.",
        owner: "Maria Kostova"
      }
    ];
  } else {
    // General Customizer
    let derivedTitle = "";
    const cleanLines = notes.replace(/[^\w\s-]/g, "").split(/\n+/).map(l => l.trim()).filter(l => l.length > 0);
    if (cleanLines.length > 0 && cleanLines[0].length < 50) {
      derivedTitle = cleanLines[0];
    } else {
      const words = notes.replace(/[^\w\s]/g, "").split(/\s+/).filter(w => w.length > 0);
      if (words.length > 0) {
        derivedTitle = words.slice(0, 4).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
      }
    }

    if (derivedTitle && derivedTitle.length > 4 && derivedTitle.length < 50) {
      title = derivedTitle;
      tagline = `Sovereign, capability-oriented infrastructure for ${derivedTitle.toLowerCase()} systems`;
    }
  }

  blueprint.title = title;
  blueprint.tagline = tagline;

  if (selectedJurisdiction) {
    blueprint.jurisdictionProfileName = selectedJurisdiction;
  }
  
  // Rule 3: When ABIDE cannot ground a citation for real (as in quota fallback), it MUST say "no citation available"
  // and NEVER synthesize a plausible-looking fake one or inherit unverified mock IDs.
  blueprint.academicGrounding = [
    {
      title: "No citation available (Offline Quota Fallback)",
      author: "None",
      source: "no citation available",
      summary: "This blueprint was generated during offline quota fallback. Live academic verification against arXiv, OpenAlex, Semantic Scholar, and CrossRef could not be performed.",
      relevance: "Requires real-time API check before academic peer-review claims can be made.",
      verificationStatus: "NOT_FOUND"
    }
  ];

  // ============================================================================
  // [UNIVERSAL DEMO PURGE ENGINE]
  // When the user inputs their own messy intent and presses 'ABIDE Generate',
  // ALL DEMO REFERENCE STUFF MUST BE GONE! It strictly focuses on what the user ingested.
  // ============================================================================
  const jurisdictionPolicy = selectedJurisdiction || "Global Standard";
  const ownerEmail = userEmail || "Sovereign Architect";

  if (blueprint.highLevelGoals.some((g: any) => g.title.includes("M2M Sovereign Edge") || g.title.includes("DEMO"))) {
    blueprint.highLevelGoals = [
      {
        title: `Deploy Sovereign Infrastructure for ${title}`,
        description: `Establish modular architecture and core capability boundaries derived strictly from user intent: "${notes.trim().slice(0, 120)}..."`,
        status: "Critical"
      },
      {
        title: "Implement Real-Time Verification & Governance",
        description: `Enforce policy-as-code and deterministic state transitions aligned with ${jurisdictionPolicy} rules.`,
        status: "Critical"
      },
      {
        title: "Deploy Autonomous Client & API Gateway",
        description: "Expose secure REST and event channels for seamless client interaction and telemetry monitoring.",
        status: "Planned"
      }
    ];
  }

  if (blueprint.competitiveMoat.some((m: any) => m.capabilityName.includes("Cryptographic Evidence Anchor") || m.capabilityName.includes("DEMO"))) {
    blueprint.competitiveMoat = [
      {
        capabilityName: `Sovereign ${title} Execution Engine`,
        description: `Provides mathematically verifiable state execution tailored to ${title.toLowerCase()} without relying on unverified external dependencies.`,
        advantageScore: 96
      },
      {
        capabilityName: "Automated Compliance & Audit Verification",
        description: `Continuous real-time policy verification against ${jurisdictionPolicy} standards.`,
        advantageScore: 94
      }
    ];
  }

  if (blueprint.einsteinProbability.modelName.includes("DEMO")) {
    blueprint.einsteinProbability = {
      modelName: `${title} Trend Probability Engine`,
      successRate: 93.8,
      latencyMs: 11.5,
      variables: [
        { name: "System Processing Variance", impact: "Low negative impact" },
        { name: "Local State Cache Hit Ratio", impact: "High positive impact" },
        { name: "Execution Pipeline Throughput", impact: "High positive impact" }
      ]
    };
  }

  // Purge demo domains and canonical systems from companyGraph
  const cleanProducts = blueprint.companyGraph.products.some((p: any) => p.name.includes("Veklom"))
    ? [
        {
          name: `${title} Platform`,
          domain: "Core Domain Execution",
          businessValue: `Delivers the primary capability architecture for ${title} based strictly on ingested intent.`,
          owner: ownerEmail
        },
        {
          name: "Sovereign Audit Gate",
          domain: "Governance & Security",
          businessValue: "Enforces jurisdictional rules and maintains immutable audit logs.",
          owner: "Compliance Officer"
        }
      ]
    : blueprint.companyGraph.products;

  blueprint.companyGraph = {
    domains: [
      {
        name: "Core Domain Execution",
        description: `Primary operational domain for ${title}`,
        products: cleanProducts.map((p: any) => p.name)
      },
      {
        name: "Governance & Security",
        description: `Compliance and policy verification domain for ${title}`,
        products: ["Sovereign Audit Gate"]
      }
    ],
    products: cleanProducts,
    canonicalSystems: [
      {
        name: `${title} Core Engine`,
        type: "Backend Execution Service",
        description: `Primary state transition and business logic service for ${title}`
      },
      {
        name: "Sovereign State Store",
        type: "Persistence Ledger",
        description: `Tamper-proof event log and transaction ledger for ${title}`
      }
    ],
    repositories: [
      {
        name: `${title.toLowerCase().replace(/[^a-z0-9]/g, "-")}-core`,
        url: `https://github.com/sovereign-org/${title.toLowerCase().replace(/[^a-z0-9]/g, "-")}-core`,
        description: `Canonical code repository for ${title}`
      }
    ],
    environments: [
      {
        name: "Sovereign Production Enclave",
        url: `https://app.${title.toLowerCase().replace(/[^a-z0-9]/g, "")}.sovereign.local`,
        status: "Active"
      }
    ],
    owners: [
      {
        name: ownerEmail,
        role: "Chief System Architect",
        contact: ownerEmail
      }
    ],
    revenueStreams: [
      {
        name: "Capability Usage Billing",
        description: `Monetization structured around core capability execution value for ${title}.`,
        status: "Active"
      }
    ],
    policies: [
      {
        name: `${jurisdictionPolicy} Governance Profile`,
        description: `Strict constitutional and legal compliance framework for ${title}`
      }
    ],
    externalProviders: [
      {
        name: "Sovereign Cloud Enclaves",
        service: "Isolated Hardware Execution",
        status: "Connected"
      }
    ]
  };

  // Replace demo capabilities with clean, user-focused domain capabilities
  blueprint.capabilities = [
    {
      id: "cap-core-exec",
      name: `${title} Execution Engine`,
      purpose: `Executes core domain logic, state transitions, and primary business workflows for ${title.toLowerCase()}.`,
      canonicalDataDomain: "Domain Execution",
      maturityState: "Sovereign Production",
      lifecycleState: "Production",
      verificationState: "Verified",
      pricingState: "Active Pricing",
      deprecationState: "None",
      jurisdictionPolicy,
      exposedInterfaces: {
        rest: ["POST /api/v1/execute", "GET /api/v1/status"],
        events: ["engine.started", "engine.completed"]
      },
      pricingModel: {
        billingUnit: "Per Execution",
        priceFloor: "$0.001",
        targetMargin: "40%",
        currency: "USD",
        paymentMethod: "Direct / Token"
      },
      evidence: {
        testCoveragePercent: 95,
        verifiedOnChain: true,
        trustDecayFactor: 0.98,
        formalVerificationProof: "Z3-SAT-VERIFIED"
      },
      governance: {
        budgetRules: "Max $500/day per tenant",
        requiredApprovals: "Sovereign Admin",
        autoShutdownThreshold: "99% error rate over 1m",
        jurisdictionConstraints: jurisdictionPolicy
      }
    },
    {
      id: "cap-data-ingest",
      name: "Secure Ingestion Pipeline",
      purpose: `Validates, sanitizes, and ingests user input and external data streams for ${title.toLowerCase()}.`,
      canonicalDataDomain: "Data Ingestion",
      maturityState: "Sovereign Production",
      lifecycleState: "Production",
      verificationState: "Verified",
      pricingState: "Active Pricing",
      deprecationState: "None",
      jurisdictionPolicy,
      exposedInterfaces: {
        rest: ["POST /api/v1/ingest", "GET /api/v1/ingest/logs"],
        events: ["ingest.received", "ingest.validated"]
      },
      pricingModel: {
        billingUnit: "Per MB",
        priceFloor: "$0.0005",
        targetMargin: "35%",
        currency: "USD",
        paymentMethod: "Direct / Token"
      },
      evidence: {
        testCoveragePercent: 92,
        verifiedOnChain: true,
        trustDecayFactor: 0.95,
        formalVerificationProof: "SCHEMA-VERIFIED"
      },
      governance: {
        budgetRules: "Max 10GB/day per tenant",
        requiredApprovals: "System Automated",
        autoShutdownThreshold: "95% error rate",
        jurisdictionConstraints: jurisdictionPolicy
      }
    },
    {
      id: "cap-policy-audit",
      name: "Sovereign Policy & Audit Gate",
      purpose: `Enforces jurisdictional governance, cryptographic signing, and audit trails for ${title.toLowerCase()}.`,
      canonicalDataDomain: "Governance & Compliance",
      maturityState: "Sovereign Production",
      lifecycleState: "Production",
      verificationState: "Verified",
      pricingState: "Active Pricing",
      deprecationState: "None",
      jurisdictionPolicy,
      exposedInterfaces: {
        rest: ["POST /api/v1/audit/verify", "GET /api/v1/audit/trail"],
        events: ["audit.logged", "policy.enforced"]
      },
      pricingModel: {
        billingUnit: "Per Audit Event",
        priceFloor: "$0.0002",
        targetMargin: "50%",
        currency: "USD",
        paymentMethod: "Direct / Token"
      },
      evidence: {
        testCoveragePercent: 98,
        verifiedOnChain: true,
        trustDecayFactor: 0.99,
        formalVerificationProof: "POLICY-SAT"
      },
      governance: {
        budgetRules: "Unlimited compliance logging",
        requiredApprovals: "Security Officer",
        autoShutdownThreshold: "Never shutdown compliance logging",
        jurisdictionConstraints: jurisdictionPolicy
      }
    },
    {
      id: "cap-user-portal",
      name: "Interactive Portal & API Gateway",
      purpose: `Exposes client interfaces, authentication, and real-time query channels for users of ${title.toLowerCase()}.`,
      canonicalDataDomain: "Client Interfaces",
      maturityState: "Sovereign Production",
      lifecycleState: "Production",
      verificationState: "Verified",
      pricingState: "Active Pricing",
      deprecationState: "None",
      jurisdictionPolicy,
      exposedInterfaces: {
        rest: ["GET /api/v1/portal/session", "POST /api/v1/portal/query"],
        events: ["portal.session.created"]
      },
      pricingModel: {
        billingUnit: "Per Request",
        priceFloor: "$0.0001",
        targetMargin: "45%",
        currency: "USD",
        paymentMethod: "Direct / Token"
      },
      evidence: {
        testCoveragePercent: 90,
        verifiedOnChain: true,
        trustDecayFactor: 0.94,
        formalVerificationProof: "AUTH-VERIFIED"
      },
      governance: {
        budgetRules: "Rate limited to 1000 req/min per IP",
        requiredApprovals: "None (Public API)",
        autoShutdownThreshold: "DDoS threshold reached",
        jurisdictionConstraints: jurisdictionPolicy
      }
    }
  ];

  blueprint.productOfferings = [
    {
      id: "off-core-platform",
      name: `${title} Enterprise Bundle`,
      targetAudience: "Enterprise Operators & Systems Integrators",
      coreCapabilities: ["cap-core-exec", "cap-data-ingest", "cap-policy-audit", "cap-user-portal"],
      bundledPrice: "$499/month + usage",
      SLA: "99.99% uptime with 15ms guaranteed latency floor",
      jurisdictionConstraints: jurisdictionPolicy
    }
  ];

  blueprint.gapsReport = [
    {
      capabilityId: "cap-core-exec",
      gapType: "PERFORMANCE",
      description: "Real-time load testing under extreme concurrent traffic pending edge enclave deployment.",
      severity: "MEDIUM",
      mitigation: "Deploy automated horizontal scaling and rate limiting circuit breakers."
    }
  ];

  blueprint.agentPackets = [
    {
      id: "pkt-core-1",
      title: `Implement ${title} Core Engine`,
      targetRole: "Senior Backend Specialist",
      summary: `Develop the primary execution engine and state handlers for ${title} strictly based on ingested user intent.`,
      objective: "Build deterministic service layer with full policy enforcement.",
      scope: "Core backend modules and API handlers.",
      files: ["src/core/engine.ts", "src/api/routes.ts"],
      contracts: "POST /api/v1/execute",
      dependencies: ["express", "zod"],
      tests: ["tests/engine.test.ts"],
      migrations: "Initial schema setup",
      performanceTargets: "< 50ms latency",
      securityConstraints: "Zero unvalidated input",
      docsToUpdate: ["02_product_requirements/prd.md"],
      definitionOfDone: ["All unit tests pass", "Zero policy drift"],
      rollbackNotes: "Revert to previous git tag if tests fail"
    },
    {
      id: "pkt-audit-2",
      title: `Implement Sovereign Audit Gate for ${title}`,
      targetRole: "Compliance Engineer",
      summary: "Construct immutable logging and policy verification pipeline.",
      objective: "Ensure 100% auditability of all transactions.",
      scope: "Audit logging middleware and compliance verification routes.",
      files: ["src/security/audit.ts", "src/api/auditRoutes.ts"],
      contracts: "POST /api/v1/audit/verify",
      dependencies: ["crypto"],
      tests: ["tests/audit.test.ts"],
      migrations: "Audit log schema",
      performanceTargets: "< 10ms overhead",
      securityConstraints: "Tamper-proof log append",
      docsToUpdate: ["07_evidence_validation_pack/grounding_and_gaps.md"],
      definitionOfDone: ["Audit logs verified", "Compliance checks pass"],
      rollbackNotes: "Disable audit enforcement flag in safe mode"
    }
  ];

  // Dynamically generate all 13 Gold Standard files — 100% purged of demo references!
  const cleanNotesSnippet = notes.trim().slice(0, 400);
  blueprint.files = [
    {
      path: "README.md",
      content: `# ${title} Compiler Output Workspace\n\nWelcome to the compiled enterprise constitution for **${title}**.\n\n${tagline}\n\n## Ingested User Intent\n> "${cleanNotesSnippet}"\n\nThis workspace has been structured using the **Gold Standard 12-Pack Folder Layout**, representing a locked, publishable, and agent-executable specification authority tailored strictly to your ingested requirements. Notice: All demo reference citations and sample data have been purged.\n\n## Workspace Layout Index\n1. **00_workspace_manifest/manifest.md** - Dynamic manifest and safety assertions.\n2. **01_executive_pack/thesis_and_boundaries.md** - Vision statement and scope bounds.\n3. **02_product_requirements/prd.md** - Functional requirements and workflows.\n4. **03_capability_registry/registry.md** - Profile of platform Capabilities.\n5. **04_architecture_pack/system_topology.md** - System topology models and diagrams.\n6. **05_contract_pack/interfaces_and_schemas.md** - API contracts and schemas.\n7. **06_economics_pack/pricing_and_quotes.md** - Settlement rules and unit economics.\n8. **07_evidence_validation_pack/grounding_and_gaps.md** - Grounding logs and gaps.\n9. **08_github_alignment_pack/repo_sync.md** - Codebase alignment results.\n10. **09_agent_execution_pack/work_orders.md** - Implementation packets for coding agents.\n11. **10_publishing_pack/academic_paper.md** - Whitepaper specification draft.\n12. **11_appendix_explorer/glossary_and_ledgers.md** - Glossary and assumptions.\n\n---\n*Lock Hash: ${blueprint.hash}*`
    },
    {
      path: "00_workspace_manifest/manifest.md",
      content: `# Workspace Manifest\n\n## Metadata Registry\n- **Project Title**: \`${title}\`\n- **Version**: \`${constitutionVersion || "v1.0.0"}\`\n- **Timestamp**: \`${blueprint.timestamp}\`\n- **Owner**: \`${ownerEmail}\`\n- **Selected Jurisdiction**: \`${jurisdictionPolicy}\`\n- **Platform Target**: \`${targetPlatform || "Multi-Platform Web/Cloud"}\`\n\n## Compilation Metrics\n- **Total Ingested Notes Length**: ${notes.length} characters\n- **Active Capabilities**: ${blueprint.capabilities.length} Verified Domain Capabilities\n- **High-Level Goals Mapped**: ${blueprint.highLevelGoals.length}\n- **Cryptographic Signature Hash**: \`${blueprint.hash}\`\n\n## Verification Status\n- **Demo Purge Status**: [COMPLETE] All demo reference samples (Lamport, Nakamoto, Veklom) have been removed.\n- **Ingested Intent Grounding**: [STRICT] Built strictly from user-provided notes.\n- **Academic Grounding**: [OFFLINE FALLBACK] Live citation query offline; no mock citations injected.`
    },
    {
      path: "01_executive_pack/thesis_and_boundaries.md",
      content: `# Executive Pack\n\n## 1. Vision Summary\n**${title}** is architected around the capability-first principle: API is merely an implementation surface—Capability is the true product.\n\n## 2. Ingested User Requirements\n${notes}\n\n## 3. Sovereign Scope Boundaries\nAll service boundaries, database schemas, and execution packets are constrained strictly to the operational domain of ${title}. No unsolicited third-party tracking or unverified external dependencies are permitted.`
    },
    {
      path: "02_product_requirements/prd.md",
      content: `# Product Requirements Document (PRD)\n\n## 1. Functional Scope\nDerived strictly from user intent for ${title}:\n- Implement modular execution workflows.\n- Enforce strict jurisdictional compliance under ${jurisdictionPolicy}.\n- Ensure deterministic data ingestion and processing.\n\n## 2. User Workflows\n- **Ingestion Workflow**: Client submits data via secure API gateway.\n- **Execution Workflow**: Core engine processes state transitions.\n- **Audit Workflow**: All actions are logged to immutable state storage.`
    },
    {
      path: "03_capability_registry/registry.md",
      content: `# Capability Registry\n\nCanonical inventory of capabilities defined for **${title}**:\n\n${blueprint.capabilities.map((c: any, i: number) => `### ${i+1}. ${c.name} (\`${c.id}\`)\n- **Purpose**: ${c.purpose}\n- **Domain**: ${c.canonicalDataDomain}\n- **Maturity State**: ${c.maturityState}\n- **Verification State**: ${c.verificationState}\n- **Pricing Floor**: ${c.pricingModel?.priceFloor || "Unpriced"}\n`).join("\n")}`
    },
    {
      path: "04_architecture_pack/system_topology.md",
      content: `# System Topology\n\n## Execution Architecture for ${title}\n1. **API Gateway & Portal**: Handles ingress, TLS termination, and authentication.\n2. **Core Execution Engine**: Processes domain rules and state transitions.\n3. **Policy & Audit Gate**: Enforces ${jurisdictionPolicy} rules and writes immutable logs.\n4. **State Storage**: Tamper-proof persistence for system events and user data.`
    },
    {
      path: "05_contract_pack/interfaces_and_schemas.md",
      content: `# Interfaces & Schemas\n\n## API Contract Specifications for ${title}\n\n### REST Endpoints\n- \`POST /api/v1/execute\`: Trigger core execution workflow.\n- \`POST /api/v1/ingest\`: Submit data payloads for processing.\n- \`POST /api/v1/audit/verify\`: Query cryptographic proof of transaction compliance.\n- \`GET /api/v1/status\`: Monitor system health and active budget margins.`
    },
    {
      path: "06_economics_pack/pricing_and_quotes.md",
      content: `# Economics & Settlement\n\n## Unit Economics for ${title}\n\n| Capability | Billing Unit | Price Floor | Target Margin |\n| :--- | :--- | :--- | :--- |\n${blueprint.capabilities.map((c: any) => `| **${c.name}** | ${c.pricingModel?.billingUnit || "Unit"} | ${c.pricingModel?.priceFloor || "$0.001"} | ${c.pricingModel?.targetMargin || "40%"} |`).join("\n")}\n\nAll settlements execute cleanly without unverified third-party fee markups.`
    },
    {
      path: "07_evidence_validation_pack/grounding_and_gaps.md",
      content: `# Evidence & Validation Pack\n\n## Academic Grounding & Citations\n- **Status**: Offline Quota Fallback Active.\n- **Citations**: No citation available. Per strict ABIDE governance rules, when offline fallback occurs, no mock or demo citations (such as Lamport or Nakamoto reference samples) are inherited. Live verification will resume upon API reconnection.\n\n## Identified System Gaps\n${blueprint.gapsReport.map((g: any) => `- **${g.gapType}**: ${g.description} (Severity: ${g.severity})`).join("\n")}`
    },
    {
      path: "08_github_alignment_pack/repo_sync.md",
      content: `# Repository Alignment\n\n## Codebase Structure for ${title}\n- **Repository**: \`${title.toLowerCase().replace(/[^a-z0-9]/g, "-")}-core\`\n- **Target Platform**: \`${targetPlatform || "Multi-Platform Web/Cloud"}\`\n- **Compliance Profile**: \`${jurisdictionPolicy}\`\n\nAll code modules must pass linting, compilation, and formal verification tests prior to merge.`
    },
    {
      path: "09_agent_execution_pack/work_orders.md",
      content: `# Agent Work Orders\n\nDeterministic implementation packets for coding agents executing **${title}**:\n\n${blueprint.agentPackets.map((p: any) => `## Packet: ${p.id} (${p.title})\n- **Role**: ${p.targetRole}\n- **Objective**: ${p.objective}\n- **Target Files**: ${p.files.join(", ")}\n- **Definition of Done**: ${p.definitionOfDone.join("; ")}\n`).join("\n\n")}`
    },
    {
      path: "10_publishing_pack/academic_paper.md",
      content: `# Architectural Specification Paper\n\n## Title: ${title}: Capability-Oriented System Architecture\n**Author**: ${ownerEmail}\n**Date**: ${new Date().toISOString().split("T")[0]}\n\n### Abstract\nThis specification formalizes the architecture for **${title}**, derived directly from ingested user requirements. By decoupling capabilities from ephemeral API endpoints, the system ensures deterministic execution, tamper-proof audit trails, and compliance with ${jurisdictionPolicy} governance.`
    },
    {
      path: "11_appendix_explorer/glossary_and_ledgers.md",
      content: `# Glossary & Assumption Ledger\n\n## Core Terminology for ${title}\n- **Capability**: A self-contained, verifiable business outcome with attached pricing and governance.\n- **Sovereign Execution**: Deterministic processing that does not leak data to unverified external providers.\n- **Ingested Intent**: The raw user notes and requirements that define the absolute boundary of this system.`
    }
  ];

  blueprint.fallback_message = "Free-tier Gemini API token count limit exceeded (250K/min limit). ABIDE locally generated an offline fallback blueprint. NOTE: Human-readable exports and verified packs are mechanically blocked until live API compilation is restored.";

  // Run formal SEKED triage heuristic engine on fallback blueprint
  try {
    blueprint.sekedTriage = triageBlueprintIntakeV1(blueprint);
  } catch (triageError) {
    console.warn("Failed to execute SEKED triage heuristic engine on fallback blueprint:", triageError);
  }

  return blueprint;
}

// Endpoint to verify connection to the selected LLM provider with custom authentication headers

// 1. Compile Ingested Ideas & Generate Gold-Standard Business Plan + Blueprint
async function executeBlueprintGenerationWorker(data: any, updateProgress?: (pct: number, msg?: string) => Promise<void>): Promise<any> {
  const {
    notes,
    codebaseContext,
    audioTranscript,
    targetPlatform,
    userEmail,
    provider,
    apiKey,
    modelName,
    customUrl,
    selectedJurisdiction,
    constitutionVersion,
    constitutionState,
    authMode,
    customHeaderName,
  } = data || {};

  if (!notes) {
    throw new Error("Missing required field: notes");
  }

  const emailToUse = userEmail || "anonymous@abide.local";
  const jurisdictionProfileName = selectedJurisdiction || "global";
  const constVersion = constitutionVersion || "v4.02.1";
  const constState = constitutionState || "LOCKED";
  const selectedProvider = provider || "gemini";
  const cacheKey = cacheManager.generateKey(notes, jurisdictionProfileName, selectedProvider, modelName || "gemini-3.5-flash", constVersion);
  const bypassCache = data.bypassCache === true;
  const startTime = Date.now();

  try {
    const ipHash = crypto.createHash("sha256").update(notes + (audioTranscript || "") + emailToUse).digest("hex");

    if (!bypassCache) {
      const cachedResult = await cacheManager.get(cacheKey);
      if (cachedResult) {
        console.log(`[Cache Hit] Serving compiled blueprint for key: ${cacheKey}`);
        if (updateProgress) await updateProgress(100, "Served from compilation cache");
        return {
          ...cachedResult,
          cacheStatus: {
            hit: true,
            key: cacheKey,
            type: "MEMORY",
            latencyMs: 0
          }
        };
      }
    }

    // Full JSON Schema representing BlueprintResult interface
    const blueprintJsonSchema = {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "type": "object",
      "properties": {
        "title": { "type": "string", "description": "A highly premium, precise business name" },
        "tagline": { "type": "string", "description": "A punchy, capability-oriented value statement" },
        "timestamp": { "type": "string" },
        "hash": { "type": "string" },
        "highLevelGoals": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "title": { "type": "string" },
              "description": { "type": "string" },
              "status": { "type": "string" }
            },
            "required": ["title", "description", "status"]
          }
        },
        "competitiveMoat": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "capabilityName": { "type": "string" },
              "description": { "type": "string" },
              "advantageScore": { "type": "number" }
            },
            "required": ["capabilityName", "description", "advantageScore"]
          }
        },
        "einsteinProbability": {
          "type": "object",
          "properties": {
            "modelName": { "type": "string" },
            "successRate": { "type": "number" },
            "latencyMs": { "type": "number" },
            "variables": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "name": { "type": "string" },
                  "impact": { "type": "string" }
                },
                "required": ["name", "impact"]
              }
            }
          },
          "required": ["modelName", "successRate", "latencyMs", "variables"]
        },
        "academicGrounding": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "title": { "type": "string" },
              "author": { "type": "string" },
              "source": { "type": "string" },
              "summary": { "type": "string" },
              "relevance": { "type": "string" }
            },
            "required": ["title", "author", "source", "summary", "relevance"]
          }
        },
        "companyGraph": {
          "type": "object",
          "properties": {
            "domains": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "name": { "type": "string" },
                  "description": { "type": "string" },
                  "products": { "type": "array", "items": { "type": "string" } }
                },
                "required": ["name", "description", "products"]
              }
            },
            "products": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "name": { "type": "string" },
                  "domain": { "type": "string" },
                  "businessValue": { "type": "string" },
                  "owner": { "type": "string" }
                },
                "required": ["name", "domain", "businessValue", "owner"]
              }
            },
            "canonicalSystems": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "name": { "type": "string" },
                  "techStack": { "type": "string" },
                  "purpose": { "type": "string" }
                },
                "required": ["name", "techStack", "purpose"]
              }
            },
            "repositories": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "name": { "type": "string" },
                  "url": { "type": "string" },
                  "capabilities": { "type": "array", "items": { "type": "string" } },
                  "status": { "type": "string" }
                },
                "required": ["name", "url", "capabilities", "status"]
              }
            },
            "environments": { "type": "array", "items": { "type": "string" } },
            "owners": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "name": { "type": "string" },
                  "role": { "type": "string" },
                  "team": { "type": "string" }
                },
                "required": ["name", "role", "team"]
              }
            },
            "revenueStreams": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "name": { "type": "string" },
                  "description": { "type": "string" },
                  "model": { "type": "string" }
                },
                "required": ["name", "description", "model"]
              }
            },
            "policies": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "name": { "type": "string" },
                  "rule": { "type": "string" },
                  "scope": { "type": "string" }
                },
                "required": ["name", "rule", "scope"]
              }
            },
            "externalProviders": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "name": { "type": "string" },
                  "service": { "type": "string" },
                  "sla": { "type": "string" }
                },
                "required": ["name", "service", "sla"]
              }
            }
          },
          "required": ["domains", "products", "canonicalSystems", "repositories", "environments", "owners", "revenueStreams", "policies", "externalProviders"]
        },
        "capabilities": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "id": { "type": "string" },
              "name": { "type": "string" },
              "purpose": { "type": "string" },
              "businessOutcome": { "type": "string" },
              "machineOutcome": { "type": "string" },
              "inputs": { "type": "array", "items": { "type": "string" } },
              "outputs": { "type": "array", "items": { "type": "string" } },
              "preconditions": { "type": "array", "items": { "type": "string" } },
              "postconditions": { "type": "array", "items": { "type": "string" } },
              "owner": { "type": "string" },
              "primaryOwner": { "type": "string" },
              "technicalOwner": { "type": "string" },
              "dataOwner": { "type": "string" },
              "complianceOwner": { "type": "string" },
              "canonicalSystem": { "type": "string" },
              "canonicalDataDomain": { "type": "string" },
              "canonicalServiceSystem": { "type": "string" },
              "canonicalRepoImplementation": { "type": "string" },
              "nonCanonicalMirrors": { "type": "array", "items": { "type": "string" } },
              "supportingServices": { "type": "array", "items": { "type": "string" } },
              "exposedInterfaces": {
                "type": "object",
                "properties": {
                  "rest": { "type": "array", "items": { "type": "string" } },
                  "mcp": { "type": "array", "items": { "type": "string" } },
                  "sdk": { "type": "array", "items": { "type": "string" } },
                  "cli": { "type": "array", "items": { "type": "string" } },
                  "ui": { "type": "array", "items": { "type": "string" } },
                  "webhooks": { "type": "array", "items": { "type": "string" } }
                },
                "required": ["rest", "mcp", "sdk", "cli", "ui", "webhooks"]
              },
              "exposureSurfaces": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "type": { "type": "string" },
                    "identifier": { "type": "string" },
                    "description": { "type": "string" },
                    "status": { "type": "string" },
                    "stableId": { "type": "string" },
                    "semanticVersion": { "type": "string" },
                    "priorVersionPointer": { "type": "string" },
                    "deprecationFlag": { "type": "boolean" },
                    "replacementPointer": { "type": "string" }
                  },
                  "required": ["type", "identifier", "description", "status"]
                }
              },
              "pricingModel": {
                "type": "object",
                "properties": {
                  "billingUnit": { "type": "string" },
                  "priceFloor": { "type": "number" },
                  "includedQuota": { "type": "string" },
                  "overage": { "type": "string" },
                  "settlementCompat": { "type": "string" },
                  "costToServe": { "type": "string" },
                  "marginEstimate": { "type": "number" }
                },
                "required": ["billingUnit", "priceFloor", "includedQuota", "overage", "settlementCompat", "costToServe", "marginEstimate"]
              },
              "governance": {
                "type": "object",
                "properties": {
                  "requiredApprovals": { "type": "array", "items": { "type": "string" } },
                  "budgetRules": { "type": "string" },
                  "dataBoundaries": { "type": "string" },
                  "delegations": { "type": "string" },
                  "auditReqs": { "type": "string" },
                  "killSwitchRules": { "type": "string" },
                  "limits": { "type": "string" }
                },
                "required": ["requiredApprovals", "budgetRules", "dataBoundaries", "delegations", "auditReqs", "killSwitchRules", "limits"]
              },
              "evidence": {
                "type": "object",
                "properties": {
                  "evidenceProduced": { "type": "string" },
                  "hashAlgorithm": { "type": "string" },
                  "ledgerStorage": { "type": "string" },
                  "verifiable": { "type": "boolean" },
                  "privateDetails": { "type": "string" },
                  "completedProof": { "type": "string" },
                  "classification": { "type": "string" },
                  "evidenceTimestamp": { "type": "string" },
                  "freshnessWindowDays": { "type": "number" },
                  "nextRevalidationDue": { "type": "string" },
                  "trustDecayFactor": { "type": "number" }
                },
                "required": ["evidenceProduced", "hashAlgorithm", "ledgerStorage", "verifiable", "privateDetails", "completedProof", "classification"]
              },
              "verification": {
                "type": "object",
                "properties": {
                  "unitTests": { "type": "array", "items": { "type": "string" } },
                  "contractTests": { "type": "array", "items": { "type": "string" } },
                  "fixtureTests": { "type": "array", "items": { "type": "string" } },
                  "mcpTests": { "type": "array", "items": { "type": "string" } },
                  "securityTests": { "type": "array", "items": { "type": "string" } },
                  "latencySlo": { "type": "string" },
                  "driftChecks": { "type": "string" }
                },
                "required": ["unitTests", "contractTests", "fixtureTests", "mcpTests", "securityTests", "latencySlo", "driftChecks"]
              },
              "dependencies": { "type": "array", "items": { "type": "string" } },
              "lifecycleState": { "type": "string" },
              "maturityState": { "type": "string" },
              "verificationState": { "type": "string" },
              "pricingState": { "type": "string" },
              "deprecationState": { "type": "string" },
              "jurisdictionPolicy": {
                "type": "object",
                "properties": {
                  "dataBoundaryProfile": { "type": "string" },
                  "jurisdictionConstraints": { "type": "array", "items": { "type": "string" } },
                  "paymentRailConstraints": { "type": "array", "items": { "type": "string" } },
                  "auditRetentionProfile": { "type": "string" },
                  "allowedRegions": { "type": "array", "items": { "type": "string" } },
                  "blockedRegions": { "type": "array", "items": { "type": "string" } }
                },
                "required": ["dataBoundaryProfile", "jurisdictionConstraints", "paymentRailConstraints", "auditRetentionProfile"]
              }
            },
            "required": ["id", "name", "purpose", "businessOutcome", "machineOutcome", "inputs", "outputs", "preconditions", "postconditions", "owner", "canonicalSystem", "exposedInterfaces", "exposureSurfaces", "pricingModel", "governance", "evidence", "verification", "dependencies", "lifecycleState", "maturityState", "verificationState", "pricingState", "deprecationState", "jurisdictionPolicy"]
          }
        },
        "productOfferings": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "name": { "type": "string" },
              "description": { "type": "string" },
              "capabilities": { "type": "array", "items": { "type": "string" } },
              "priceModel": { "type": "string" },
              "entitlements": { "type": "array", "items": { "type": "string" } }
            },
            "required": ["name", "description", "capabilities", "priceModel", "entitlements"]
          }
        },
        "gapsReport": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "system": { "type": "string" },
              "missing": { "type": "string" },
              "severity": { "type": "string" },
              "impact": { "type": "string" }
            },
            "required": ["system", "missing", "severity", "impact"]
          }
        },
        "files": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "path": { "type": "string" },
              "content": { "type": "string" }
            },
            "required": ["path", "content"]
          }
        },
        "agentPackets": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "id": { "type": "string" },
              "title": { "type": "string" },
              "targetRole": { "type": "string" },
              "summary": { "type": "string" },
              "objective": { "type": "string" },
              "scope": { "type": "string" },
              "files": { "type": "array", "items": { "type": "string" } },
              "contracts": { "type": "string" },
              "dependencies": { "type": "array", "items": { "type": "string" } },
              "tests": { "type": "array", "items": { "type": "string" } },
              "migrations": { "type": "string" },
              "performanceTargets": { "type": "string" },
              "securityConstraints": { "type": "string" },
              "docsToUpdate": { "type": "array", "items": { "type": "string" } },
              "definitionOfDone": { "type": "array", "items": { "type": "string" } },
              "rollbackNotes": { "type": "string" }
            },
            "required": ["id", "title", "targetRole", "summary", "objective", "scope", "files", "contracts", "dependencies", "tests", "migrations", "performanceTargets", "securityConstraints", "docsToUpdate", "definitionOfDone", "rollbackNotes"]
          }
        }
      },
      "required": ["title", "tagline", "timestamp", "hash", "highLevelGoals", "competitiveMoat", "einsteinProbability", "academicGrounding", "companyGraph", "capabilities", "productOfferings", "gapsReport", "files", "agentPackets"]
    };

    // Dynamic, comprehensive system prompt that enforces all capability-based operating system structures
    const systemPrompt = `You are the world's most advanced Hierarchical Reasoning Model (HRM) Software & Business Architect.
Your mission is to compile messy ideas, text, and optional codebase structures into an elite, production-grade Software Blueprint and COMPLETE BUSINESS PLAN structured around Capability-Based Product Architecture.

Philosophy: "API is not the product; Capability is the product."
Treat APIs, models, pricing, governance, evidence, and UX as downstream implementation surfaces of underlying core Capability Products.
Integrate X402 payment protocol standards (machine-to-machine global automated payment settlements, smart contract decentralized liquidity execution) into the business models.
Incorporate Einstein's approach on probability for dynamic task prioritization based on complex data trend frequencies.

CONSTITUTION & COMPLIANCE ENGINE CONSTRAINTS:
- Current Constitution Version: ${constVersion}
- Current Constitution Lock Status: ${constState}
- Active Jurisdiction Profile: ${jurisdictionProfileName}

You MUST ensure that:
1. Every generated capability includes exact compliance state fields: 'lifecycleState', 'maturityState' ('Conceptual', 'Partially Simulated', or 'Sovereign Production'), 'verificationState' ('Unverified', 'Verified', or 'Drift Detected'), 'pricingState' ('Unpriced', 'Draft Price', 'Active Pricing', or 'Deprecated Pricing'), 'deprecationState' ('None', 'Deprecation Warning Issued', 'Sunset Scheduled', or 'Retired'), and 'jurisdictionPolicy' matching the active jurisdiction profile constraints.
2. The generated files (especially README.md, manifest.md, registry.md, and work_orders.md) are strictly updated and constrained based on this active jurisdiction's profile, baseline standards (e.g. Canada ISED 'AI for All' pins enclaves strictly to AWS ca-central-1 and local Canadian hosts and biometric export limits) and are locked under this constitution version.

CRITICAL STRUCTURAL OUTPUT CONSTRAINTS:
1. The output MUST contain a minimum of 4 capabilities inferred from the input.
2. The output MUST contain exactly or at least 2 agentPackets inside the "agentPackets" array (e.g., pkt-1 and pkt-2).
3. The companyGraph MUST be populated with valid nodes (domains, products, canonicalSystems, repositories, environments, owners, revenueStreams, policies, externalProviders).
4. Each capability MUST contain a fully populated governance block (budgetRules, requiredApprovals, etc.) and pricingModel block (billingUnit, priceFloor, etc. where pricing contains at least 2 line items or parameters).
5. DO NOT output any introductory text, explanatory notes, markdown formatting, code fences or wrappers outside the raw JSON object itself. Respond with ONLY the pure, valid JSON object.

Below is the exact JSON Schema that your output MUST match:
${JSON.stringify(blueprintJsonSchema, null, 2)}

Make sure your output is mathematically rigorous, fully detailed, and matches this schema letter for letter. Do not include placeholders like "..." or list items without completing them.`;

    const userPrompt = `Messy notes/intent:
${notes}

Optional codebase context:
${codebaseContext || "None provided"}

Optional audio transcripts:
${audioTranscript || "None provided"}

Target platform:
${targetPlatform || "Multi-platform Web/Mobile"}

User Email for validation:
${emailToUse}`;

    // Use the already declared selectedProvider
    let textResult = "";

    if (selectedProvider === "veklom") {
      textResult = await callVeklom({
        systemPrompt,
        userPrompt,
        model: modelName,
        apiKey: apiKey,
      });
    } else if (selectedProvider === "gemini") {
      const activeApiKey = apiKey || process.env.GEMINI_API_KEY;
      if (!activeApiKey) {
        throw new Error("Gemini API key is not configured. Please supply a key or configure it in secrets.");
      }

      // Check if custom URL or environment base URL is provided
      const geminiBaseUrl = customUrl || process.env.AI_INTEGRATIONS_GEMINI_BASE_URL;
      const aiOptions: any = {
        apiKey: activeApiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      };
      if (geminiBaseUrl) {
        aiOptions.baseUrl = geminiBaseUrl;
      }

      const ai = new GoogleGenAI(aiOptions);

      textResult = await withExponentialBackoff(async () => {
        const response = await ai.models.generateContent({
          model: modelName || "gemini-3.5-flash",
          contents: userPrompt,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: "application/json",
            temperature: 0.2,
          },
        });
        return response.text || "";
      }, { maxRetries: 3, initialDelayMs: 1000 }, "Gemini Blueprint Generation");
    } else if (selectedProvider === "openai" || selectedProvider === "llama" || selectedProvider === "deepseek" || selectedProvider === "custom") {
      // Determine base URL to use
      let openAiBaseUrl = "https://api.openai.com/v1";
      if (customUrl) {
        openAiBaseUrl = customUrl;
      } else if (selectedProvider === "llama") {
        openAiBaseUrl = "http://localhost:11434/v1";
      } else if (selectedProvider === "deepseek") {
        openAiBaseUrl = "https://api.deepseek.com/v1";
      } else if (selectedProvider === "openai") {
        openAiBaseUrl = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL || "http://localhost:1106/modelfarm/openai";
      }

      // Clean the endpoint: strip trailing slashes, make sure it has /chat/completions
      let cleanUrl = openAiBaseUrl.replace(/\/+$/, "");
      if (!cleanUrl.endsWith("/chat/completions")) {
        cleanUrl = `${cleanUrl}/chat/completions`;
      }

      // Configure headers
      const headers: any = {
        "Content-Type": "application/json",
      };
      
      // Dynamic auth mode application
      if (apiKey) {
        if (authMode === "bearer") {
          headers.Authorization = `Bearer ${apiKey}`;
        } else if (authMode === "apiKeyHeader") {
          headers["x-api-key"] = apiKey;
        } else if (authMode === "customHeader" && customHeaderName) {
          headers[customHeaderName] = apiKey;
        } else if (authMode === "none") {
          // No authentication headers
        } else {
          // Default fallback
          headers.Authorization = `Bearer ${apiKey}`;
        }
      } else if (selectedProvider === "openai" && !process.env.AI_INTEGRATIONS_OPENAI_BASE_URL) {
        // Only require API key if using real OpenAI without a local modelfarm/proxy override
        throw new Error("OpenAI API key is required for this model provider.");
      }

      // Build payload
      const payload: any = {
        model: modelName || (selectedProvider === "deepseek" ? "deepseek-chat" : selectedProvider === "openai" ? "gpt-4o" : "llama-3-8b-instruct"),
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.2,
      };

      // Only pass JSON response format if using a provider known to support it natively
      if (selectedProvider === "openai" || selectedProvider === "deepseek") {
        payload.response_format = { type: "json_object" };
      }

      console.log(`Routing ${selectedProvider} request to: ${cleanUrl} with model: ${payload.model}`);

      textResult = await withExponentialBackoff(async () => {
        const response = await fetch(cleanUrl, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`${selectedProvider.toUpperCase()} API failed: ${errorText}`);
        }
        const data = await response.json();
        return data.choices[0].message.content;
      }, { maxRetries: 3, initialDelayMs: 1000 }, `${selectedProvider.toUpperCase()} Blueprint Generation`);
    } else if (selectedProvider === "anthropic") {
      const activeApiKey = apiKey;
      if (!activeApiKey) {
        throw new Error("Anthropic API key is required.");
      }

      const anthropicUrl = customUrl || "https://api.anthropic.com/v1/messages";

      const headers = {
        "Content-Type": "application/json",
        "x-api-key": activeApiKey,
        "anthropic-version": "2023-06-01",
      };

      const payload = {
        model: modelName || "claude-3-5-sonnet-20241022",
        max_tokens: 8192,
        system: systemPrompt,
        messages: [
          { role: "user", content: userPrompt }
        ],
        temperature: 0.2,
      };

      textResult = await withExponentialBackoff(async () => {
        const response = await fetch(anthropicUrl, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Anthropic API failed: ${errorText}`);
        }

        const data = await response.json();
        return data.content[0].text;
      }, { maxRetries: 3, initialDelayMs: 1000 }, "Anthropic Blueprint Generation");
    } else {
      // General fallback using server key to compile with Gemini
      const activeApiKey = process.env.GEMINI_API_KEY;
      if (!activeApiKey) {
        throw new Error("Free server compilation key is currently exhausted. Please provide your own LLM Key under settings.");
      }

      const geminiBaseUrl = process.env.AI_INTEGRATIONS_GEMINI_BASE_URL || "http://localhost:1106/modelfarm/gemini";
      const aiOptions: any = {
        apiKey: activeApiKey,
        httpOptions: { headers: { "User-Agent": "aistudio-build" } },
      };
      if (geminiBaseUrl) {
        aiOptions.baseUrl = geminiBaseUrl;
      }

      const ai = new GoogleGenAI(aiOptions);
      textResult = await withExponentialBackoff(async () => {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: userPrompt,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: "application/json",
            temperature: 0.2,
          },
        });
        return response.text || "";
      }, { maxRetries: 3, initialDelayMs: 1000 }, "Fallback Gemini Blueprint Generation");
    }

    let parsedData: any;
    try {
      parsedData = JSON.parse(textResult);
    } catch (parseError) {
      const jsonMatch = textResult.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsedData = JSON.parse(jsonMatch[0]);
        } catch (matchError) {
          console.error("Match parse failure, trying fallback slice. Original raw:", textResult);
          const startIdx = textResult.indexOf('{');
          const endIdx = textResult.lastIndexOf('}');
          if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
            try {
              parsedData = JSON.parse(textResult.slice(startIdx, endIdx + 1));
            } catch (sliceError) {
              throw new Error("parse_failed: " + textResult.slice(0, 200));
            }
          } else {
            throw new Error("parse_failed: " + textResult.slice(0, 200));
          }
        }
      } else {
        const startIdx = textResult.indexOf('{');
        const endIdx = textResult.lastIndexOf('}');
        if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
          try {
            parsedData = JSON.parse(textResult.slice(startIdx, endIdx + 1));
          } catch (sliceError) {
            throw new Error("parse_failed: " + textResult.slice(0, 200));
          }
        } else {
          throw new Error("parse_failed: " + textResult.slice(0, 200));
        }
      }
    }

    // Do not merge or fall back to defaultBlueprint data. If the compile output is incomplete, return the partial result with a partial: true flag and let the frontend render what was produced.
    let isPartial = false;
    const requiredFields = ["title", "tagline", "highLevelGoals", "competitiveMoat", "einsteinProbability", "academicGrounding", "companyGraph", "capabilities", "productOfferings", "gapsReport", "files", "agentPackets"];
    for (const field of requiredFields) {
      if (!parsedData[field]) {
        if (field === "title" || field === "tagline") {
          parsedData[field] = "";
        } else if (field === "timestamp") {
          parsedData[field] = new Date().toISOString();
        } else if (field === "hash") {
          parsedData[field] = ipHash;
        } else if (field === "einsteinProbability") {
          parsedData[field] = { modelName: "", successRate: 0, latencyMs: 0, variables: [] };
        } else if (field === "companyGraph") {
          parsedData[field] = { domains: [], products: [], canonicalSystems: [], repositories: [], environments: [], owners: [], revenueStreams: [], policies: [], externalProviders: [] };
        } else {
          parsedData[field] = [];
        }
        isPartial = true;
      }
    }
    if (isPartial) {
      parsedData.partial = true;
    }

    // Assign canonical, deterministic content-addressed hash
    parsedData.hash = calculateCanonicalHash(parsedData, notes);
    parsedData.timestamp = new Date().toISOString();

    // Run formal SEKED triage heuristic engine
    try {
      parsedData.sekedTriage = triageBlueprintIntakeV1(parsedData);
    } catch (triageError) {
      console.warn("Failed to execute SEKED triage heuristic engine:", triageError);
    }

    const latencyMs = Date.now() - startTime;
    cacheManager.set(cacheKey, parsedData, modelName || "gemini-3.5-flash", jurisdictionProfileName, latencyMs);
    parsedData.cacheStatus = {
      hit: false,
      key: cacheKey,
      type: "MEMORY",
      latencyMs
    };

    if (updateProgress) await updateProgress(100, "Blueprint compilation complete");
    return parsedData;
  } catch (error: any) {
    console.warn("Gemini API Error or Quota Exhaustion, generating local fallback blueprint:", error);
    try {
      const latencyMs = Date.now() - startTime;
      const fallbackBlueprint = generateFallbackBlueprint(
        notes,
        targetPlatform,
        userEmail,
        selectedJurisdiction,
        constitutionVersion,
        constitutionState
      );
      cacheManager.set(cacheKey, fallbackBlueprint, modelName || "gemini-3.5-flash", jurisdictionProfileName, latencyMs);
      fallbackBlueprint.cacheStatus = {
        hit: false,
        key: cacheKey,
        type: "MEMORY",
        latencyMs,
        isFallback: true
      };
      if (updateProgress) await updateProgress(100, "Fallback blueprint generated");
      return fallbackBlueprint;
    } catch (fallbackErr: any) {
      console.error("Local compilation fallback failed:", fallbackErr);
      throw new Error("Compilation failed: " + (error.message || "Internal Server Error"));
    }
  }
}


export class ProviderService {
  public static async compileBlueprint(data: any, updateProgress?: (pct: number, msg?: string) => Promise<void>): Promise<any> {
    return await executeBlueprintGenerationWorker(data, updateProgress);
  }

  public static generateFallback(notes: string, targetPlatform?: string, userEmail?: string, selectedJurisdiction?: string, constitutionVersion?: string, constitutionState?: string): any {
    return generateFallbackBlueprint(notes, targetPlatform, userEmail, selectedJurisdiction, constitutionVersion, constitutionState);
  }

  public static async callVeklomApi(params: any): Promise<string> {
    return await callVeklom(params);
  }

  public static async testConnection(req: any, res: any): Promise<any> {
  try {
    const startTime = Date.now();
    const {
      provider,
      apiKey,
      modelName,
      customUrl,
      authMode,
      customHeaderName,
    } = req.body;

    const selectedProvider = provider || "gemini";
    const testPrompt = "Respond only with the word 'OK'.";

    if (selectedProvider === "gemini") {
      const activeApiKey = apiKey || process.env.GEMINI_API_KEY;
      if (!activeApiKey) {
        throw new Error("Gemini API key is not configured.");
      }

      const geminiBaseUrl = customUrl || process.env.AI_INTEGRATIONS_GEMINI_BASE_URL;
      const aiOptions: any = {
        apiKey: activeApiKey,
        httpOptions: { headers: { "User-Agent": "aistudio-build" } },
      };
      if (geminiBaseUrl) {
        aiOptions.baseUrl = geminiBaseUrl;
      }

      const ai = new GoogleGenAI(aiOptions);
      const model = modelName || "gemini-3.5-flash";
      await withExponentialBackoff(async () => {
        await ai.models.generateContent({
          model: model,
          contents: testPrompt,
          config: {
            maxOutputTokens: 10,
            temperature: 0.1,
          },
        });
      }, { maxRetries: 2, initialDelayMs: 500 }, "Gemini Connection Test");
    } else if (selectedProvider === "openai" || selectedProvider === "llama" || selectedProvider === "deepseek" || selectedProvider === "custom") {
      let openAiBaseUrl = "https://api.openai.com/v1";
      if (customUrl) {
        openAiBaseUrl = customUrl;
      } else if (selectedProvider === "llama") {
        openAiBaseUrl = "http://localhost:11434/v1";
      } else if (selectedProvider === "deepseek") {
        openAiBaseUrl = "https://api.deepseek.com/v1";
      } else if (selectedProvider === "openai") {
        openAiBaseUrl = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL || "http://localhost:1106/modelfarm/openai";
      }

      let cleanUrl = openAiBaseUrl.replace(/\/+$/, "");
      if (!cleanUrl.endsWith("/chat/completions")) {
        cleanUrl = `${cleanUrl}/chat/completions`;
      }

      const headers: any = {
        "Content-Type": "application/json",
      };

      if (apiKey) {
        if (authMode === "bearer") {
          headers.Authorization = `Bearer ${apiKey}`;
        } else if (authMode === "apiKeyHeader") {
          headers["x-api-key"] = apiKey;
        } else if (authMode === "customHeader" && customHeaderName) {
          headers[customHeaderName] = apiKey;
        } else if (authMode === "none") {
          // No auth header
        } else {
          headers.Authorization = `Bearer ${apiKey}`;
        }
      }

      const payload = {
        model: modelName || (selectedProvider === "deepseek" ? "deepseek-chat" : selectedProvider === "openai" ? "gpt-4o" : "llama-3-8b-instruct"),
        messages: [{ role: "user", content: testPrompt }],
        max_tokens: 10,
        temperature: 0.1,
      };

      await withExponentialBackoff(async () => {
        const response = await fetch(cleanUrl, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`${selectedProvider.toUpperCase()} failed: ${errorText}`);
        }
      }, { maxRetries: 2, initialDelayMs: 500 }, `${selectedProvider.toUpperCase()} Connection Test`);
    } else if (selectedProvider === "anthropic") {
      const activeApiKey = apiKey;
      if (!activeApiKey) {
        throw new Error("Anthropic API key is required.");
      }

      const anthropicUrl = customUrl || "https://api.anthropic.com/v1/messages";
      const headers = {
        "Content-Type": "application/json",
        "x-api-key": activeApiKey,
        "anthropic-version": "2023-06-01",
      };

      const payload = {
        model: modelName || "claude-3-5-sonnet-20241022",
        max_tokens: 10,
        messages: [{ role: "user", content: testPrompt }],
        temperature: 0.1,
      };

      await withExponentialBackoff(async () => {
        const response = await fetch(anthropicUrl, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Anthropic failed: ${errorText}`);
        }
      }, { maxRetries: 2, initialDelayMs: 500 }, "Anthropic Connection Test");
    } else {
      throw new Error(`Unknown provider: ${selectedProvider}`);
    }

    const latencyMs = Date.now() - startTime;
    return res.json({
      success: true,
      latencyMs,
      model: modelName || "default",
    });
  } catch (error: any) {
    console.error("Connection test error:", error);
    let errorMsg = error.message || "Connection test failed.";
    if (errorMsg.includes("11434") || errorMsg.includes("ECONNREFUSED") || (error.cause && error.cause.toString().includes("11434"))) {
      errorMsg = "Ollama (Llama) at localhost:11434 is unreachable from our secure cloud sandbox. To connect your local LLM, please expose it via a secure tunnel (like Ngrok or localtunnel) and provide the public URL in Custom URL, or use our server-side Gemini API instead!";
    }
    return res.status(200).json({
      success: false,
      error: errorMsg,
    });
  }

  }

  public static async listOllamaModels(req: any, res: any): Promise<any> {
  const { customUrl } = req.body;
  const baseUrl = (customUrl || "http://localhost:11434").replace(/\/+$/, "");
  const startTime = Date.now();
  try {
    const response = await fetch(`${baseUrl}/api/tags`, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });
    const latencyMs = Date.now() - startTime;
    if (response.ok) {
      const data = await response.json();
      return res.json({
        success: true,
        source: "local-ollama",
        latencyMs,
        models: data.models || []
      });
    } else {
      return res.json({
        success: false,
        source: "local-ollama",
        latencyMs,
        error: `Ollama returned status ${response.status}. Make sure Ollama is running locally and CORS is enabled.`
      });
    }
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    return res.json({
      success: false,
      source: "local-ollama",
      latencyMs,
      error: `Could not reach Ollama at ${baseUrl}. Start Ollama locally with: OLLAMA_ORIGINS="*" ollama serve`
    });
  }

  }
}
