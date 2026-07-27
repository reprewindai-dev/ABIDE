import { and, desc, eq, sql } from "drizzle-orm";
import crypto from "crypto";
import { getDb, isDatabaseConfigured } from "./client";
import {
  approvedPlans,
  blueprints,
  checkpoints,
  projectFiles,
  projects,
  proposals,
  academicPapers
} from "./schema";

export async function upsertProject(project: any): Promise<void> {
  const db = getDb();
  const { files, ...manifest } = project;
  await db.insert(projects).values({
    id: project.id,
    name: project.name,
    description: project.description,
    status: project.status,
    blueprintHash: project.blueprintHash || null,
    manifest,
    createdAt: new Date(project.createdAt),
    updatedAt: new Date(project.updatedAt)
  }).onConflictDoUpdate({
    target: projects.id,
    set: {
      name: project.name,
      description: project.description,
      status: project.status,
      blueprintHash: project.blueprintHash || null,
      manifest,
      updatedAt: new Date(project.updatedAt)
    }
  });

  const existing = await db.select().from(projectFiles).where(eq(projectFiles.projectId, project.id));
  const latest = new Map<string, { content: string; revision: number }>();
  for (const row of existing) {
    const current = latest.get(row.path);
    if (!current || row.revision > current.revision) {
      latest.set(row.path, { content: row.content, revision: row.revision });
    }
  }
  for (const [filePath, content] of Object.entries(files || {})) {
    const value = String(content);
    const previous = latest.get(filePath);
    if (previous?.content === value) continue;
    await db.insert(projectFiles).values({
      id: crypto.randomUUID(),
      projectId: project.id,
      path: filePath,
      content: value,
      revision: (previous?.revision || 0) + 1
    });
  }
}

async function hydrateProject(row: typeof projects.$inferSelect): Promise<any> {
  const fileRows = await getDb().select().from(projectFiles)
    .where(eq(projectFiles.projectId, row.id))
    .orderBy(desc(projectFiles.revision));
  const files: Record<string, string> = {};
  for (const file of fileRows) {
    if (!(file.path in files)) files[file.path] = file.content;
  }
  const manifest = (row.manifest || {}) as Record<string, any>;
  return {
    ...manifest,
    id: row.id,
    name: row.name,
    description: row.description,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    files
  };
}

export async function getProjectFromDatabase(id: string): Promise<any | undefined> {
  const rows = await getDb().select().from(projects).where(eq(projects.id, id)).limit(1);
  return rows[0] ? hydrateProject(rows[0]) : undefined;
}

export async function listProjectsFromDatabase(): Promise<any[]> {
  const rows = await getDb().select().from(projects).orderBy(desc(projects.updatedAt));
  return Promise.all(rows.map(hydrateProject));
}

export async function saveProposal(proposal: any): Promise<void> {
  await getDb().insert(proposals).values({
    id: proposal.proposalId,
    projectId: proposal.projectId,
    instruction: proposal.instruction || "",
    summary: proposal.summary,
    status: "PROPOSED",
    files: proposal,
    createdAt: new Date(proposal.createdAt)
  }).onConflictDoUpdate({
    target: proposals.id,
    set: {
      summary: proposal.summary,
      status: "PROPOSED",
      files: proposal
    }
  });
}

export async function getProposal(proposalId: string): Promise<any | undefined> {
  const rows = await getDb().select().from(proposals).where(eq(proposals.id, proposalId)).limit(1);
  if (!rows[0]) return undefined;
  return {
    ...((rows[0].files || {}) as Record<string, any>),
    proposalId: rows[0].id,
    projectId: rows[0].projectId,
    summary: rows[0].summary,
    createdAt: rows[0].createdAt.toISOString()
  };
}

export async function saveCheckpoint(checkpoint: any): Promise<void> {
  await getDb().insert(checkpoints).values({
    checkpointId: checkpoint.checkpointId,
    parentCheckpointId: checkpoint.parentCheckpointId || null,
    blueprintHash: checkpoint.blueprintHash,
    packetHash: checkpoint.packetHash,
    repositoryCommitSha: checkpoint.repositoryCommitSha,
    modifiedFiles: checkpoint.modifiedFiles,
    testResults: checkpoint.testResults,
    unresolvedWork: checkpoint.unresolvedWork,
    agentIdentity: checkpoint.agentIdentity,
    timestamp: new Date(checkpoint.timestamp)
  });
}

export async function listCheckpoints(): Promise<any[]> {
  return getDb().select().from(checkpoints).orderBy(desc(checkpoints.timestamp));
}

export async function getCheckpointFromDatabase(checkpointId: string): Promise<any | null> {
  const rows = await getDb().select().from(checkpoints).where(eq(checkpoints.checkpointId, checkpointId)).limit(1);
  return rows[0] || null;
}

export async function saveApprovedPlan(id: string, plan: string): Promise<void> {
  await getDb().insert(approvedPlans).values({ id, plan })
    .onConflictDoUpdate({ target: approvedPlans.id, set: { plan } });
}

export async function hasApprovedPlan(id: string, plan: string): Promise<boolean> {
  const rows = await getDb().select().from(approvedPlans)
    .where(and(eq(approvedPlans.id, id), eq(approvedPlans.plan, plan))).limit(1);
  return rows.length > 0;
}

export async function saveBlueprint(id: string, data: any): Promise<void> {
  await getDb().insert(blueprints).values({ id, data })
    .onConflictDoUpdate({ target: blueprints.id, set: { data } });
}

export async function getBlueprint(id: string): Promise<any | null> {
  const rows = await getDb().select().from(blueprints).where(eq(blueprints.id, id)).limit(1);
  return rows[0]?.data || null;
}

export async function deleteBlueprint(id: string): Promise<boolean> {
  const result = await getDb().delete(blueprints).where(eq(blueprints.id, id));
  return Number(result.rowCount || 0) > 0;
}

export function databasePersistenceEnabled(): boolean {
  return isDatabaseConfigured();
}

export async function findAcademicPaperByTitle(title: string): Promise<any | undefined> {
  const rows = await getDb().select().from(academicPapers)
    .where(eq(academicPapers.title, title)).limit(1);
  return rows[0];
}

export async function listAcademicPapers(): Promise<any[]> {
  return getDb().select().from(academicPapers);
}

export async function insertAcademicPaper(paper: any): Promise<void> {
  await getDb().insert(academicPapers).values({
    id: paper.id || crypto.randomUUID(),
    title: paper.title,
    authors: paper.authors,
    source: paper.source,
    summary: paper.summary,
    relevance: paper.relevance,
    url: paper.url,
    resolvableIdentifier: paper.resolvableIdentifier,
    retrievalTimestamp: new Date(paper.retrievalTimestamp),
    quotedClaimLocation: paper.quotedClaimLocation,
    verificationStatus: paper.verificationStatus,
    digitalSignature: paper.digitalSignature,
    embedding: paper.vector || null
  }).onConflictDoNothing();
}

export async function updateAcademicPaper(title: string, changes: Record<string, any>): Promise<void> {
  await getDb().update(academicPapers).set(changes).where(eq(academicPapers.title, title));
}

export async function searchAcademicPapers(vector: number[], limit = 20): Promise<any[]> {
  const vectorLiteral = `[${vector.join(",")}]`;
  const distance = sql<number>`${academicPapers.embedding} <=> ${vectorLiteral}::vector`;
  return getDb().select({ paper: academicPapers, distance })
    .from(academicPapers)
    .where(sql`${academicPapers.embedding} IS NOT NULL`)
    .orderBy(distance)
    .limit(limit);
}
