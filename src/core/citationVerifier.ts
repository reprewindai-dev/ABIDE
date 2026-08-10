import crypto from "crypto";

export enum VerificationStatus {
  VERIFIED_MATCH = "VERIFIED_MATCH",               // real record found, title + author match
  TITLE_AUTHOR_MISMATCH = "TITLE_AUTHOR_MISMATCH", // real record exists, but doesn't match the claim
  NOT_FOUND = "NOT_FOUND",                         // no matching record in any source
  NO_QUERY_PROVIDED = "NO_QUERY_PROVIDED",          // nothing to check (no id, no title)
}

export interface RealRecord {
  source: string;
  title: string;
  authors: string[];
  identifier: string; // arXiv ID, DOI, or Semantic Scholar paperId / OpenAlex ID
  url: string;
}

export interface CitationVerification {
  status: VerificationStatus;
  claimed_title: string;
  claimed_authors: string[];
  real_record?: RealRecord | null;
  checked_sources: string[];
  notes: string;
}

const TITLE_MATCH_THRESHOLD = 85;

function normalize(s: string): string {
  return (s || "").toLowerCase().replace(/\s+/g, " ").trim();
}

/**
 * Token sort ratio fuzzy string comparison (0 to 100)
 */
function tokenSortRatio(str1: string, str2: string): number {
  const norm1 = normalize(str1);
  const norm2 = normalize(str2);
  if (norm1 === norm2) return 100;
  if (!norm1 || !norm2) return 0;

  const tokens1 = Array.from(new Set(norm1.split(" "))).sort();
  const tokens2 = Array.from(new Set(norm2.split(" "))).sort();

  const sorted1 = tokens1.join(" ");
  const sorted2 = tokens2.join(" ");

  return levenshteinRatio(sorted1, sorted2);
}

function partialRatio(str1: string, str2: string): number {
  const norm1 = normalize(str1);
  const norm2 = normalize(str2);
  if (!norm1 || !norm2) return 0;
  if (norm1.includes(norm2) || norm2.includes(norm1)) return 100;

  const shorter = norm1.length <= norm2.length ? norm1 : norm2;
  const longer = norm1.length <= norm2.length ? norm2 : norm1;

  let maxRatio = 0;
  const len = shorter.length;
  for (let i = 0; i <= longer.length - len; i++) {
    const sub = longer.substring(i, i + len);
    const r = levenshteinRatio(shorter, sub);
    if (r > maxRatio) maxRatio = r;
  }
  return maxRatio;
}

function levenshteinRatio(s1: string, s2: string): number {
  if (s1 === s2) return 100;
  const len1 = s1.length;
  const len2 = s2.length;
  if (len1 === 0 || len2 === 0) return 0;

  const track = Array(len2 + 1).fill(0).map((_, i) => i);
  let key: number;

  for (let i = 1; i <= len1; i++) {
    let last = i - 1;
    track[0] = i;
    for (let j = 1; j <= len2; j++) {
      const temp = track[j];
      if (s1[i - 1] === s2[j - 1]) {
        key = last;
      } else {
        key = Math.min(last, track[j], track[j - 1]) + 1;
      }
      last = temp;
      track[j] = key;
    }
  }

  const distance = track[len2];
  const maxLen = Math.max(len1, len2);
  return Math.round(((maxLen - distance) / maxLen) * 100);
}

function authorsOverlap(claimed: string[], real: string[]): boolean {
  if (!claimed || !claimed.length || !real || !real.length) return false;
  const realNorm = real.map(normalize);
  for (const c of claimed) {
    const cNorm = normalize(c);
    for (const r of realNorm) {
      if (partialRatio(cNorm, r) >= 80) {
        return true;
      }
    }
  }
  return false;
}

function scoreMatch(claimedTitle: string, real: RealRecord, claimedAuthors: string[]): VerificationStatus {
  const titleScore = tokenSortRatio(claimedTitle, real.title);
  const authorsMatch = authorsOverlap(claimedAuthors, real.authors);
  if (titleScore >= TITLE_MATCH_THRESHOLD && authorsMatch) {
    return VerificationStatus.VERIFIED_MATCH;
  }
  return VerificationStatus.TITLE_AUTHOR_MISMATCH;
}

// --- Live Source Fetchers ---

export async function fetchArxiv(arxivId: string): Promise<RealRecord | null> {
  try {
    const cleanId = arxivId.replace(/^arxiv:/i, "").trim();
    const url = `http://export.arxiv.org/api/query?id_list=${encodeURIComponent(cleanId)}&max_results=1`;
    const resp = await fetch(url);
    if (!resp.ok) return null;

    const xml = await resp.text();
    const entryMatch = xml.match(/<entry>([\s\S]*?)<\/entry>/);
    if (!entryMatch) return null;

    const content = entryMatch[1];
    const titleMatch = content.match(/<title>([\s\S]*?)<\/title>/);
    let title = titleMatch ? titleMatch[1].replace(/\s+/g, " ").trim() : "";
    title = title.replace(/^Title:\s*/i, "");

    const authorRegex = /<name>([\s\S]*?)<\/name>/g;
    let authMatch;
    const authors: string[] = [];
    while ((authMatch = authorRegex.exec(content)) !== null) {
      authors.push(authMatch[1].trim());
    }

    const idMatch = content.match(/<id>([\s\S]*?)<\/id>/);
    const entryUrl = idMatch ? idMatch[1].trim() : `https://arxiv.org/abs/${cleanId}`;

    return {
      source: "arxiv",
      title,
      authors,
      identifier: cleanId,
      url: entryUrl,
    };
  } catch (err) {
    return null;
  }
}

export async function fetchSemanticScholar(title: string): Promise<RealRecord | null> {
  try {
    const url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(title)}&limit=1&fields=title,authors,externalIds,url`;
    const resp = await fetch(url, { headers: { "User-Agent": "CitationVerifier/1.0" } });
    if (!resp.ok) return null;

    const data = await resp.json();
    const items = data.data || [];
    if (!items.length) return null;

    const top = items[0];
    const authors = (top.authors || []).map((a: any) => a.name).filter(Boolean);

    return {
      source: "semantic_scholar",
      title: top.title || "",
      authors,
      identifier: top.paperId || "",
      url: top.url || `https://www.semanticscholar.org/paper/${top.paperId}`,
    };
  } catch (err) {
    return null;
  }
}

export async function fetchCrossRef(title: string): Promise<RealRecord | null> {
  try {
    const url = `https://api.crossref.org/works?query.bibliographic=${encodeURIComponent(title)}&rows=1`;
    const resp = await fetch(url, { headers: { "User-Agent": "CitationVerifier/1.0 (mailto:research@veklom.com)" } });
    if (!resp.ok) return null;

    const data = await resp.json();
    const items = data.message?.items || [];
    if (!items.length) return null;

    const top = items[0];
    const titles = top.title || [];
    if (!titles.length) return null;

    const authors = (top.author || []).map((a: any) => `${a.given || ""} ${a.family || ""}`.trim()).filter(Boolean);

    return {
      source: "crossref",
      title: titles[0],
      authors,
      identifier: top.DOI || "",
      url: top.URL || `https://doi.org/${top.DOI}`,
    };
  } catch (err) {
    return null;
  }
}

export async function fetchOpenAlex(title: string): Promise<RealRecord | null> {
  try {
    const url = `https://api.openalex.org/works?search=${encodeURIComponent(title)}&per_page=1&mailto=research-grounding@veklom.com`;
    const resp = await fetch(url);
    if (!resp.ok) return null;

    const data = await resp.json();
    const results = data.results || [];
    if (!results.length) return null;

    const top = results[0];
    const authors = (top.authorships || [])
      .map((a: any) => a.author?.display_name)
      .filter(Boolean);

    return {
      source: "openalex",
      title: top.title || "",
      authors,
      identifier: top.id || "",
      url: top.doi || top.id || "",
    };
  } catch (err) {
    return null;
  }
}

/**
 * Orchestration loop checking arXiv, Semantic Scholar, CrossRef, and OpenAlex
 */
export async function verifyCitation(
  claimedTitle: string,
  claimedAuthors: string[],
  arxivId?: string,
  doi?: string
): Promise<CitationVerification> {
  if (!claimedTitle && !arxivId && !doi) {
    return {
      status: VerificationStatus.NO_QUERY_PROVIDED,
      claimed_title: claimedTitle,
      claimed_authors: claimedAuthors,
      checked_sources: [],
      notes: "No title, arXiv ID, or DOI provided — nothing to verify.",
    };
  }

  const checkedSources: string[] = [];

  // Check arXiv first if ID is present
  if (arxivId) {
    checkedSources.push("arxiv");
    const real = await fetchArxiv(arxivId);
    if (real) {
      const status = scoreMatch(claimedTitle, real, claimedAuthors);
      return {
        status,
        claimed_title: claimedTitle,
        claimed_authors: claimedAuthors,
        real_record: real,
        checked_sources: checkedSources,
        notes: status === VerificationStatus.TITLE_AUTHOR_MISMATCH
          ? `arXiv:${arxivId} exists but is titled "${real.title}" by [${real.authors.join(", ")}] — does not match the claim.`
          : `Verified matching record found on arXiv:${arxivId}.`,
      };
    }
    checkedSources.push("arxiv:id_not_found");
  }

  // Check title across Semantic Scholar, CrossRef, and OpenAlex
  const fetchers: Array<[string, (t: string) => Promise<RealRecord | null>]> = [
    ["semantic_scholar", fetchSemanticScholar],
    ["crossref", fetchCrossRef],
    ["openalex", fetchOpenAlex],
  ];

  for (const [sourceName, fetcher] of fetchers) {
    if (!claimedTitle) continue;
    checkedSources.push(sourceName);
    const real = await fetcher(claimedTitle);
    if (real) {
      const status = scoreMatch(claimedTitle, real, claimedAuthors);
      if (status === VerificationStatus.VERIFIED_MATCH) {
        return {
          status,
          claimed_title: claimedTitle,
          claimed_authors: claimedAuthors,
          real_record: real,
          checked_sources: checkedSources,
          notes: `Verified matching record found on ${sourceName}.`,
        };
      }
    }
  }

  return {
    status: VerificationStatus.NOT_FOUND,
    claimed_title: claimedTitle,
    claimed_authors: claimedAuthors,
    checked_sources: checkedSources,
    notes: "No matching real record found in any checked source.",
  };
}
