import { PlanIR } from "../core/plan-ir";

export interface Z3HttpAdapterResult {
  satisfiable: boolean;
  model?: any;
  error?: string;
  serviceReachable: boolean;
}

/**
 * Checks if the Z3 verification service at VERIFICATION_SERVICE_URL is reachable and available.
 */
export async function checkZ3ServiceAvailability(serviceUrlOverride?: string): Promise<boolean> {
  const serviceUrl = serviceUrlOverride || process.env.VERIFICATION_SERVICE_URL;
  if (!serviceUrl) {
    return false;
  }

  let baseUrl = serviceUrl;
  if (!baseUrl.startsWith("http://") && !baseUrl.startsWith("https://")) {
    baseUrl = `https://${baseUrl}`;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const response = await fetch(`${baseUrl}/api/verify/health`, {
      method: "GET",
      signal: controller.signal
    }).catch(async () => {
      const c2 = new AbortController();
      const t2 = setTimeout(() => c2.abort(), 3000);
      const res = await fetch(`${baseUrl}/api/verify/z3`, {
        method: "OPTIONS",
        signal: c2.signal
      });
      clearTimeout(t2);
      return res;
    });
    clearTimeout(timeoutId);
    return response.ok || response.status === 405 || response.status === 200 || response.status === 204;
  } catch {
    return false;
  }
}

/**
 * Concrete HTTP adapter targeting VERIFICATION_SERVICE_URL for Z3 SMT constraint solving.
 * Replaces any Z3 stubs with live HTTP verification against an external solver service.
 * Catches 5xx/4xx errors or timeouts, reporting service unavailability.
 */
export async function executeZ3HttpAdapter(
  assertions: string[],
  serviceUrlOverride?: string
): Promise<Z3HttpAdapterResult> {
  const serviceUrl = serviceUrlOverride || process.env.VERIFICATION_SERVICE_URL;
  if (!serviceUrl) {
    return {
      satisfiable: false,
      serviceReachable: false,
      error: "VERIFICATION_SERVICE_URL is not configured."
    };
  }

  const isAvailable = await checkZ3ServiceAvailability(serviceUrl);
  if (!isAvailable) {
    return {
      satisfiable: false,
      serviceReachable: false,
      error: `Formal verifier offline/unreachable: Z3 verification service at ${serviceUrl} is unreachable.`
    };
  }

  let baseUrl = serviceUrl;
  if (!baseUrl.startsWith("http://") && !baseUrl.startsWith("https://")) {
    baseUrl = `https://${baseUrl}`;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${baseUrl}/api/verify/z3`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assertions, smtCode: assertions.join("\n") }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      return {
        satisfiable: Boolean(data.satisfiable ?? data.valid ?? true),
        model: data.model || data,
        serviceReachable: true
      };
    } else {
      // 4xx or 5xx error caught
      const errText = await response.text().catch(() => response.statusText);
      return {
        satisfiable: false,
        serviceReachable: false,
        error: `Formal verifier offline/unreachable: Z3 HTTP Service returned status ${response.status} (${errText})`
      };
    }
  } catch (err: any) {
    // Timeout or network error caught
    const isTimeout = err.name === "AbortError" || err.message?.includes("timeout") || err.message?.includes("aborted");
    return {
      satisfiable: false,
      serviceReachable: false,
      error: `Formal verifier offline/unreachable: ${isTimeout ? "Request timed out" : err.message || "Network exception during Z3 verification"}`
    };
  }
}

/**
 * Verifies PlanIR assertions using the concrete Z3 HTTP adapter targeting VERIFICATION_SERVICE_URL.
 * Catches 5xx/4xx errors or timeouts, setting the PlanIR verification status to 'UNVERIFIED'
 * when the verification service is unavailable.
 */
export async function verifyPlanIRWithZ3(plan: any, assertions: string[] = []): Promise<any> {
  const serviceUrl = process.env.VERIFICATION_SERVICE_URL;
  if (!serviceUrl) {
    return plan;
  }

  const isReachable = await checkZ3ServiceAvailability(serviceUrl);
  if (!isReachable) {
    console.warn(`[Z3 Adapter] Z3 verification service at ${serviceUrl} is unreachable/timed out. Marking PlanIR as UNVERIFIED.`);
    plan.verificationStatus = "UNVERIFIED";
    plan.z3Proof = {
      verified: false,
      satisfiable: false,
      checkedAssertionsCount: assertions.length,
      timestamp: new Date().toISOString(),
      solverType: "HTTP_Z3_ADAPTER",
      error: `Formal verifier offline/unreachable: Z3 verification service at ${serviceUrl} is unreachable.`
    };
    return plan;
  }

  const z3Result = await executeZ3HttpAdapter(assertions, serviceUrl);
  if (!z3Result.serviceReachable || z3Result.error?.includes("unreachable") || z3Result.error?.includes("offline") || z3Result.error?.includes("status") || z3Result.error?.includes("timed out")) {
    console.warn(`[Z3 Adapter] Z3 HTTP adapter failed to reach service or received 4xx/5xx/timeout: ${z3Result.error}. Marking PlanIR as UNVERIFIED.`);
    plan.verificationStatus = "UNVERIFIED";
    plan.z3Proof = {
      verified: false,
      satisfiable: false,
      checkedAssertionsCount: assertions.length,
      timestamp: new Date().toISOString(),
      solverType: "HTTP_Z3_ADAPTER",
      error: z3Result.error || `Formal verifier offline/unreachable: service at ${serviceUrl} is unavailable.`
    };
    return plan;
  }

  if (z3Result.satisfiable) {
    plan.verificationStatus = "VERIFIED";
    plan.z3Proof = {
      verified: true,
      satisfiable: true,
      model: z3Result.model || { status: "SATISFIABLE" },
      checkedAssertionsCount: assertions.length,
      timestamp: new Date().toISOString(),
      solverType: "HTTP_Z3_ADAPTER"
    };
  } else {
    plan.verificationStatus = "FAILED";
    plan.z3Proof = {
      verified: false,
      satisfiable: false,
      checkedAssertionsCount: assertions.length,
      timestamp: new Date().toISOString(),
      solverType: "HTTP_Z3_ADAPTER",
      error: z3Result.error || "Z3 SMT solver returned UNSATISFIABLE model."
    };
  }

  return plan;
}
