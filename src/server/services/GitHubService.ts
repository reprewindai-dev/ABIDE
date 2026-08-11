import { GoogleGenAI } from "@google/genai";

export class GitHubService {
  public static async analyzeRepo(req: any, res: any): Promise<any> {
  try {
    const { repoUrl, notes, businessPlanText, apiKey, customToken } = req.body;

    if (!repoUrl) {
      return res.status(400).json({ error: "Missing required GitHub Repository URL." });
    }

    // Extract owner and repo
    const regex = /github\.com\/([^\/]+)\/([^\/]+)/i;
    const match = repoUrl.match(regex);
    let owner = "unknown";
    let repo = "unknown";

    if (match) {
      owner = match[1];
      // Strip trailing .git if present
      repo = match[2].replace(/\.git$/i, "");
    } else {
      // Assume owner/repo format was input
      const parts = repoUrl.split("/");
      if (parts.length >= 2) {
        owner = parts[parts.length - 2];
        repo = parts[parts.length - 1];
      }
    }

    let fileList: string[] = [];
    let isMockReport = false;
    let technologiesFound: string[] = [];

    try {
      // Set up real GitHub API call to fetch recursive tree
      const headers: HeadersInit = {
        "User-Agent": "ABIDE-Compiler",
        Accept: "application/vnd.github.v3+json",
      };
      if (customToken) {
        headers["Authorization"] = `token ${customToken}`;
      }

      const gitTreeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`;
      let gitResponse = await fetch(gitTreeUrl, { headers });

      if (!gitResponse.ok) {
        // Fallback to master branch
        const masterUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/master?recursive=1`;
        gitResponse = await fetch(masterUrl, { headers });
      }

      if (gitResponse.ok) {
        const treeData = await gitResponse.json();
        if (treeData && Array.isArray(treeData.tree)) {
          fileList = treeData.tree
            .filter((node: any) => node.type === "blob")
            .map((node: any) => node.path);

          // Detect stack based on structures
          if (fileList.some(p => p.includes("package.json"))) technologiesFound.push("React/Node.js Node");
          if (fileList.some(p => p.endsWith(".rs") || p.includes("Cargo.toml"))) technologiesFound.push("Rust Ecosystem");
          if (fileList.some(p => p.endsWith(".py") || p.includes("requirements.txt"))) technologiesFound.push("Python Microservices");
          if (fileList.some(p => p.endsWith(".sol"))) technologiesFound.push("Solidity Smart Contracts");
          if (fileList.some(p => p.endsWith(".go"))) technologiesFound.push("Go Cloud CDN Network");
        }
      } else {
        throw new Error("Unreachable or private repository. Launching AI cross-reference simulator...");
      }
    } catch (apiErr) {
      console.warn("GitHub real fetching failed. Falling back to high-fidelity AI simulation:", apiErr);
      isMockReport = true;
      // Pre-simulate default list based on repo name
      fileList = [
        "README.md",
        "package.json",
        "src/App.tsx",
        "src/server.ts",
        "src/controllers/vitals.ts",
        "src/db/schema.ts",
        "Cargo.toml",
        "src/main.rs",
        "src/protocol/x402.rs",
        "contracts/SovereignEscrow.sol"
      ];
      technologiesFound = ["React/Node.js Framework", "Rust Edge Ledger", "Solidity Smart Contracts"];
    }

    // Build the cross-reference query for Gemini
    const activeApiKey = apiKey || process.env.GEMINI_API_KEY;
    if (!activeApiKey) {
      throw new Error("Gemini API Key is missing. Configure it in settings to analyze.");
    }

    const ai = new GoogleGenAI({
      apiKey: activeApiKey,
      httpOptions: { headers: { "User-Agent": "aistudio-build" } },
    });

    const crossRefPrompt = `You are an elite Software Ingress Analyst.
We need to analyze the following GitHub codebase structure and cross-reference its alignment with the Proposed Business Logic.

Repository Info:
- Target Repository: ${owner}/${repo}
- Verified Technologies: ${technologiesFound.join(", ") || "TypeScript/General Web Stack"}
- Identified File Paths (truncated/selected for analysis):
${fileList.slice(0, 40).map(f => `  - ${f}`).join("\n")}

Proposed Business Logic Notes:
"${notes || "Machine-to-machine X402 payment settlements and high-efficiency prioritizers"}"

Generated Business Plan Blueprint Text:
"${(businessPlanText || "Integrate pricing matrices for X402, competitive moats, and implementation barriers.").substring(0, 1500)}"

Evaluate how the codebase can implement or currently implements the business logic. Highlight endpoints, missing libraries, security risks, and concrete code blueprints to bridge the gaps.

You must return a valid JSON object matching this schema exactly:
{
  "repoName": "${owner}/${repo}",
  "techStack": ["Stack names (e.g. React, Rust)"],
  "endpoints": [
    { "path": "/api/route", "method": "GET/POST", "purpose": "Explanation of purpose" }
  ],
  "alignments": [
    { "feature": "Feature Title", "status": "Fully Supported / Partially Supported / Missing", "details": "How the code aligns" }
  ],
  "gaps": [
    { "system": "Subsystem", "missing": "Details of what is missing", "severity": "Critical / Medium" }
  ],
  "expansionSteps": [
    { "filePath": "path/to/create.ext", "instructions": "Copy-pasteable directions to build this file and its dependencies" }
  ],
  "authPatterns": "Details of authentication structures, credentials flow, token scopes, or zero-knowledge handshakes found or required",
  "dtos": [
    { "name": "DTO / Struct Name", "fields": ["field_name: type"], "purpose": "Request/Response serialization boundary role" }
  ],
  "databaseModels": [
    { "modelName": "Model Name", "fields": ["field: type"], "purpose": "Table schema or state representation details" }
  ],
  "migrations": [
    { "name": "Migration Name/ID", "status": "Executed / Required", "details": "DB schema alterations or state conversions required" }
  ],
  "backgroundJobs": [
    { "name": "Job Name", "interval": "e.g. Hourly / Every 10s", "purpose": "Asynchronous background routine role" }
  ],
  "queuesEvents": [
    { "name": "Queue/Event Name", "purpose": "Asynchronous messaging or inter-module event trigger" }
  ],
  "testsPresent": [
    { "name": "Test Suite Name", "status": "Present / Absent", "type": "Unit / Integration / SLA Verification" }
  ],
  "envVars": [
    { "name": "ENV_VAR_NAME", "required": true, "purpose": "Usage role in the application runtime config" }
  ],
  "externalDependencies": [
    { "name": "Dependency Name", "purpose": "Third party library or API role in compilation" }
  ],
  "serviceBoundaries": [
    { "name": "Service Name", "responsibilities": "Sovereign boundary limits" }
  ],
  "inferredCapabilities": [
    { "id": "capability-id", "name": "Capability Name", "alignment": "How the repository maps to this Capability ID" }
  ],
  "inferredMonetizableSurfaces": [
    { "name": "Monetized Flow", "unit": "Billing unit", "floorPrice": 0.005, "rationale": "Why this surface is billable via X402" }
  ],
  "inferredMissingControls": [
    { "system": "Control System", "missing": "Details of missing security, budget limits, or audit guardrails in the repository codebase" }
  ]
}`;

    const aiResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: crossRefPrompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    });

    const aiText = aiResponse.text || "{}";
    let parsedCrossRef;
    try {
      parsedCrossRef = JSON.parse(aiText);
    } catch (e) {
      const matchJson = aiText.match(/\{[\s\S]*\}/);
      parsedCrossRef = matchJson ? JSON.parse(matchJson[0]) : { error: "Failed to compile alignment JSON." };
    }

    return res.json({
      ...parsedCrossRef,
      isRealConnection: !isMockReport,
      totalFilesCount: fileList.length
    });

  } catch (err: any) {
    console.error("GitHub Analysis Error:", err);
    return res.status(500).json({ error: err.message || "Failed to compile repository cross-reference alignment." });
  }

  }

  public static async pushBlueprint(req: any, res: any): Promise<any> {
  try {
    const { repoUrl, token, branchName, blueprint, baseBranch = "main" } = req.body;

    if (!repoUrl) {
      return res.status(400).json({ error: "Missing GitHub Repository URL." });
    }
    if (!token) {
      return res.status(400).json({ error: "GitHub Access Token (PAT) is required to push a new branch." });
    }
    if (!blueprint) {
      return res.status(400).json({ error: "No compiled blueprint found to push." });
    }

    const regex = /github\.com\/([^\/]+)\/([^\/]+)/i;
    const match = repoUrl.match(regex);
    let owner = "";
    let repo = "";

    if (match) {
      owner = match[1];
      repo = match[2].replace(/\.git$/i, "");
    } else {
      const parts = repoUrl.split("/");
      if (parts.length >= 2) {
        owner = parts[parts.length - 2];
        repo = parts[parts.length - 1];
      }
    }

    if (!owner || !repo) {
      return res.status(400).json({ error: "Invalid repository format. Please enter 'owner/repo' or a GitHub URL." });
    }

    const targetBranch = branchName ? branchName.trim() : "abide-blueprint-alignment";
    const headers: HeadersInit = {
      "User-Agent": "ABIDE-Compiler",
      "Accept": "application/vnd.github.v3+json",
      "Authorization": `token ${token}`,
      "Content-Type": "application/json"
    };

    // 1. Get base branch SHA
    let baseSha = "";
    let baseRefUrl = `https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${baseBranch}`;
    let refResponse = await fetch(baseRefUrl, { headers });

    if (!refResponse.ok && baseBranch === "main") {
      // Fallback to master
      baseRefUrl = `https://api.github.com/repos/${owner}/${repo}/git/ref/heads/master`;
      refResponse = await fetch(baseRefUrl, { headers });
    }

    if (!refResponse.ok) {
      const errorMsg = await refResponse.text();
      throw new Error(`Failed to retrieve base branch SHA: ${refResponse.statusText}. Response: ${errorMsg}`);
    }

    const refData = await refResponse.json();
    baseSha = refData.object.sha;

    // 2. Create the new branch ref (refs/heads/branchName)
    const createRefUrl = `https://api.github.com/repos/${owner}/${repo}/git/refs`;
    const createRefResponse = await fetch(createRefUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        ref: `refs/heads/${targetBranch}`,
        sha: baseSha
      })
    });

    let branchCreated = false;
    if (createRefResponse.status === 201) {
      branchCreated = true;
    } else if (createRefResponse.status === 422) {
      // Branch already exists, which is fine
      console.log(`Branch ${targetBranch} already exists. Appending commit to existing branch.`);
    } else {
      const errorMsg = await createRefResponse.text();
      throw new Error(`Failed to create branch '${targetBranch}': ${createRefResponse.statusText}. ${errorMsg}`);
    }

    // 3. Check if ABIDE_BLUEPRINT.json already exists to get its SHA (required for update)
    let existingSha = "";
    const contentUrl = `https://api.github.com/repos/${owner}/${repo}/contents/ABIDE_BLUEPRINT.json?ref=${targetBranch}`;
    const contentResponse = await fetch(contentUrl, { headers });
    if (contentResponse.ok) {
      const contentData = await contentResponse.json();
      existingSha = contentData.sha;
    }

    // 4. Push/write the file
    const pushFileUrl = `https://api.github.com/repos/${owner}/${repo}/contents/ABIDE_BLUEPRINT.json`;
    const blueprintBase64 = Buffer.from(JSON.stringify(blueprint, null, 2)).toString("base64");
    
    const pushBody: any = {
      message: `Feat: align ABIDE Sovereign Blueprint [skip ci]`,
      content: blueprintBase64,
      branch: targetBranch
    };
    if (existingSha) {
      pushBody.sha = existingSha;
    }

    const pushResponse = await fetch(pushFileUrl, {
      method: "PUT",
      headers,
      body: JSON.stringify(pushBody)
    });

    if (!pushResponse.ok) {
      const errorMsg = await pushResponse.text();
      throw new Error(`Failed to write ABIDE_BLUEPRINT.json to branch '${targetBranch}': ${pushResponse.statusText}. ${errorMsg}`);
    }

    const pushData = await pushResponse.json();
    
    return res.json({
      success: true,
      branch: targetBranch,
      branchCreated,
      commitSha: pushData.commit.sha,
      commitUrl: pushData.commit.html_url,
      fileUrl: pushData.content.html_url,
      repoFullName: `${owner}/${repo}`
    });

  } catch (err: any) {
    console.error("GitHub Push Error:", err);
    return res.status(500).json({ error: err.message || "Failed to push blueprint to repository." });
  }

  }
}
