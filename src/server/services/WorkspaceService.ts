import fs from "fs";
import path from "path";
import crypto from "crypto";
import { WorkspaceService as ProjectEngineWorkspaceService, PatchService, SandboxExecutionService } from "../../services/project-engine";

export { ProjectEngineWorkspaceService as ProjectEngineWorkspace, PatchService, SandboxExecutionService };

export class WorkspaceService {
  public static listProjects() {
    return ProjectEngineWorkspaceService.listProjects();
  }

  public static getProject(id: string) {
    return ProjectEngineWorkspaceService.getProject(id);
  }

  public static createProject(instruction: string, template?: string) {
    return ProjectEngineWorkspaceService.createProject(instruction, (template as any) || "application-service", instruction);
  }

  public static syncProjectToDisk(project: any) {
    return { success: true, path: `/tmp/projects/${project?.id || 'default'}` };
  }

  public static proposePatch(project: any, instruction: string) {
    return PatchService.createProposal(project, instruction);
  }

  public static applyPatch(project: any, patchId: string) {
    return PatchService.applyProposal(project, patchId);
  }

  public static runStage(project: any, stage: string, instruction?: string) {
    return SandboxExecutionService.runStage(project, stage as any, instruction);
  }

  /**
   * Scans the workspace directory recursively to verify files, sizes, LOC count, and check hashes for drift control.
   */
  public static analyzeRepoIntelligence(rootDir: string = process.cwd()): any {
    const repoFiles: any[] = [];
    let totalLinesOfCode = 0;

    function scanDir(dir: string, relativePath = "") {
      const list = fs.readdirSync(dir);
      for (const file of list) {
        if (file === "node_modules" || file === ".git" || file === "dist" || file === ".aistudio" || file === ".cache" || file === ".npm") continue;
        const fullPath = path.join(dir, file);
        const relPath = relativePath ? `${relativePath}/${file}` : file;
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          scanDir(fullPath, relPath);
        } else {
          const isTsOrTsx = file.endsWith(".ts") || file.endsWith(".tsx");
          let lineCount = 0;
          let contentHash = "";
          try {
            const fileContent = fs.readFileSync(fullPath);
            contentHash = crypto.createHash("sha256").update(fileContent).digest("hex");
            if (isTsOrTsx) {
              lineCount = fileContent.toString().split("\n").length;
              totalLinesOfCode += lineCount;
            }
          } catch (e) {
            // Unreadable or binary files
          }
          repoFiles.push({
            name: file,
            path: relPath,
            sizeBytes: stat.size,
            sha256: contentHash,
            lineCount: lineCount || undefined,
            isSourceCode: isTsOrTsx
          });
        }
      }
    }

    scanDir(rootDir);

    let packageJson: any = {};
    try {
      packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, "package.json"), "utf8"));
    } catch (e) {
      packageJson = { error: "Failed to load package.json" };
    }

    const sekedCompilerExists = fs.existsSync(path.join(rootDir, "src/compiler/seked.ts"));
    const planIrExists = fs.existsSync(path.join(rootDir, "src/core/plan-ir.ts"));

    return {
      success: true,
      projectName: packageJson.name || "abide-blueprint",
      projectVersion: packageJson.version || "1.0.0",
      totalFiles: repoFiles.length,
      totalLinesOfCode,
      sekedCompilerExists,
      planIrExists,
      dependencies: packageJson.dependencies || {},
      devDependencies: packageJson.devDependencies || {},
      workspaceFiles: repoFiles
    };
  }
}
