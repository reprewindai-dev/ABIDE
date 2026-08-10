import crypto from "crypto";
import { GoogleGenAI } from "@google/genai";
import { verifyCitation, VerificationStatus } from "../../core/citationVerifier";
import { gateMaturityClaim, TechnologyReadiness } from "../../core/feasibilityGate";

interface AcademicPaper {
  title: string;
  authors: string;
  source: string;
  summary: string;
  relevance: string;
  url: string;
  resolvableIdentifier: string; // Resolvable DOI or arXiv identifier
  retrievalTimestamp: string;   // Timestamp of verification
  quotedClaimLocation: string;  // Explicit quoted claim location
  verificationStatus: "VERIFIED" | "RETRIEVED_AND_VALIDATED" | "SYSTEM_AUDITED" | "UNVERIFIED";
  digitalSignature: string;     // Cryptographic signature of this academic record
  vector?: number[];
}

// In-memory mock database explicitly removed.
// All academic vectors are now governed by the real PostgreSQL pgvector service via veklom-vector-service.

export class AcademicService {
  public static async searchPapers(req: any, res: any): Promise<any> {
    try {
      const { query } = req.body;
      if (!query) {
        return res.status(400).json({ error: "Missing required query string." });
      }

      console.log(`[Semantic Search] Dispatching query to real Veklom Vector Service for: "${query}"`);

      // Golden Bible: Frontends query veklom-vector-service via backend, port 8095.
      const vectorServiceUrl = process.env.VECTOR_SERVICE_URL || "http://veklom-vector-service:8095";
      
      const response = await fetch(`${vectorServiceUrl}/api/v1/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, top_k: 5 })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`External vector service returned ${response.status}: ${errText}`);
      }

      const data = await response.json();
      
      // Strict architecture truth: if it returns an empty array, we do NOT inject fake fallback data
      return res.json({ query, results: data.results || [] });
      
    } catch (err: any) {
      console.error("Vector DB Search Error:", err.message);
      return res.status(500).json({ error: `VECTOR_SERVICE_UNREACHABLE: External vector retrieval failed (${err.message}). Mock data injection is strictly forbidden.` });
    }
  }

  public static async verifyCitations(req: any, res: any): Promise<any> {
    try {
      const { title, authors, resolvableIdentifier, arxivId, doi } = req.body;
      const claimedTitle = title || "";
      const claimedAuthorsList = Array.isArray(authors)
        ? authors
        : (authors ? [authors] : []);
      const claimedArxivId = arxivId || (resolvableIdentifier && resolvableIdentifier.includes("arxiv") ? resolvableIdentifier : undefined);

      console.log(`[Multi-Source Citation Verifier] Auditing claim: "${claimedTitle}" across arXiv, Semantic Scholar, CrossRef, OpenAlex.`);

      const verification = await verifyCitation(
        claimedTitle,
        claimedAuthorsList,
        claimedArxivId,
        doi
      );

      const isMatch = verification.status === VerificationStatus.VERIFIED_MATCH;
      const realRec = verification.real_record;

      const digitalSignature = realRec
        ? crypto.createHash("sha256").update(realRec.title + realRec.authors.join(",") + realRec.url).digest("hex")
        : "";

      return res.json({
        success: isMatch,
        status: verification.status,
        message: verification.notes,
        checkedSources: verification.checked_sources,
        paper: realRec ? {
          title: realRec.title,
          authors: realRec.authors.join(", "),
          url: realRec.url,
          identifier: realRec.identifier,
          source: realRec.source,
          verificationStatus: isMatch ? "VERIFIED" : "TITLE_AUTHOR_MISMATCH",
          digitalSignature
        } : null
      });
    } catch (err: any) {
      console.error("Citation Verifier Error:", err);
      return res.status(500).json({ error: err.message || "Citation verification execution failed." });
    }
  }

  public static async checkFeasibilityGate(req: any, res: any): Promise<any> {
    try {
      const { readiness, requestedLabel, sekedRScore } = req.body;
      const rScore = typeof sekedRScore === "number" ? sekedRScore : 10;
      const readinessEnum = Object.values(TechnologyReadiness).includes(readiness as TechnologyReadiness)
        ? (readiness as TechnologyReadiness)
        : TechnologyReadiness.PUBLIC_AVAILABLE_TODAY;
      const label = requestedLabel || "Sovereign Production";

      const result = gateMaturityClaim(readinessEnum, label, rScore);
      return res.json({
        success: true,
        result
      });
    } catch (err: any) {
      console.error("Feasibility Gate Error:", err);
      return res.status(500).json({ error: err.message || "Feasibility check execution failed." });
    }
  }

  public static async scrapeArxiv(req: any, res: any): Promise<any> {
    return res.status(501).json({ error: "Ingestion of arXiv records must now be routed directly to the Vector Retrieval Service (veklom-vector-service:8095). Local syncing is disabled." });
  }
}
