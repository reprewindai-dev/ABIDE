import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const originalDatabaseUrl = process.env.DATABASE_URL;
delete process.env.DATABASE_URL;

test.after(() => {
  if (originalDatabaseUrl === undefined) delete process.env.DATABASE_URL;
  else process.env.DATABASE_URL = originalDatabaseUrl;
});

const client = await import("../db/client");
const schema = await import("../db/schema");

test("database configuration is optional outside production", () => {
  const previousNodeEnv = process.env.NODE_ENV;
  delete process.env.NODE_ENV;
  assert.equal(client.isDatabaseConfigured(), false);
  assert.doesNotThrow(() => client.assertDbConfiguredInProduction());
  if (previousNodeEnv === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = previousNodeEnv;
});

test("production fails closed without DATABASE_URL", () => {
  const previousNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";
  assert.throws(
    () => client.assertDbConfiguredInProduction(),
    /DATABASE_URL is required in production/
  );
  if (previousNodeEnv === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = previousNodeEnv;
});

test("Drizzle schema exposes ABIDE persistence tables", () => {
  for (const table of [
    schema.projects,
    schema.proposals,
    schema.projectFiles,
    schema.checkpoints,
    schema.academicPapers,
    schema.approvedPlans,
    schema.blueprints
  ]) {
    assert.ok(table);
  }
});

test("project and checkpoint stores retain their non-Postgres fallback", async (t) => {
  const { WorkspaceService } = await import("../services/project-engine");
  const { createCheckpoint, getCheckpoint } = await import("../core/checkpoint");

  const checkpointPath = path.join(process.cwd(), "checkpoints_db.json");
  const checkpointFileExisted = fs.existsSync(checkpointPath);
  const checkpointFileBefore = checkpointFileExisted
    ? fs.readFileSync(checkpointPath, "utf8")
    : null;
  let projectDirectory: string | null = null;

  t.after(() => {
    if (projectDirectory) {
      fs.rmSync(projectDirectory, { recursive: true, force: true });
    }
    if (checkpointFileExisted && checkpointFileBefore !== null) {
      fs.writeFileSync(checkpointPath, checkpointFileBefore, "utf8");
    } else {
      fs.rmSync(checkpointPath, { force: true });
    }
  });

  const project = await WorkspaceService.createProject(
    "Fallback Persistence Test",
    "application-service",
    "Verifies local development fallback."
  );
  projectDirectory = path.join(process.cwd(), "workspace-sandbox", "projects", project.id);
  const loadedProject = await WorkspaceService.getProject(project.id);
  assert.equal(loadedProject?.id, project.id);

  const checkpoint = await createCheckpoint({
    parentCheckpointId: null,
    blueprintHash: "fallback-blueprint",
    packetHash: "fallback-packet",
    repositoryCommitSha: "fallback-commit",
    modifiedFiles: ["README.md"],
    testResults: { success: true },
    unresolvedWork: "None",
    agentIdentity: "postgres-persistence-test"
  });
  const loadedCheckpoint = await getCheckpoint(checkpoint.checkpointId);
  assert.equal(loadedCheckpoint?.checkpointId, checkpoint.checkpointId);
});
