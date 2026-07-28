import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Key,
  UserCheck,
  User,
  LogIn,
  LogOut,
  UserPlus,
  Lock,
  Globe,
  Terminal,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Github,
  RefreshCw,
  Copy,
  Check,
  Eye,
  EyeOff,
  Cpu,
  Server,
  KeyRound,
  Users,
  Award,
  Sparkles,
  ArrowRight,
  ShieldAlert
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { VnpAnalyticsCards } from "./VnpAnalyticsCards";

export interface VnpUser {
  id: string;
  email: string;
  name: string;
  role: string;
  organization: string;
  avatarUrl?: string;
  bio?: string;
  assignedVnpNodes: string[];
  sshPublicKey?: string;
  mfaEnabled: boolean;
  apiKeys: Array<{
    keyId: string;
    keyName: string;
    prefix: string;
    createdAt: string;
    lastUsedAt?: string;
  }>;
  oauthProvider?: string | null;
  createdAt: string;
  lastLoginAt: string;
}

export const VnpAuthHub: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<VnpUser | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("vnp_jwt_token") || null;
  });
  const [sessionLeaseId, setSessionLeaseId] = useState<string | null>(() => {
    return localStorage.getItem("vnp_session_lease") || null;
  });

  const [activeTab, setActiveTab] = useState<"portal" | "profile" | "apikeys" | "directory" | "analytics">("portal");
  const [portalMode, setPortalMode] = useState<"signin" | "signup" | "oauth">("signin");

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [organization, setOrganization] = useState("Veklom Sovereign Infrastructure");
  const [role, setRole] = useState("Node Telemetry Operator");
  const [sshKey, setSshKey] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  // UI status states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Directory users
  const [allUsers, setAllUsers] = useState<VnpUser[]>([]);
  const [isLoadingDirectory, setIsLoadingDirectory] = useState(false);

  // API key creation
  const [newKeyName, setNewKeyName] = useState("");
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [keyTestResult, setKeyTestResult] = useState<any | null>(null);
  const [isTestingKey, setIsTestingKey] = useState(false);

  // OAuth simulation states
  const [oauthStep, setOauthStep] = useState<number | null>(null);
  const [oauthProviderName, setOauthProviderName] = useState<string>("");

  // Physical nodes available for assignment
  const AVAILABLE_NODES = [
    { id: "vnp-us-ashburn-1", label: "US-East (Ashburn, VA)", region: "US-East", status: "ONLINE", rtt: "4ms" },
    { id: "vnp-us-hillsboro-1", label: "US-West (Hillsboro, OR)", region: "US-West", status: "ONLINE", rtt: "12ms" },
    { id: "vnp-eu-falkenstein-1", label: "EU-Central (Falkenstein, DE)", region: "EU-Central", status: "ONLINE", rtt: "85ms" },
    { id: "vnp-eu-nuremberg-1", label: "EU-South (Nuremberg, DE)", region: "EU-South", status: "ONLINE", rtt: "88ms" },
    { id: "vnp-ap-singapore-1", label: "AP-South (Singapore)", region: "AP-East", status: "ONLINE", rtt: "165ms" }
  ];

  // Verify session on component load
  useEffect(() => {
    if (token) {
      verifyCurrentSession(token);
    }
    fetchDirectory();
  }, []);

  const verifyCurrentSession = async (jwtToken: string) => {
    try {
      const res = await fetch("/api/vnp/auth/profile", {
        headers: {
          Authorization: `Bearer ${jwtToken}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        if (data.activeSession?.sessionLeaseId) {
          setSessionLeaseId(data.activeSession.sessionLeaseId);
          localStorage.setItem("vnp_session_lease", data.activeSession.sessionLeaseId);
        }
        // Sync form fields for editing
        setName(data.user.name || "");
        setOrganization(data.user.organization || "");
        setRole(data.user.role || "Node Telemetry Operator");
        setBio(data.user.bio || "");
        setAvatarUrl(data.user.avatarUrl || "");
        setSshKey(data.user.sshPublicKey || "");
      } else {
        // Token expired or invalid
        handleLogout();
      }
    } catch (err) {
      console.error("Session verification failed:", err);
    }
  };

  const fetchDirectory = async () => {
    setIsLoadingDirectory(true);
    try {
      const res = await fetch("/api/vnp/auth/users");
      if (res.ok) {
        const data = await res.json();
        setAllUsers(data.users || []);
      }
    } catch (err) {
      console.error("Failed to fetch VNP user directory:", err);
    } finally {
      setIsLoadingDirectory(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const notifySuccess = (msg: string) => {
    setErrorMessage(null);
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const notifyError = (msg: string) => {
    setSuccessMessage(null);
    setErrorMessage(msg);
  };

  // 1. SIGN IN
  const handleSignIn = async (e?: React.FormEvent, customEmail?: string, customPwd?: string) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const targetEmail = customEmail || email;
    const targetPwd = customPwd || password;

    if (!targetEmail || !targetPwd) {
      notifyError("Please enter both email and password.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/vnp/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail, password: targetPwd })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed.");
      }

      localStorage.setItem("vnp_jwt_token", data.token);
      localStorage.setItem("vnp_session_lease", data.sessionLeaseId);
      setToken(data.token);
      setSessionLeaseId(data.sessionLeaseId);
      setCurrentUser(data.user);
      notifySuccess(data.message || "Sovereign session authenticated.");
      setActiveTab("profile");
      fetchDirectory();
    } catch (err: any) {
      notifyError(err.message || "Failed to authenticate with VNP server.");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. SIGN UP
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email || !password || !name) {
      notifyError("Email, password, and full name are required.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/vnp/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          name,
          organization,
          role,
          sshPublicKey: sshKey
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Sign up failed.");
      }

      localStorage.setItem("vnp_jwt_token", data.token);
      localStorage.setItem("vnp_session_lease", data.sessionLeaseId);
      setToken(data.token);
      setSessionLeaseId(data.sessionLeaseId);
      setCurrentUser(data.user);
      notifySuccess("New VNP Node Operator account registered and authenticated!");
      setActiveTab("profile");
      fetchDirectory();
    } catch (err: any) {
      notifyError(err.message || "Failed to register account.");
    } finally {
      setIsLoading(false);
    }
  };

  // 3. OAUTH SIMULATION HANDSHAKE
  const handleOAuthLogin = async (provider: "github" | "google" | "veklom-iam") => {
    setOauthProviderName(provider === "github" ? "GitHub Enterprise" : provider === "google" ? "Google Cloud Identity" : "Veklom Sovereign IAM");
    setOauthStep(1);
    setIsLoading(true);
    setErrorMessage(null);

    // Simulate OAuth handshake steps
    setTimeout(() => setOauthStep(2), 700);
    setTimeout(() => setOauthStep(3), 1500);

    setTimeout(async () => {
      try {
        const demoEmail = provider === "github" ? "anthony@veklom.com" : provider === "google" ? "dr.vance@veklom.com" : `sovereign.node.${Date.now().toString().slice(-4)}@veklom.com`;
        const demoName = provider === "github" ? "Anthony Node-Operator" : provider === "google" ? "Dr. Evelyn Vance" : "Federated Sovereign Node";

        const res = await fetch("/api/vnp/auth/oauth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            provider,
            email: demoEmail,
            name: demoName,
            organization: `${provider.toUpperCase()} Identity Federation`
          })
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "OAuth failed.");
        }

        localStorage.setItem("vnp_jwt_token", data.token);
        localStorage.setItem("vnp_session_lease", data.sessionLeaseId);
        setToken(data.token);
        setSessionLeaseId(data.sessionLeaseId);
        setCurrentUser(data.user);
        setOauthStep(null);
        notifySuccess(data.message || `Logged in via ${provider.toUpperCase()} OAuth.`);
        setActiveTab("profile");
        fetchDirectory();
      } catch (err: any) {
        notifyError(err.message || "OAuth authentication failed.");
        setOauthStep(null);
      } finally {
        setIsLoading(false);
      }
    }, 2400);
  };

  // 4. LOGOUT
  const handleLogout = async () => {
    try {
      await fetch("/api/vnp/auth/logout", { method: "POST" });
    } catch (e) {
      // ignore
    }
    localStorage.removeItem("vnp_jwt_token");
    localStorage.removeItem("vnp_session_lease");
    setToken(null);
    setSessionLeaseId(null);
    setCurrentUser(null);
    setNewlyCreatedKey(null);
    setKeyTestResult(null);
    notifySuccess("Logged out of VNP session. Credentials cleared from client memory.");
    setActiveTab("portal");
  };

  // 5. UPDATE PROFILE
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setIsLoading(true);

    try {
      const res = await fetch("/api/vnp/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          organization,
          role,
          bio,
          avatarUrl,
          sshPublicKey: sshKey,
          assignedVnpNodes: currentUser?.assignedVnpNodes || []
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Profile update failed.");

      setCurrentUser(data.user);
      notifySuccess("Profile and VNP node attestation updated securely!");
      fetchDirectory();
    } catch (err: any) {
      notifyError(err.message || "Failed to update profile.");
    } finally {
      setIsLoading(false);
    }
  };

  // 6. TOGGLE NODE ASSIGNMENT
  const toggleNodeAssignment = async (nodeId: string) => {
    if (!currentUser || !token) return;
    const currentNodes = [...currentUser.assignedVnpNodes];
    const index = currentNodes.indexOf(nodeId);
    if (index > -1) {
      currentNodes.splice(index, 1);
    } else {
      currentNodes.push(nodeId);
    }

    try {
      const res = await fetch("/api/vnp/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ assignedVnpNodes: currentNodes })
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentUser(data.user);
        notifySuccess(`Node assignment for [${nodeId}] updated.`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 7. CREATE API KEY
  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setIsLoading(true);

    try {
      const res = await fetch("/api/vnp/auth/api-keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ keyName: newKeyName || `VNP-Sensor-${Date.now().toString().slice(-4)}` })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create key.");

      setNewlyCreatedKey(data.apiKey);
      setNewKeyName("");
      // refresh user profile to see new key list
      verifyCurrentSession(token);
      notifySuccess("New cryptographic VNP ingestion key created!");
    } catch (err: any) {
      notifyError(err.message || "Error generating API key.");
    } finally {
      setIsLoading(false);
    }
  };

  // 8. REVOKE API KEY
  const handleRevokeApiKey = async (keyId: string) => {
    if (!token || !confirm(`Are you sure you want to revoke API key [${keyId}]? Telemetry sensors using this key will be denied immediately.`)) return;
    try {
      const res = await fetch(`/api/vnp/auth/api-keys/${keyId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        notifySuccess(`API key revoked successfully.`);
        verifyCurrentSession(token);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 9. LIVE TEST API KEY OR SESSION TOKEN
  const handleTestToken = async (testTokenStr: string) => {
    setIsTestingKey(true);
    setKeyTestResult(null);
    const start = performance.now();

    try {
      const res = await fetch("/api/vnp/auth/verify-session", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${testTokenStr}`
        }
      });
      const latency = Math.round(performance.now() - start);
      const data = await res.json();

      setKeyTestResult({
        status: res.status,
        ok: res.ok,
        latencyMs: latency,
        response: data
      });
    } catch (err: any) {
      setKeyTestResult({
        status: 500,
        ok: false,
        latencyMs: Math.round(performance.now() - start),
        response: { error: err.message || "Network request failed." }
      });
    } finally {
      setIsTestingKey(false);
    }
  };

  return (
    <div className="space-y-6 text-gray-200 font-sans">
      {/* 1. TOP SOVEREIGN AUTHENTICATION STATUS HEADER */}
      <div className="bg-[#0A0A0A] border-2 border-[#222] p-4 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-[#00F0FF]/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-none border-2 ${currentUser ? "bg-[#00F0FF]/10 border-[#00F0FF] text-[#00F0FF]" : "bg-[#1A1A1A] border-[#333] text-gray-400"}`}>
              {currentUser ? <ShieldCheck size={26} className="animate-pulse" /> : <Lock size={26} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-widest uppercase text-white">VNP TELEMETRY &amp; IDENTITY AUTHORITY</span>
                <span className={`px-2 py-0.5 text-[9px] font-mono font-black border ${currentUser ? "bg-emerald-950/80 border-emerald-500 text-emerald-400" : "bg-amber-950/80 border-amber-500 text-amber-400"}`}>
                  {currentUser ? "SESSION LEASE ACTIVE" : "UNAUTHENTICATED"}
                </span>
              </div>
              <h2 className="text-lg font-black tracking-tight text-white mt-0.5">
                {currentUser ? `Welcome, ${currentUser.name}` : "Sovereign Node Operator Authentication"}
              </h2>
              <p className="text-xs text-gray-400">
                {currentUser ? (
                  <span>Role: <strong className="text-[#00F0FF]">{currentUser.role}</strong> &nbsp;|&nbsp; Org: <strong className="text-gray-300">{currentUser.organization}</strong></span>
                ) : (
                  <span>Sign in with JWT credentials or OAuth 2.0 to manage physical VNP nodes and cryptographic ingestion tokens.</span>
                )}
              </p>
            </div>
          </div>

          {/* Quick Demo Login Pills */}
          {!currentUser ? (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-[#111] p-2 border border-[#333]">
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider px-1">1-Click Demo Logins:</span>
              <button
                onClick={() => handleSignIn(undefined, "dr.vance@veklom.com", "password123")}
                disabled={isLoading}
                className="px-2.5 py-1.5 bg-[#0D1818] hover:bg-[#00F0FF]/20 border border-[#00F0FF]/40 text-[#00F0FF] text-[11px] font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <UserCheck size={13} />
                <span>Dr. Evelyn Vance</span>
              </button>
              <button
                onClick={() => handleSignIn(undefined, "satoshi@veklom.com", "password123")}
                disabled={isLoading}
                className="px-2.5 py-1.5 bg-[#14180D] hover:bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[11px] font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <Terminal size={13} />
                <span>Satoshi Nakagawa</span>
              </button>
              <button
                onClick={() => handleSignIn(undefined, "anthony@veklom.com", "password123")}
                disabled={isLoading}
                className="px-2.5 py-1.5 bg-[#180D14] hover:bg-purple-500/20 border border-purple-500/40 text-purple-400 text-[11px] font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <ShieldAlert size={13} />
                <span>Anthony (Auditor)</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <span className="text-[10px] text-gray-400 font-mono block">SESSION LEASE ID:</span>
                <span className="text-xs font-mono font-bold text-[#00F0FF]">{sessionLeaseId || "vnp-lease-active"}</span>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-950/60 hover:bg-red-900 border border-red-500/50 text-red-300 font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md"
              >
                <LogOut size={14} />
                <span>Terminate Session</span>
              </button>
            </div>
          )}
        </div>

        {/* Status Messages */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 p-3 bg-red-950/80 border-2 border-red-500 text-red-200 text-xs flex items-center gap-2.5 font-bold shadow-lg"
            >
              <AlertTriangle size={18} className="text-red-400 flex-shrink-0" />
              <span>{errorMessage}</span>
            </motion.div>
          )}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 p-3 bg-emerald-950/80 border-2 border-emerald-500 text-emerald-200 text-xs flex items-center gap-2.5 font-bold shadow-lg"
            >
              <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
              <span>{successMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. NAVIGATION TABS INSIDE AUTH HUB */}
      <div className="flex flex-wrap border-b-2 border-[#222] bg-[#050505] p-1">
        {[
          { id: "portal", label: "Authentication Portal", icon: Key, badge: !currentUser ? "REQUIRED" : "LOGGED IN" },
          { id: "profile", label: "Sovereign Profile & Nodes", icon: User, badge: currentUser ? `${currentUser.assignedVnpNodes.length} NODES` : "LOCKED" },
          { id: "apikeys", label: "Telemetry API Keys", icon: Terminal, badge: currentUser ? `${currentUser.apiKeys.length} ACTIVE` : "LOCKED" },
          { id: "directory", label: "VNP Operator Roster", icon: Users, badge: `${allUsers.length} OPERATORS` },
          { id: "analytics", label: "Telemetry & Gating", icon: Activity, badge: "BENCHMARKS" }
        ].map((tab) => {
          const Icon = tab.icon;
          const isSel = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (!currentUser && (tab.id === "profile" || tab.id === "apikeys")) {
                  notifyError("Please sign in or use a demo login above to access this section.");
                  return;
                }
                setActiveTab(tab.id as any);
              }}
              className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 py-3 px-4 text-xs font-black uppercase tracking-wider transition-all border-b-2 ${
                isSel
                  ? "bg-[#0A0A0A] text-[#00F0FF] border-[#00F0FF] glow-cyan"
                  : "text-gray-400 hover:text-white border-transparent"
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
              <span className={`text-[9px] px-1.5 py-0.5 font-mono ${isSel ? "bg-[#00F0FF]/20 text-[#00F0FF]" : "bg-[#1a1a1a] text-gray-400"}`}>
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. TAB CONTENT PANES */}

      {/* TAB A: AUTHENTICATION PORTAL */}
      {activeTab === "portal" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Form / OAuth */}
          <div className="lg:col-span-7 bg-[#080808] border-2 border-[#222] p-6 space-y-6 shadow-xl">
            <div className="flex border-b border-[#222] pb-3 justify-between items-center">
              <div className="flex gap-2">
                <button
                  onClick={() => setPortalMode("signin")}
                  className={`px-4 py-2 text-xs font-black uppercase tracking-wider border transition-all ${
                    portalMode === "signin" ? "bg-[#00F0FF] text-black border-[#00F0FF]" : "bg-black text-gray-400 border-[#333] hover:text-white"
                  }`}
                >
                  Sign In (JWT)
                </button>
                <button
                  onClick={() => setPortalMode("signup")}
                  className={`px-4 py-2 text-xs font-black uppercase tracking-wider border transition-all ${
                    portalMode === "signup" ? "bg-[#00F0FF] text-black border-[#00F0FF]" : "bg-black text-gray-400 border-[#333] hover:text-white"
                  }`}
                >
                  Register Operator
                </button>
                <button
                  onClick={() => setPortalMode("oauth")}
                  className={`px-4 py-2 text-xs font-black uppercase tracking-wider border transition-all ${
                    portalMode === "oauth" ? "bg-[#00F0FF] text-black border-[#00F0FF]" : "bg-black text-gray-400 border-[#333] hover:text-white"
                  }`}
                >
                  OAuth 2.0 Federation
                </button>
              </div>
            </div>

            {/* SIGN IN FORM */}
            {portalMode === "signin" && (
              <form onSubmit={(e) => handleSignIn(e)} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-300">VNP Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. dr.vance@veklom.com"
                    className="w-full px-3.5 py-2.5 bg-black border-2 border-[#333] text-white text-sm font-mono focus:border-[#00F0FF] focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-black uppercase tracking-wider text-gray-300">Password / Access Secret</label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-xs text-[#00F0FF] hover:underline flex items-center gap-1"
                    >
                      {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                      <span>{showPassword ? "Hide" : "Show"}</span>
                    </button>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password (demo accounts use: password123)"
                    className="w-full px-3.5 py-2.5 bg-black border-2 border-[#333] text-white text-sm font-mono focus:border-[#00F0FF] focus:outline-none transition-colors"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-[#00F0FF] hover:bg-[#00d0dd] text-black font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all"
                  >
                    <LogIn size={16} />
                    <span>{isLoading ? "Authenticating with VNP Node..." : "Authenticate Session (JWT)"}</span>
                  </button>
                </div>
              </form>
            )}

            {/* SIGN UP FORM */}
            {portalMode === "signup" && (
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase tracking-wider text-gray-300">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Liam Thorne"
                      className="w-full px-3 py-2 bg-black border border-[#333] text-white text-sm focus:border-[#00F0FF] focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase tracking-wider text-gray-300">VNP Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. liam@veklom.com"
                      className="w-full px-3 py-2 bg-black border border-[#333] text-white text-sm font-mono focus:border-[#00F0FF] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase tracking-wider text-gray-300">Password (Min 8 Chars)</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create secure password"
                      className="w-full px-3 py-2 bg-black border border-[#333] text-white text-sm font-mono focus:border-[#00F0FF] focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase tracking-wider text-gray-300">VNP Network Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-3 py-2 bg-black border border-[#333] text-white text-sm focus:border-[#00F0FF] focus:outline-none"
                    >
                      <option value="Node Telemetry Operator">Node Telemetry Operator</option>
                      <option value="VNP Sovereign Architect">VNP Sovereign Architect</option>
                      <option value="Security Auditor">Security Auditor</option>
                      <option value="Standard Node User">Standard Node User</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-300">Organization / Entity</label>
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="e.g. Veklom Autonomous Fleet Operations"
                    className="w-full px-3 py-2 bg-black border border-[#333] text-white text-sm focus:border-[#00F0FF] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-300">SSH / Ed25519 Public Key (Optional Telemetry Attestation)</label>
                  <input
                    type="text"
                    value={sshKey}
                    onChange={(e) => setSshKey(e.target.value)}
                    placeholder="ssh-ed25519 AAAAC3NzaC..."
                    className="w-full px-3 py-2 bg-black border border-[#333] text-white text-xs font-mono focus:border-[#00F0FF] focus:outline-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-[#00F0FF] hover:bg-[#00d0dd] text-black font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all"
                  >
                    <UserPlus size={16} />
                    <span>{isLoading ? "Registering Node Identity..." : "Register & Establish Sovereign Lease"}</span>
                  </button>
                </div>
              </form>
            )}

            {/* OAUTH FEDERATION */}
            {portalMode === "oauth" && (
              <div className="space-y-6">
                <div className="p-3 bg-[#111] border border-[#333] text-xs text-gray-300 leading-relaxed">
                  <p>
                    <strong>Federated Identity Providers:</strong> Connect your institutional credentials for zero-touch onboarding. VNP OAuth automatically maps your federated claims to CAPPO authorization groups.
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => handleOAuthLogin("github")}
                    disabled={isLoading}
                    className="w-full p-4 bg-[#111] hover:bg-[#1a1a1a] border-2 border-[#333] hover:border-white text-white font-bold flex items-center justify-between transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <Github size={24} className="text-white group-hover:scale-110 transition-transform" />
                      <div className="text-left">
                        <span className="text-sm font-black uppercase tracking-wider block">GitHub Enterprise Cloud</span>
                        <span className="text-[10px] text-gray-400 font-mono">Scopes: read:user, vnp:telemetry, repo:status</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#00F0FF] uppercase group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      <span>Connect</span> <ArrowRight size={14} />
                    </span>
                  </button>

                  <button
                    onClick={() => handleOAuthLogin("google")}
                    disabled={isLoading}
                    className="w-full p-4 bg-[#111] hover:bg-[#1a1a1a] border-2 border-[#333] hover:border-[#4285F4] text-white font-bold flex items-center justify-between transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-black font-black text-xs">G</div>
                      <div className="text-left">
                        <span className="text-sm font-black uppercase tracking-wider block">Google Cloud Identity / Workspace</span>
                        <span className="text-[10px] text-gray-400 font-mono">Scopes: openid, profile, email, cloud-platform</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#4285F4] uppercase group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      <span>Connect</span> <ArrowRight size={14} />
                    </span>
                  </button>

                  <button
                    onClick={() => handleOAuthLogin("veklom-iam")}
                    disabled={isLoading}
                    className="w-full p-4 bg-[#0A1A1A] hover:bg-[#0E2626] border-2 border-[#00F0FF]/50 hover:border-[#00F0FF] text-white font-bold flex items-center justify-between transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <ShieldCheck size={24} className="text-[#00F0FF] group-hover:scale-110 transition-transform" />
                      <div className="text-left">
                        <span className="text-sm font-black uppercase tracking-wider block text-[#00F0FF]">Veklom Sovereign IAM (CAPPO Hub)</span>
                        <span className="text-[10px] text-gray-300 font-mono">Hardware Ed25519 &amp; TLA+ Invariant Attestation</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#00F0FF] uppercase group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      <span>Instant SSO</span> <ArrowRight size={14} />
                    </span>
                  </button>
                </div>

                {/* OAuth Handshake Modal Simulation */}
                <AnimatePresence>
                  {oauthStep && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="p-4 bg-black border-2 border-[#00F0FF] space-y-3 font-mono text-xs shadow-2xl"
                    >
                      <div className="flex items-center justify-between border-b border-[#222] pb-2 text-[#00F0FF] font-bold">
                        <span>[ OAUTH 2.0 / OIDC ATTESTATION IN PROGRESS ]</span>
                        <Activity size={14} className="animate-spin" />
                      </div>
                      <div className="space-y-1.5 text-[11px]">
                        <p className={oauthStep >= 1 ? "text-white font-bold" : "text-gray-600"}>
                          ✓ 1. Redirecting to {oauthProviderName} authorization endpoint...
                        </p>
                        <p className={oauthStep >= 2 ? "text-emerald-400 font-bold" : "text-gray-600"}>
                          {oauthStep >= 2 ? "✓ 2. Authorization code exchanged for cryptographically signed ID token." : "⏳ 2. Exchanging authorization code..."}
                        </p>
                        <p className={oauthStep >= 3 ? "text-[#00F0FF] font-black animate-pulse" : "text-gray-600"}>
                          {oauthStep >= 3 ? "✓ 3. CAPPO authority validating ID claims & issuing 7-day session lease..." : "⏳ 3. Issuing VNP session lease..."}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Right Column: Architecture & Security Explainer */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#0A0A0A] border-2 border-[#222] p-5 space-y-4">
              <div className="flex items-center gap-2 text-[#00F0FF] border-b border-[#222] pb-2">
                <ShieldCheck size={18} />
                <h3 className="text-sm font-black uppercase tracking-wider">VNP Authentication Architecture</h3>
              </div>

              <div className="space-y-3 text-xs text-gray-300 leading-relaxed">
                <div className="p-3 bg-[#111] border-l-4 border-[#00F0FF]">
                  <span className="font-bold text-white block mb-0.5">1. Cryptographic JWT Bearer Tokens</span>
                  <p className="text-gray-400 text-[11px]">
                    Every session is governed by an HMAC-SHA256 signed JSON Web Token (JWT) carrying immutable claims for your assigned physical node clusters and CAPPO permissions.
                  </p>
                </div>

                <div className="p-3 bg-[#111] border-l-4 border-emerald-500">
                  <span className="font-bold text-white block mb-0.5">2. OAuth 2.0 &amp; OIDC Federation</span>
                  <p className="text-gray-400 text-[11px]">
                    Institutional operators can authenticate without password drift by connecting GitHub Enterprise or Google Workspace OAuth identities directly to VNP telemetry roles.
                  </p>
                </div>

                <div className="p-3 bg-[#111] border-l-4 border-amber-500">
                  <span className="font-bold text-white block mb-0.5">3. Hardware Security &amp; MFA Gate</span>
                  <p className="text-gray-400 text-[11px]">
                    High-impact commands (such as global route overrides or threshold adjustments) require 2FA attestation and valid SSH Ed25519 key signatures.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-[#081212] border border-[#00F0FF]/30 text-[11px] font-mono text-[#00F0FF] flex items-center justify-between">
                <span>VNP PROTOCOL VERSION:</span>
                <span className="font-bold text-white">v2.4-SOVEREIGN-AUTH</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB B: SOVEREIGN PROFILE & PHYSICAL NODE ASSIGNMENT */}
      {activeTab === "profile" && currentUser && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-[#080808] border-2 border-[#222] p-6 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#222] pb-3">
              <div className="flex items-center gap-2">
                <User size={18} className="text-[#00F0FF]" />
                <h3 className="text-sm font-black uppercase tracking-wider text-white">Sovereign Operator Profile</h3>
              </div>
              <span className="text-xs font-mono text-gray-400">ID: {currentUser.id}</span>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-300">Operator Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-[#333] text-white text-sm focus:border-[#00F0FF] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-300">Organization / Entity</label>
                  <input
                    type="text"
                    required
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-[#333] text-white text-sm focus:border-[#00F0FF] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-300">VNP Network Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-[#333] text-white text-sm focus:border-[#00F0FF] focus:outline-none"
                  >
                    <option value="VNP Sovereign Architect">VNP Sovereign Architect</option>
                    <option value="Node Telemetry Operator">Node Telemetry Operator</option>
                    <option value="Security Auditor">Security Auditor</option>
                    <option value="Standard Node User">Standard Node User</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-300">Avatar Image URL</label>
                  <input
                    type="text"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-black border border-[#333] text-white text-xs font-mono focus:border-[#00F0FF] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-wider text-gray-300">Operator Bio / Credentials</label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Enter professional credentials..."
                  className="w-full px-3 py-2 bg-black border border-[#333] text-white text-xs focus:border-[#00F0FF] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-wider text-gray-300">SSH / Ed25519 Attestation Public Key</label>
                <input
                  type="text"
                  value={sshKey}
                  onChange={(e) => setSshKey(e.target.value)}
                  placeholder="ssh-ed25519 AAAAC3NzaC..."
                  className="w-full px-3 py-2 bg-black border border-[#333] text-white text-xs font-mono focus:border-[#00F0FF] focus:outline-none"
                />
                <span className="text-[10px] text-gray-500 block">Required for immutable git-main-blueprint commit sealing and physical node SSH tunnels.</span>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2.5 bg-[#00F0FF] hover:bg-[#00d0dd] text-black font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all"
                >
                  <Check size={16} />
                  <span>{isLoading ? "Saving Profile..." : "Save Profile & Attest Changes"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Physical Node Assignment & Security Gate */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#0A0A0A] border-2 border-[#222] p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#222] pb-2">
                <div className="flex items-center gap-2 text-[#00F0FF]">
                  <Server size={18} />
                  <h3 className="text-sm font-black uppercase tracking-wider">Assigned Physical VNP Nodes</h3>
                </div>
                <span className="text-xs font-mono bg-black px-2 py-0.5 border border-[#333] text-white">
                  {currentUser.assignedVnpNodes.length} / {AVAILABLE_NODES.length} Active
                </span>
              </div>

              <p className="text-xs text-gray-400">
                Check physical nodes below to authorize your JWT identity for real-time telemetry ingestion and command execution on those clusters.
              </p>

              <div className="space-y-2">
                {AVAILABLE_NODES.map((node) => {
                  const isAssigned = currentUser.assignedVnpNodes.includes(node.id);
                  return (
                    <div
                      key={node.id}
                      onClick={() => toggleNodeAssignment(node.id)}
                      className={`p-3 border-2 cursor-pointer transition-all flex items-center justify-between ${
                        isAssigned
                          ? "bg-[#0A1A1A] border-[#00F0FF] text-white shadow-[0_0_10px_rgba(0,240,255,0.15)]"
                          : "bg-black border-[#222] text-gray-400 hover:border-[#444]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 border flex items-center justify-center ${isAssigned ? "bg-[#00F0FF] border-[#00F0FF] text-black" : "border-[#444]"}`}>
                          {isAssigned && <Check size={12} className="stroke-[3]" />}
                        </div>
                        <div>
                          <span className={`text-xs font-bold block ${isAssigned ? "text-white" : "text-gray-300"}`}>{node.label}</span>
                          <span className="text-[10px] font-mono text-gray-500">ID: {node.id}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-mono text-emerald-400 font-bold block">{node.status}</span>
                        <span className="text-[9px] font-mono text-gray-500">RTT: {node.rtt}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Active JWT Session Diagnostic Box */}
            <div className="bg-black border border-[#333] p-4 space-y-2 font-mono text-xs">
              <span className="text-[#00F0FF] font-black text-[10px] block uppercase tracking-wider">[ ACTIVE JWT BEARER TOKEN ]</span>
              <div className="p-2 bg-[#0A0A0A] border border-[#222] text-gray-400 text-[10px] break-all max-h-24 overflow-y-auto select-all">
                {token || "No token present in memory"}
              </div>
              <div className="flex justify-between items-center text-[10px] text-gray-500 pt-1">
                <span>Lease: {sessionLeaseId}</span>
                <button
                  onClick={() => handleCopy(token || "", "token")}
                  className="text-[#00F0FF] hover:underline flex items-center gap-1"
                >
                  <Copy size={11} />
                  <span>{copiedKey === "token" ? "Copied!" : "Copy JWT"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB C: TELEMETRY API KEYS & HMAC INGESTION TEST */}
      {activeTab === "apikeys" && currentUser && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-[#080808] border-2 border-[#222] p-6 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#222] pb-3">
              <div className="flex items-center gap-2">
                <Terminal size={18} className="text-[#00F0FF]" />
                <h3 className="text-sm font-black uppercase tracking-wider text-white">Cryptographic Ingestion API Keys</h3>
              </div>
              <span className="text-xs font-mono text-gray-400">Total Keys: {currentUser.apiKeys.length}</span>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              Generate long-lived secret API keys (<code>vnp_live_sk_...</code>) for autonomous physical edge devices and sensor nodes. These tokens allow automated background ingestion without manual password login.
            </p>

            {/* Create Key Form */}
            <form onSubmit={handleCreateApiKey} className="flex gap-2">
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="Key Identifier (e.g. Hillsboro-Sensor-Node-04)"
                className="flex-1 px-3.5 py-2.5 bg-black border-2 border-[#333] text-white text-xs font-mono focus:border-[#00F0FF] focus:outline-none"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2.5 bg-[#00F0FF] hover:bg-[#00d0dd] text-black font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all whitespace-nowrap"
              >
                <KeyRound size={15} />
                <span>Generate New Key</span>
              </button>
            </form>

            {/* Newly Created Key Modal Display */}
            {newlyCreatedKey && (
              <div className="p-4 bg-[#051818] border-2 border-[#00F0FF] space-y-3 font-mono">
                <div className="flex justify-between items-center text-[#00F0FF] font-bold text-xs">
                  <span>⚠️ NEW API KEY GENERATED — SAVE IMMEDIATELY</span>
                  <span className="text-[10px] uppercase bg-[#00F0FF] text-black px-1.5 py-0.5 font-black">Never Shown Again</span>
                </div>
                <div className="p-3 bg-black border border-[#00F0FF]/50 text-white text-xs break-all select-all font-bold">
                  {newlyCreatedKey}
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 text-[11px]">Copy this secret to your physical node's environment.</span>
                  <button
                    onClick={() => handleCopy(newlyCreatedKey, "newkey")}
                    className="px-3 py-1 bg-[#00F0FF] text-black font-bold text-xs flex items-center gap-1.5"
                  >
                    {copiedKey === "newkey" ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedKey === "newkey" ? "Copied to Clipboard!" : "Copy Key Secret"}</span>
                  </button>
                </div>
              </div>
            )}

            {/* List of Existing API Keys */}
            <div className="space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-gray-400 block">Active Ingestion Keys</span>
              {currentUser.apiKeys.length === 0 ? (
                <div className="p-8 bg-black border border-[#222] text-center text-gray-500 text-xs font-mono">
                  No active API keys found. Generate a key above to authorize sensor node ingestion.
                </div>
              ) : (
                currentUser.apiKeys.map((k) => (
                  <div key={k.keyId} className="p-3.5 bg-black border border-[#222] flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{k.keyName}</span>
                        <span className="text-[10px] font-mono text-gray-400 bg-[#111] px-1.5 py-0.5 border border-[#333]">{k.prefix}</span>
                      </div>
                      <span className="text-[10px] text-gray-500 font-mono block mt-1">
                        Created: {new Date(k.createdAt).toLocaleDateString()} &nbsp;|&nbsp; Key ID: {k.keyId}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRevokeApiKey(k.keyId)}
                      className="px-3 py-1.5 bg-red-950/40 hover:bg-red-900 border border-red-500/40 text-red-400 hover:text-white font-bold text-[10px] uppercase tracking-wider transition-all"
                    >
                      Revoke
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Column: Live Verification Test Bench */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#0A0A0A] border-2 border-[#222] p-5 space-y-4">
              <div className="flex items-center gap-2 text-[#00F0FF] border-b border-[#222] pb-2">
                <Activity size={18} />
                <h3 className="text-sm font-black uppercase tracking-wider">Live Token Test Bench</h3>
              </div>

              <p className="text-xs text-gray-300">
                Test whether your current JWT token or API key is actively accepted by the <code>/api/vnp/auth/verify-session</code> endpoint under real CAPPO cryptographic validation.
              </p>

              <button
                onClick={() => handleTestToken(token || "")}
                disabled={isTestingKey}
                className="w-full py-3 bg-[#111] hover:bg-[#1a1a1a] border-2 border-[#00F0FF] text-[#00F0FF] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <RefreshCw size={15} className={isTestingKey ? "animate-spin" : ""} />
                <span>{isTestingKey ? "Executing Cryptographic Handshake..." : "Test Active Token Authorization"}</span>
              </button>

              {keyTestResult && (
                <div className="p-3 bg-black border border-[#333] space-y-2 font-mono text-xs">
                  <div className="flex justify-between items-center border-b border-[#222] pb-1">
                    <span className={`font-bold ${keyTestResult.ok ? "text-emerald-400" : "text-red-400"}`}>
                      STATUS: {keyTestResult.status} {keyTestResult.ok ? "VALIDATED" : "REJECTED"}
                    </span>
                    <span className="text-[10px] text-gray-400">RTT: {keyTestResult.latencyMs}ms</span>
                  </div>
                  <pre className="text-[10px] text-gray-300 overflow-x-auto whitespace-pre-wrap max-h-48">
                    {JSON.stringify(keyTestResult.response, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB D: VNP OPERATOR ROSTER (DIRECTORY) */}
      {activeTab === "directory" && (
        <div className="bg-[#080808] border-2 border-[#222] p-6 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#222] pb-3">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-[#00F0FF]" />
              <h3 className="text-sm font-black uppercase tracking-wider text-white">Global VNP Node Operators Directory</h3>
            </div>
            <button
              onClick={fetchDirectory}
              className="px-3 py-1.5 bg-[#111] hover:bg-[#1a1a1a] border border-[#333] text-gray-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <RefreshCw size={13} className={isLoadingDirectory ? "animate-spin" : ""} />
              <span>Refresh Roster</span>
            </button>
          </div>

          <p className="text-xs text-gray-300">
            Below is the authenticated directory of personnel currently authorized to govern physical VNP nodes and sign telemetry attestation packets across global data centers.
          </p>

          <div className="overflow-x-auto border border-[#222]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#111] border-b border-[#222] text-gray-400 font-mono text-[10px] uppercase">
                  <th className="p-3">Operator Identity</th>
                  <th className="p-3">Network Role</th>
                  <th className="p-3">Organization</th>
                  <th className="p-3">Assigned Physical Nodes</th>
                  <th className="p-3">Auth &amp; Attestation Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222] font-mono">
                {allUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-[#0c0c0c] transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-none border border-[#444] object-cover" />
                        ) : (
                          <div className="w-8 h-8 bg-[#1a1a1a] border border-[#444] flex items-center justify-center text-[#00F0FF] font-black">
                            {user.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <span className="font-bold text-white block text-sm">{user.name}</span>
                          <span className="text-[11px] text-gray-500 font-mono">{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-[#111] border border-[#333] text-[#00F0FF] font-bold text-[10px]">
                        {user.role}
                      </span>
                    </td>
                    <td className="p-3 text-gray-300 font-sans text-xs">
                      {user.organization}
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {user.assignedVnpNodes.map((n) => (
                          <span key={n} className="px-1.5 py-0.5 bg-[#0a1a1a] border border-[#00F0FF]/30 text-gray-300 text-[9px]">
                            {n}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[10px]">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          <span className="text-emerald-400 font-bold">JWT LEASE VERIFIED</span>
                        </div>
                        {user.mfaEnabled && (
                          <span className="inline-block px-1.5 py-0.2 bg-emerald-950 text-emerald-400 border border-emerald-500/50 text-[9px]">
                            2FA / CAPPO HSM
                          </span>
                        )}
                        {user.sshPublicKey && (
                          <span className="inline-block px-1.5 py-0.2 bg-[#111] text-gray-300 border border-[#333] text-[9px] ml-1">
                            Ed25519 ATTESTED
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. TELEMETRY & FEASIBILITY GATING TAB */}
      {activeTab === "analytics" && (
        <div className="p-6 bg-[#08080c] border border-[#222]">
          <VnpAnalyticsCards />
        </div>
      )}
    </div>
  );
};
