import { relations } from "drizzle-orm";
import {
  integer,
  jsonb,
  pgSchema,
  text,
  timestamp,
  unique,
  vector
} from "drizzle-orm/pg-core";

const abide = pgSchema("abide");

export const projects = abide.table("projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull(),
  blueprintHash: text("blueprint_hash"),
  manifest: jsonb("manifest").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export const proposals = abide.table("proposals", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  instruction: text("instruction").notNull(),
  summary: text("summary").notNull(),
  status: text("status").notNull(),
  files: jsonb("files").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const projectFiles = abide.table("project_files", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  path: text("path").notNull(),
  content: text("content").notNull(),
  revision: integer("revision").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  unique("project_files_project_path_revision_unique").on(table.projectId, table.path, table.revision)
]);

export const checkpoints = abide.table("checkpoints", {
  checkpointId: text("checkpoint_id").primaryKey(),
  parentCheckpointId: text("parent_checkpoint_id"),
  blueprintHash: text("blueprint_hash").notNull(),
  packetHash: text("packet_hash").notNull(),
  repositoryCommitSha: text("repository_commit_sha").notNull(),
  modifiedFiles: jsonb("modified_files").notNull(),
  testResults: jsonb("test_results").notNull(),
  unresolvedWork: text("unresolved_work").notNull(),
  agentIdentity: text("agent_identity").notNull(),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull()
});

export const academicPapers = abide.table("academic_papers", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  authors: text("authors").notNull(),
  source: text("source").notNull(),
  summary: text("summary").notNull(),
  relevance: text("relevance").notNull(),
  url: text("url").notNull(),
  resolvableIdentifier: text("resolvable_identifier").notNull(),
  retrievalTimestamp: timestamp("retrieval_timestamp", { withTimezone: true }).notNull(),
  quotedClaimLocation: text("quoted_claim_location").notNull(),
  verificationStatus: text("verification_status").notNull(),
  digitalSignature: text("digital_signature").notNull(),
  embedding: vector("embedding", { dimensions: 768 })
});

export const approvedPlans = abide.table("approved_plans", {
  id: text("id").primaryKey(),
  plan: text("plan").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const blueprints = abide.table("blueprints", {
  id: text("id").primaryKey(),
  data: jsonb("data").notNull()
});

export const projectsRelations = relations(projects, ({ many }) => ({
  proposals: many(proposals),
  files: many(projectFiles)
}));

export const proposalsRelations = relations(proposals, ({ one }) => ({
  project: one(projects, {
    fields: [proposals.projectId],
    references: [projects.id]
  })
}));

export const projectFilesRelations = relations(projectFiles, ({ one }) => ({
  project: one(projects, {
    fields: [projectFiles.projectId],
    references: [projects.id]
  })
}));

export type ProjectRow = typeof projects.$inferSelect;
export type NewProjectRow = typeof projects.$inferInsert;
export type ProposalRow = typeof proposals.$inferSelect;
export type NewProposalRow = typeof proposals.$inferInsert;
export type ProjectFileRow = typeof projectFiles.$inferSelect;
export type CheckpointRow = typeof checkpoints.$inferSelect;
export type AcademicPaperRow = typeof academicPapers.$inferSelect;
export type ApprovedPlanRow = typeof approvedPlans.$inferSelect;
export type BlueprintRow = typeof blueprints.$inferSelect;
