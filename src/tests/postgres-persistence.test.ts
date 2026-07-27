import assert from "node:assert/strict";
import test from "node:test";

delete process.env.DATABASE_URL;

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

test("project and checkpoint stores retain their non-Postgres fallback", async () => {
  const { WorkspaceService } = await import("../services/project-engine");
  const { createCheckpoint, getCheckpoint } = await import("../core/checkpoint");

  const project = await WorkspaceService.createProject(
    "Fallback Persistence Test",
    "application-service",
    "Verifies local development fallback."
  );
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
