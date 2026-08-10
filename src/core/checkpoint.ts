import crypto from "crypto";
import { CheckpointSchema } from "./validation";
import { Pool } from "pg";

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

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

pool.query(`
  CREATE TABLE IF NOT EXISTS abide_checkpoints (
    checkpointId VARCHAR(255) PRIMARY KEY,
    checkpoint JSONB NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`).catch(err => console.error("[PG Checkpoint] Failed to initialize table:", err.message));


export async function loadAllCheckpoints(): Promise<Checkpoint[]> {
  if (!process.env.DATABASE_URL) return [];
  try {
    const res = await pool.query("SELECT checkpoint FROM abide_checkpoints ORDER BY timestamp ASC");
    return res.rows.map(r => r.checkpoint as Checkpoint);
  } catch (err: any) {
    console.error("[PG Checkpoint] Failed to load checkpoints:", err.message);
    return [];
  }
}

export async function createCheckpoint(input: Omit<Checkpoint, "checkpointId" | "timestamp">): Promise<Checkpoint> {
  const checkpointId = "chk-" + crypto.randomBytes(8).toString("hex");
  const timestamp = new Date().toISOString();
  
  const checkpoint: Checkpoint = {
    checkpointId,
    timestamp,
    ...input
  };

  const parsed = CheckpointSchema.safeParse(checkpoint);
  if (!parsed.success) {
    throw new Error(`Checkpoint validation failed: ${parsed.error.issues.map(e => e.path.join(".") + ": " + e.message).join(", ")}`);
  }

  if (process.env.DATABASE_URL) {
    try {
      await pool.query(
        "INSERT INTO abide_checkpoints (checkpointId, checkpoint, timestamp) VALUES ($1, $2, NOW())",
        [checkpointId, JSON.stringify(checkpoint)]
      );
    } catch (err: any) {
      console.error("[PG Checkpoint] Failed to save checkpoint:", err.message);
    }
  } else {
    throw new Error("CAPPO HALT - DATABASE_URL is required for checkpoint persistence.");
  }

  return checkpoint;
}

export async function getCheckpoint(checkpointId: string): Promise<Checkpoint | null> {
  if (!process.env.DATABASE_URL) return null;
  try {
    const res = await pool.query("SELECT checkpoint FROM abide_checkpoints WHERE checkpointId = $1", [checkpointId]);
    if (res.rows.length > 0) return res.rows[0].checkpoint as Checkpoint;
  } catch (err: any) {
    console.error("[PG Checkpoint] Failed to get checkpoint:", err.message);
  }
  return null;
}
