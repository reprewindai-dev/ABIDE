import fs from "fs";
import path from "path";
import crypto from "crypto";
import { CheckpointSchema } from "./validation";
import { getCheckpointFromDatabase, listCheckpoints, saveCheckpoint } from "../db/repositories";
import { isDatabaseConfigured } from "../db/client";

const DB_PATH = path.join(process.cwd(), "checkpoints_db.json");

export interface Checkpoint {
  checkpointId: string;
  parentCheckpointId?: string | null;
  blueprintHash: string;
  packetHash: string;
  repositoryCommitSha: string;
  modifiedFiles: string[];
  testResults: Record<string, any>;
  unresolvedWork: string;
  agentIdentity: string;
  timestamp: string;
}

/**
 * Loads all checkpoints from durable disk storage.
 */
export async function loadAllCheckpoints(): Promise<Checkpoint[]> {
  if (isDatabaseConfigured()) {
    const rows = await listCheckpoints();
    return rows.map((row) => ({
      checkpointId: row.checkpointId,
      parentCheckpointId: row.parentCheckpointId,
      blueprintHash: row.blueprintHash,
      packetHash: row.packetHash,
      repositoryCommitSha: row.repositoryCommitSha,
      modifiedFiles: row.modifiedFiles as string[],
      testResults: row.testResults as Record<string, any>,
      unresolvedWork: row.unresolvedWork,
      agentIdentity: row.agentIdentity,
      timestamp: row.timestamp.toISOString()
    }));
  }
  try {
    if (!fs.existsSync(DB_PATH)) {
      return [];
    }
    const data = fs.readFileSync(DB_PATH, "utf8");
    const list = JSON.parse(data);
    if (!Array.isArray(list)) return [];
    return list as Checkpoint[];
  } catch (err) {
    console.error("Failed to load checkpoints from disk:", err);
    return [];
  }
}

/**
 * Saves a list of checkpoints to durable disk storage.
 */
function saveAllCheckpoints(checkpoints: Checkpoint[]): void {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(checkpoints, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to save checkpoints to disk:", err);
  }
}

/**
 * Validates and records a new checkpoint.
 */
export async function createCheckpoint(input: Omit<Checkpoint, "checkpointId" | "timestamp">): Promise<Checkpoint> {
  const checkpointId = "chk-" + crypto.randomBytes(8).toString("hex");
  const timestamp = new Date().toISOString();
  
  const checkpoint: Checkpoint = {
    checkpointId,
    timestamp,
    ...input
  };

  // Zod structural & type validation
  const parsed = CheckpointSchema.safeParse(checkpoint);
  if (!parsed.success) {
    throw new Error(`Checkpoint validation failed: ${parsed.error.issues.map(e => e.path.join(".") + ": " + e.message).join(", ")}`);
  }

  if (isDatabaseConfigured()) {
    await saveCheckpoint(checkpoint);
  } else {
    const checkpoints = await loadAllCheckpoints();
    checkpoints.push(checkpoint);
    saveAllCheckpoints(checkpoints);
  }

  return checkpoint;
}

/**
 * Retrieves a single checkpoint by its unique ID.
 */
export async function getCheckpoint(checkpointId: string): Promise<Checkpoint | null> {
  if (isDatabaseConfigured()) {
    const row = await getCheckpointFromDatabase(checkpointId);
    if (!row) return null;
    return {
      checkpointId: row.checkpointId,
      parentCheckpointId: row.parentCheckpointId,
      blueprintHash: row.blueprintHash,
      packetHash: row.packetHash,
      repositoryCommitSha: row.repositoryCommitSha,
      modifiedFiles: row.modifiedFiles as string[],
      testResults: row.testResults as Record<string, any>,
      unresolvedWork: row.unresolvedWork,
      agentIdentity: row.agentIdentity,
      timestamp: row.timestamp.toISOString()
    };
  }
  const checkpoints = await loadAllCheckpoints();
  return checkpoints.find(c => c.checkpointId === checkpointId) || null;
}
