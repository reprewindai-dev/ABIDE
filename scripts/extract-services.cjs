const fs = require('fs');
const path = require('path');

const serverContent = fs.readFileSync(path.join(__dirname, '../server.ts'), 'utf8');
const lines = serverContent.split('\n');

// Helper to get 1-indexed line range [start, end] inclusive
function getLines(start, end) {
  return lines.slice(start - 1, end).join('\n');
}

function extractRouteBody(startLine, endLine) {
  let body = getLines(startLine, endLine).replace(/\s+$/, '');
  if (body.endsWith('}});')) {
    body = body.slice(0, -4) + '  }';
  } else if (body.endsWith('});')) {
    body = body.slice(0, -3);
  }
  return body;
}

// 1. GitHubService.ts
console.log("Extracting GitHubService.ts...");
const githubAnalyzeBody = extractRouteBody(2330, 2527);
const githubPushBody = extractRouteBody(2529, 2661);

const githubServiceTs = `import { GoogleGenAI } from "@google/genai";

export class GitHubService {
  public static async analyzeRepo(req: any, res: any): Promise<any> {
${githubAnalyzeBody}
  }

  public static async pushBlueprint(req: any, res: any): Promise<any> {
${githubPushBody}
  }
}
`;
fs.writeFileSync(path.join(__dirname, '../src/server/services/GitHubService.ts'), githubServiceTs);
console.log("Created GitHubService.ts");


// 2. AcademicService.ts
console.log("Extracting AcademicService.ts...");
const academicCore = getLines(43, 188);
const academicSearchBody = extractRouteBody(1935, 2050);
const academicVerifyBody = extractRouteBody(2054, 2110);
const academicFeasibilityBody = extractRouteBody(2114, 2133);
const academicScrapeBody = extractRouteBody(2239, 2326);

const academicServiceTs = `import crypto from "crypto";
import { GoogleGenAI } from "@google/genai";
import { verifyCitation, VerificationStatus } from "../../core/citationVerifier";
import { gateMaturityClaim, TechnologyReadiness } from "../../core/feasibilityGate";

${academicCore}

export { vectorDatabase, cosineSimilarity, getEmbedding, generateFallbackVector };

export class AcademicService {
  public static async searchPapers(req: any, res: any): Promise<any> {
${academicSearchBody}
  }

  public static async verifyCitations(req: any, res: any): Promise<any> {
${academicVerifyBody}
  }

  public static async checkFeasibilityGate(req: any, res: any): Promise<any> {
${academicFeasibilityBody}
  }

  public static async scrapeArxiv(req: any, res: any): Promise<any> {
${academicScrapeBody}
  }
}
`;
fs.writeFileSync(path.join(__dirname, '../src/server/services/AcademicService.ts'), academicServiceTs);
console.log("Created AcademicService.ts");


// 3. CovenantService.ts
console.log("Extracting CovenantService.ts...");
const cappoGuard = getLines(201, 258);
const zkVerifyBody = extractRouteBody(2856, 2866);
const zkSimulateBody = extractRouteBody(2869, 2913);
const zkStatusBody = extractRouteBody(2916, 2930);
const testHarnessBody = extractRouteBody(2933, 3078);
const covenantExecuteBody = extractRouteBody(3082, 3138);
const serverApprovedPlansMap = getLines(3140, 3140);
const covenantApproveBody = extractRouteBody(3144, 3185);
const covenantProjectBody = extractRouteBody(3189, 3450);
const fallbackTestSuite = getLines(3452, 3565);

const covenantServiceTs = `import crypto from "crypto";
import fs from "fs";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { validatePlanIR, PlanIR, PlanStep, calculateBlueprintHash, computeCanonicalHash } from "../../core/plan-ir";
import { isExecutionAdapterConfigured, isPglAdapterConfigured, executeCapabilityStep, sealStepOnLedger } from "../../core/execution";
import { verifyAndValidateApprovalToken, verifyTokenForPlan } from "../../core/token";
import { SEKED_HMAC_SECRET } from "../../core/config";
import { PlanIRSchema, CanonicalBlueprintV1Schema } from "../../core/validation";
import { executeZkAttestationPipeline, verifyGroth16Pairing, verifyPlonkOrStarkCommitments, ZkAttestationRequest } from "../../core/zk-gateway";
import { cacheManager } from "../../core/cache";

${cappoGuard}

${serverApprovedPlansMap}

${fallbackTestSuite}

export { cappoBlueprintGuard, serverApprovedPlans, generateLocalFallbackTestSuite };

export class CovenantService {
  public static async verifyZkProof(req: any, res: any): Promise<any> {
${zkVerifyBody}
  }

  public static async simulateZkFlow(req: any, res: any): Promise<any> {
${zkSimulateBody}
  }

  public static async getZkStatus(req: any, res: any): Promise<any> {
${zkStatusBody}
  }

  public static async generateTestHarness(req: any, res: any): Promise<any> {
${testHarnessBody}
  }

  public static async executeCovenant(req: any, res: any): Promise<any> {
${covenantExecuteBody}
  }

  public static async approveCovenant(req: any, res: any): Promise<any> {
${covenantApproveBody}
  }

  public static async projectPlanIR(req: any, res: any): Promise<any> {
${covenantProjectBody}
  }
}
`;
fs.writeFileSync(path.join(__dirname, '../src/server/services/CovenantService.ts'), covenantServiceTs);
console.log("Created CovenantService.ts");


// 4. ProviderService.ts
console.log("Extracting ProviderService.ts...");
let callVeklomFn = getLines(259, 312);
callVeklomFn = callVeklomFn.replace(/^async function callVeklom\(/, "export async function callVeklom(");

let fallbackBlueprintFn = getLines(1161, 1787);
fallbackBlueprintFn = fallbackBlueprintFn.replace(/^function generateFallbackBlueprint\(/, "export function generateFallbackBlueprint(");

let workerFn = getLines(317, 1079);
workerFn = workerFn.replace(/^async function executeBlueprintGenerationWorker\(/, "export async function executeBlueprintGenerationWorker(");

const testConnBody = extractRouteBody(1790, 1932);
const ollamaModelsBody = extractRouteBody(3831, 3866);

const providerServiceTs = `import crypto from "crypto";
import { GoogleGenAI } from "@google/genai";
import { DEFAULT_BLUEPRINT } from "../../data/defaultBlueprint";
import { calculateBlueprintHash } from "../../core/plan-ir";
import { triageBlueprintIntakeV1 } from "../../compiler/seked";
import { cacheManager } from "../../core/cache";

export function calculateCanonicalHash(blueprint: any, intent?: string, compilerVersion = "v4.02"): string {
  return calculateBlueprintHash(blueprint);
}

${callVeklomFn}

${fallbackBlueprintFn}

${workerFn}

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
${testConnBody}
  }

  public static async listOllamaModels(req: any, res: any): Promise<any> {
${ollamaModelsBody}
  }
}
`;
fs.writeFileSync(path.join(__dirname, '../src/server/services/ProviderService.ts'), providerServiceTs);
console.log("Created ProviderService.ts");
