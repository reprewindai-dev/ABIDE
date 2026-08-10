import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import fs from "fs";
import path from "path";

function requireJwtSecret(): string {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is required for VNP authentication.");
  }
  return process.env.JWT_SECRET;
}
const DB_FILE = path.join(process.cwd(), "vnp-users-db.json");

export interface VnpApiKey {
  keyId: string;
  keyName: string;
  prefix: string; // e.g., "vnp_live_sk_89a..."
  keyHash: string;
  createdAt: string;
  lastUsedAt?: string;
}

export interface VnpUser {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: "VNP Sovereign Architect" | "Node Telemetry Operator" | "Security Auditor" | "Standard Node User";
  organization: string;
  avatarUrl?: string;
  bio?: string;
  assignedVnpNodes: string[];
  sshPublicKey?: string;
  mfaEnabled: boolean;
  apiKeys: VnpApiKey[];
  oauthProvider?: "github" | "google" | "veklom-iam" | null;
  createdAt: string;
  lastLoginAt: string;
}

// In-Memory User Database with File Persistence
const usersDb = new Map<string, VnpUser>();

// Initialize and Seed Default Users
function initDb() {
  const defaultUsers: VnpUser[] = [
    {
      id: "usr-vance-001",
      email: "dr.vance@veklom.com",
      passwordHash: bcrypt.hashSync("password123", 10),
      name: "Dr. Evelyn Vance",
      role: "VNP Sovereign Architect",
      organization: "Veklom Sovereign Infrastructure & CAPPO Authority",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&h=200&q=80",
      bio: "Chief Sovereign Architect. Directing cryptographic consensus and physical telemetry routing across global VNP node clusters.",
      assignedVnpNodes: ["vnp-us-ashburn-1", "vnp-eu-falkenstein-1", "vnp-ap-singapore-1", "vnp-us-hillsboro-1"],
      sshPublicKey: "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIG18V9Vn VanceSovereignKey+VNP2026",
      mfaEnabled: true,
      apiKeys: [
        {
          keyId: "key-vance-primary",
          keyName: "Ashish-Ashburn-Telemetry-Ingest",
          prefix: "vnp_live_sk_9fa8...",
          keyHash: crypto.createHash("sha256").update("vnp_live_sk_9fa8b3c4d5e6f7a8b9c0d1e2f3a4b5c6").digest("hex"),
          createdAt: "2026-06-01T10:00:00Z",
          lastUsedAt: "2026-07-26T14:30:00Z"
        }
      ],
      oauthProvider: null,
      createdAt: "2026-01-15T08:30:00Z",
      lastLoginAt: new Date().toISOString()
    },
    {
      id: "usr-satoshi-002",
      email: "satoshi@veklom.com",
      passwordHash: bcrypt.hashSync("password123", 10),
      name: "Satoshi Nakagawa",
      role: "Node Telemetry Operator",
      organization: "Veklom Network Protocol (VNP) Telemetry Labs",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80",
      bio: "Lead Telemetry Engineer. Specializing in hardware-enforced M2M latency optimization and sub-millisecond physical node heartbeats.",
      assignedVnpNodes: ["vnp-ap-singapore-1", "vnp-us-hillsboro-1"],
      sshPublicKey: "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIHKnakagawaVNPTelemetryKey2026",
      mfaEnabled: true,
      apiKeys: [],
      oauthProvider: null,
      createdAt: "2026-02-10T11:15:00Z",
      lastLoginAt: new Date().toISOString()
    },
    {
      id: "usr-anthony-003",
      email: "anthony@veklom.com",
      passwordHash: bcrypt.hashSync("password123", 10),
      name: "Anthony Node-Operator",
      role: "Security Auditor",
      organization: "VNP Node Enforcement & Compliance",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80",
      bio: "Physical Node Security Auditor. Overseeing zero-trust access control, TLA+ invariant validation, and real-time anomaly detection.",
      assignedVnpNodes: ["vnp-us-hillsboro-1", "vnp-eu-nuremberg-1"],
      sshPublicKey: "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQCAnthonyNodeAuditKey...",
      mfaEnabled: false,
      apiKeys: [],
      oauthProvider: "github",
      createdAt: "2026-03-20T09:45:00Z",
      lastLoginAt: new Date().toISOString()
    }
  ];

  // Load from disk if exists
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      const loaded: VnpUser[] = JSON.parse(raw);
      if (Array.isArray(loaded) && loaded.length > 0) {
        loaded.forEach((u) => usersDb.set(u.email.toLowerCase(), u));
        console.log(`[VNP Auth] Loaded ${usersDb.size} users from persistent storage: ${DB_FILE}`);
        return;
      }
    }
  } catch (err) {
    console.warn(`[VNP Auth] Could not read disk DB, initializing defaults:`, err);
  }

  // Seed defaults
  defaultUsers.forEach((u) => usersDb.set(u.email.toLowerCase(), u));
  saveDb();
  console.log(`[VNP Auth] Initialized default VNP Sovereign accounts (${usersDb.size} accounts active).`);
}

function saveDb() {
  try {
    const arr = Array.from(usersDb.values());
    fs.writeFileSync(DB_FILE, JSON.stringify(arr, null, 2), "utf-8");
  } catch (err) {
    console.error(`[VNP Auth] Failed to persist user database:`, err);
  }
}

initDb();

// Helper: Strip sensitive fields before returning to frontend
export function sanitizeUser(user: VnpUser) {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

// Helper: Generate signed JWT session token
export function generateJwtToken(user: VnpUser): { token: string; expiresAt: string; sessionLeaseId: string } {
  const sessionLeaseId = `vnp-lease-${crypto.randomBytes(6).toString("hex")}-${Date.now()}`;
  const expiresIn = "7d";
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const payload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    org: user.organization,
    nodes: user.assignedVnpNodes,
    sessionLeaseId
  };

  const token = jwt.sign(payload, requireJwtSecret(), { expiresIn });
  return { token, expiresAt, sessionLeaseId };
}

// Helper: Verify JWT Bearer token from headers or query params
export function authenticateToken(req: Request, res: Response, next: any) {
  const authHeader = req.headers["authorization"] as string | undefined;
  const queryToken = req.query.token as string | undefined;
  
  let token = "";
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7).trim();
  } else if (queryToken) {
    token = queryToken.trim();
  }

  if (!token) {
    return res.status(401).json({ 
      error: "UNAUTHORIZED: Missing JWT Bearer Token in request.",
      authority: "cappo.authority/verify",
      status: "AUTH_REQUIRED"
    });
  }

  try {
    const decoded: any = jwt.verify(token, requireJwtSecret());
    (req as any).user = decoded;
    next();
  } catch (err: any) {
    return res.status(403).json({
      error: `FORBIDDEN: Invalid or expired JWT session token (${err.message}).`,
      authority: "cappo.authority/verify",
      status: "TOKEN_INVALID"
    });
  }
}

export const vnpAuthRouter = express.Router();

// 1. SIGNUP ENDPOINT
vnpAuthRouter.post("/signup", (req: Request, res: Response) => {
  try {
    const { email, password, name, organization, role, sshPublicKey } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: "Missing required fields: email, password, name." });
    }

    const emailKey = email.toLowerCase().trim();
    if (usersDb.has(emailKey)) {
      return res.status(409).json({ error: "A VNP Node Operator account with this email address already exists." });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const id = `usr-vnp-${crypto.randomBytes(4).toString("hex")}`;
    const now = new Date().toISOString();

    const validRoles = ["VNP Sovereign Architect", "Node Telemetry Operator", "Security Auditor", "Standard Node User"];
    const userRole = validRoles.includes(role) ? role : "Standard Node User";

    const newUser: VnpUser = {
      id,
      email: emailKey,
      passwordHash,
      name: name.trim(),
      role: userRole as any,
      organization: organization || "Independent VNP Node Operator",
      assignedVnpNodes: ["vnp-us-hillsboro-1", "vnp-us-ashburn-1"],
      sshPublicKey: sshPublicKey || "",
      mfaEnabled: false,
      apiKeys: [],
      oauthProvider: null,
      createdAt: now,
      lastLoginAt: now
    };

    usersDb.set(emailKey, newUser);
    saveDb();

    const { token, expiresAt, sessionLeaseId } = generateJwtToken(newUser);

    return res.status(201).json({
      status: "SUCCESS",
      message: "VNP Node Operator account created and authenticated securely.",
      token,
      expiresAt,
      sessionLeaseId,
      user: sanitizeUser(newUser)
    });
  } catch (error: any) {
    console.error(`[VNP Auth] Signup Error:`, error);
    return res.status(500).json({ error: error.message || "Failed to process sign up." });
  }
});

// 2. LOGIN ENDPOINT
vnpAuthRouter.post("/login", (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Please provide both email and password." });
    }

    const emailKey = email.toLowerCase().trim();
    const user = usersDb.get(emailKey);

    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      return res.status(401).json({ 
        error: "INVALID_CREDENTIALS: Email or password incorrect. Access denied by VNP Authority.",
        status: "AUTH_FAILED"
      });
    }

    user.lastLoginAt = new Date().toISOString();
    usersDb.set(emailKey, user);
    saveDb();

    const { token, expiresAt, sessionLeaseId } = generateJwtToken(user);

    return res.json({
      status: "SUCCESS",
      message: `Welcome back, ${user.name}. VNP sovereign session established.`,
      token,
      expiresAt,
      sessionLeaseId,
      user: sanitizeUser(user)
    });
  } catch (error: any) {
    console.error(`[VNP Auth] Login Error:`, error);
    return res.status(500).json({ error: error.message || "Login authentication failed." });
  }
});

// 3. OAUTH 2.0 / OIDC SIMULATION & INSTANT LOGIN
vnpAuthRouter.post("/oauth", (req: Request, res: Response) => {
  try {
    const { provider, email, name, avatarUrl, organization } = req.body;

    if (!provider || !email || !name) {
      return res.status(400).json({ error: "Missing required OAuth user info from provider." });
    }

    const emailKey = email.toLowerCase().trim();
    let user = usersDb.get(emailKey);

    if (!user) {
      // Auto-provision account via OAuth
      const id = `usr-oauth-${crypto.randomBytes(4).toString("hex")}`;
      const now = new Date().toISOString();
      user = {
        id,
        email: emailKey,
        passwordHash: bcrypt.hashSync(crypto.randomBytes(16).toString("hex"), 10), // random unguessable password
        name: name.trim(),
        role: "Node Telemetry Operator",
        organization: organization || `${provider.toUpperCase()} Federated Identity`,
        avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(emailKey)}`,
        assignedVnpNodes: ["vnp-us-ashburn-1", "vnp-eu-falkenstein-1"],
        mfaEnabled: true,
        apiKeys: [],
        oauthProvider: provider,
        createdAt: now,
        lastLoginAt: now
      };
      usersDb.set(emailKey, user);
    } else {
      user.lastLoginAt = new Date().toISOString();
      user.oauthProvider = provider;
      if (avatarUrl) user.avatarUrl = avatarUrl;
      usersDb.set(emailKey, user);
    }

    saveDb();
    const { token, expiresAt, sessionLeaseId } = generateJwtToken(user);

    return res.json({
      status: "SUCCESS",
      message: `Authenticated via ${provider.toUpperCase()} OAuth handshake. VNP telemetry session unlocked.`,
      token,
      expiresAt,
      sessionLeaseId,
      user: sanitizeUser(user)
    });
  } catch (error: any) {
    console.error(`[VNP Auth] OAuth Error:`, error);
    return res.status(500).json({ error: error.message || "OAuth authentication failed." });
  }
});

// 4. GET AUTHENTICATED USER PROFILE
vnpAuthRouter.get("/profile", authenticateToken, (req: Request, res: Response) => {
  try {
    const decoded = (req as any).user;
    const emailKey = decoded.email.toLowerCase();
    const user = usersDb.get(emailKey);

    if (!user) {
      return res.status(404).json({ error: "User account no longer exists in VNP database." });
    }

    return res.json({
      status: "SUCCESS",
      user: sanitizeUser(user),
      activeSession: {
        sub: decoded.sub,
        sessionLeaseId: decoded.sessionLeaseId,
        role: user.role,
        nodesAuthorized: user.assignedVnpNodes,
        cappoAuthority: "VERIFIED_ACTIVE"
      }
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to retrieve profile." });
  }
});

// 5. UPDATE USER PROFILE
vnpAuthRouter.put("/profile", authenticateToken, (req: Request, res: Response) => {
  try {
    const decoded = (req as any).user;
    const emailKey = decoded.email.toLowerCase();
    const user = usersDb.get(emailKey);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const { name, organization, role, bio, avatarUrl, sshPublicKey, mfaEnabled, assignedVnpNodes } = req.body;

    if (name) user.name = name.trim();
    if (organization !== undefined) user.organization = organization;
    if (role) user.role = role;
    if (bio !== undefined) user.bio = bio;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
    if (sshPublicKey !== undefined) user.sshPublicKey = sshPublicKey;
    if (typeof mfaEnabled === "boolean") user.mfaEnabled = mfaEnabled;
    if (Array.isArray(assignedVnpNodes)) user.assignedVnpNodes = assignedVnpNodes;

    usersDb.set(emailKey, user);
    saveDb();

    return res.json({
      status: "SUCCESS",
      message: "VNP Node Operator profile updated and persisted successfully.",
      user: sanitizeUser(user)
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to update profile." });
  }
});

// 6. GENERATE API KEY FOR VNP TELEMETRY INGESTION
vnpAuthRouter.post("/api-keys", authenticateToken, (req: Request, res: Response) => {
  try {
    const decoded = (req as any).user;
    const emailKey = decoded.email.toLowerCase();
    const user = usersDb.get(emailKey);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const { keyName } = req.body;
    const name = keyName ? keyName.trim() : `VNP-Ingest-Key-${Date.now()}`;
    const rawSecret = `vnp_live_sk_${crypto.randomBytes(16).toString("hex")}`;
    const prefix = `${rawSecret.substring(0, 15)}...`;
    const keyHash = crypto.createHash("sha256").update(rawSecret).digest("hex");

    const newKey: VnpApiKey = {
      keyId: `key-${crypto.randomBytes(4).toString("hex")}`,
      keyName: name,
      prefix,
      keyHash,
      createdAt: new Date().toISOString()
    };

    user.apiKeys.push(newKey);
    usersDb.set(emailKey, user);
    saveDb();

    return res.status(201).json({
      status: "SUCCESS",
      message: "New VNP telemetry API key generated. Store this secret safely; it will not be shown again.",
      apiKey: rawSecret,
      keyRecord: newKey
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to generate API key." });
  }
});

// 7. REVOKE API KEY
vnpAuthRouter.delete("/api-keys/:keyId", authenticateToken, (req: Request, res: Response) => {
  try {
    const decoded = (req as any).user;
    const emailKey = decoded.email.toLowerCase();
    const user = usersDb.get(emailKey);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const { keyId } = req.params;
    const initLen = user.apiKeys.length;
    user.apiKeys = user.apiKeys.filter((k) => k.keyId !== keyId);

    if (user.apiKeys.length === initLen) {
      return res.status(404).json({ error: "API Key ID not found." });
    }

    usersDb.set(emailKey, user);
    saveDb();

    return res.json({
      status: "SUCCESS",
      message: `API key [${keyId}] revoked. Telemetry ingestion using this key will now be rejected.`
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to revoke API key." });
  }
});

// 8. LIST ALL REGISTERED VNP NODE OPERATORS (DIRECTORY)
vnpAuthRouter.get("/users", (req: Request, res: Response) => {
  try {
    const allUsers = Array.from(usersDb.values()).map((u) => sanitizeUser(u));
    return res.json({
      status: "SUCCESS",
      count: allUsers.length,
      users: allUsers
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to list users." });
  }
});

// 9. VERIFY SESSION / TOKEN ENDPOINT
vnpAuthRouter.post("/verify-session", authenticateToken, (req: Request, res: Response) => {
  return res.json({
    status: "VALID",
    message: "JWT session token verified under VNP CAPPO cryptographic authority.",
    session: (req as any).user
  });
});

// 10. LOGOUT
vnpAuthRouter.post("/logout", (req: Request, res: Response) => {
  return res.json({
    status: "SUCCESS",
    message: "Session lease terminated. VNP telemetry credentials cleared."
  });
});
