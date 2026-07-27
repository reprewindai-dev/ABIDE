CREATE SCHEMA IF NOT EXISTS abide;
CREATE EXTENSION IF NOT EXISTS vector;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "abide"."academic_papers" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"authors" text NOT NULL,
	"source" text NOT NULL,
	"summary" text NOT NULL,
	"relevance" text NOT NULL,
	"url" text NOT NULL,
	"resolvable_identifier" text NOT NULL,
	"retrieval_timestamp" timestamp with time zone NOT NULL,
	"quoted_claim_location" text NOT NULL,
	"verification_status" text NOT NULL,
	"digital_signature" text NOT NULL,
	"embedding" vector(768)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "abide"."approved_plans" (
	"id" text PRIMARY KEY NOT NULL,
	"plan" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "abide"."blueprints" (
	"id" text PRIMARY KEY NOT NULL,
	"data" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "abide"."checkpoints" (
	"checkpoint_id" text PRIMARY KEY NOT NULL,
	"parent_checkpoint_id" text,
	"blueprint_hash" text NOT NULL,
	"packet_hash" text NOT NULL,
	"repository_commit_sha" text NOT NULL,
	"modified_files" jsonb NOT NULL,
	"test_results" jsonb NOT NULL,
	"unresolved_work" text NOT NULL,
	"agent_identity" text NOT NULL,
	"timestamp" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "abide"."project_files" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"path" text NOT NULL,
	"content" text NOT NULL,
	"revision" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "project_files_project_path_revision_unique" UNIQUE("project_id","path","revision")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "abide"."projects" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"status" text NOT NULL,
	"blueprint_hash" text,
	"manifest" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "abide"."proposals" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"instruction" text NOT NULL,
	"summary" text NOT NULL,
	"status" text NOT NULL,
	"files" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "abide"."project_files" ADD CONSTRAINT "project_files_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "abide"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "abide"."proposals" ADD CONSTRAINT "proposals_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "abide"."projects"("id") ON DELETE cascade ON UPDATE no action;