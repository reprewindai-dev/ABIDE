import fs from "fs";
import path from "path";
import crypto from "crypto";
import { CheckpointSchema } from "./validation";

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
export function loadAllCheckpoints(): Checkpoint[] {
  try {
    if (!fs.existsSync(DB_PATH)) {
      return [];
    }
    const data = fs.readFileSync(DB_PATH, "utf8");
    const list = JSON.parse(data);
    if (!Array.isArray(list)) return [];
    return list;
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
export function createCheckpoint(input: Omit<Checkpoint, "checkpointId" | "timestamp">): Checkpoint {
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

  const checkpoints = loadAllCheckpoints();
  checkpoints.push(checkpoint);
  saveAllCheckpoints(checkpoints);

  return checkpoint;
}

/**
 * Retrieves a single checkpoint by its unique ID.
 */
export function getCheckpoint(checkpointId: string): Checkpoint | null {
  const checkpoints = loadAllCheckpoints();
  return checkpoints.find(c => c.checkpointId === checkpointId) || null;
}
