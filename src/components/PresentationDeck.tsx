import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  Maximize2,
  Minimize2,
  Edit3,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Search,
  FileText,
  Plus,
  Volume2,
  BookOpen,
  Award,
  TrendingUp,
  Coins,
  Globe,
  Cpu,
  Layers,
  ShieldCheck,
  Activity,
  Code,
  Sparkles,
  Trash2,
  Download,
  Info,
  Check,
  Building
} from "lucide-react";

interface PresentationDeckProps {
  blueprintTitle: string;
}

interface Slide {
  title: string;
  sub: string;
  points: string[];
  notes: string;
}

const DEFAULT_SLIDES: Slide[] = [
  {
    title: "THE CAPABILITY OS",
    sub: "APIs are merely implementation details. The core of any decentralized product is its self-contained Capability Units.",
    points: [
      "Deconstruct monolithic endpoints into self-governing, highly isolated business abilities.",
      "Verify every execution claim cryptographically before letting a node settle billing.",
      "Structure products as unified, rentable, and discoverable capability sets with strict SLAs."
    ],
    notes: "Lead with the paradigm shift. Explain to stakeholders that we are moving away from centralized REST API endpoints and towards isolated Capability Units that carry their own cryptographic security policies. This limits security exposure and enables trustless execution."
  },
  {
    title: "MARKET LANDSCAPE",
    sub: "Decentralized autonomous agents require a frictionless, high-throughput machine-to-machine payment fabric.",
    points: [
      "Targeting the Serviceable Addressable Market (SAM): $45B across autonomous logistics, CDN nodes, and electric mobility networks.",
      "Legacy barriers: High transaction processing latency (3-5 days), excessive intermediary fees, and lack of protocol interoperability.",
      "The Veklom Advantage: Direct, sub-millisecond on-chain escrow settlement utilizing local Gnomledger instances."
    ],
    notes: "Quantify the opportunity. Highlight that autonomous machine-to-machine transactions cannot function using traditional banking rails. A drone charging station or CDN node cannot wait 3 days for Visa/Stripe processing. They require sub-second instant settlement."
  },
  {
    title: "X402 PAYMENTS PROTOCOL",
    sub: "A sub-millisecond ledger escrow settlement standard bypassing credit cards.",
    points: [
      "Automatic challenge-response validation using localized DNS-over-HTTPS proof hashes.",
      "Lowers payment processing latencies down to <15ms over localized Gnomeledgers.",
      "Collateral lock and instant smart contract payout release minimizes counterparty risk under peak congestion."
    ],
    notes: "Dive into the X402 standard. Explain how the DNS-over-HTTPS mechanism allows instant verification of route execution. Nodes lock up collateral before starting a job; once the proof hash matches, the escrow immediately disburses funds to the worker node."
  },
  {
    title: "EINSTEIN PRIORITY ROUTER",
    sub: "Asynchronous task allocation that optimizes routing and rewards high reliability.",
    points: [
      "Calculates a reputation-priority trend weight index based on historical SLA metrics and node uptime.",
      "Offsets jitter variances in real-time, routing heavy computations to edge nodes dynamically.",
      "Zero-dependency Rust Tokio engine guarantees scale-resilience under extreme node drop-off scenarios."
    ],
    notes: "Discuss routing efficiency. The Einstein router is predictive, meaning it doesn't just route packets randomly; it forecasts which nodes are likely to experience jitter or packet drops based on previous transactions. This ensures SLA guarantees are met."
  },
  {
    title: "VERIFIABLE EVIDENCE ANCHOR",
    sub: "All node actions must generate cryptographically bound proofs.",
    points: [
      "Constructs Merkle tree blocks from execution hash outputs and transaction states.",
      "Commits Merkle roots onto Gnomeledger, making verification immutable and universally audit-friendly.",
      "Guarantees that public auditors can audit performance history with mathematical certainty without exposing raw payload data."
    ],
    notes: "Explain evidence anchoring. Highlighting that privacy is preserved because only the Merkle roots are committed on-chain. This allows public auditing of a node's historical compliance while keeping private transaction details entirely off-ledger."
  },
  {
    title: "ACADEMIC VALIDATION",
    sub: "Rooted in peer-reviewed scientific game theory and network math.",
    points: [
      "Aligned with Dr. Evelyn Vance's SSRN foundations of M2M sovereign ecosystems and reputation matrices.",
      "Adopts the strict communication schemas and capability state representations detailed in the arXiv:2403.09112 specification.",
      "Grounding is fully searchable in our local high-contrast vector search panels for enterprise compliance teams."
    ],
    notes: "Establish credibility. Emphasize that the entire system is not built on speculative theories but relies directly on Dr. Evelyn Vance's math models and Nakagawa's communication schemas. It has rigorous scholastic foundations."
  },
  {
    title: "PRICING & REVENUE MODEL",
    sub: "A transparent pay-per-check and pay-per-mint monetization schedule.",
    points: [
      "Capability base price floors range from $0.0005 to $0.05 per check, enabling cost-effective high-frequency operations.",
      "Aggregated enterprise packages provide sliding-scale discounts (up to 20% off above 1M monthly check volumes).",
      "Guarantees high operating margins (85%+) while providing worker nodes with highly predictable running costs."
    ],
    notes: "Present the business model. Highlight the sliding scale discount structure. Because the protocol has zero middle-men, operating margins are incredibly high, while the predictable price floors allow enterprise clients to budget exactly."
  },
  {
    title: "ROADMAP & EXECUTION",
    sub: "Four structured implementation cycles moving from abstraction to sovereign mainnet scaling.",
    points: [
      "Phase 1: Complete abstract controller routing, validation schemas, and capability descriptors.",
      "Phase 2: Establish decentralized escrows and verifiable proof anchor badges.",
      "Phase 3: Deploy hardware ledger wallets across Seattle edge networks and run localized simulation tests.",
      "Phase 4: Global sovereign mainnet scaling under isolated hardware enclave sandboxes."
    ],
    notes: "Conclude with the roadmap. Point out that we are currently executing Phase 1 and establishing the testing harness for Phase 2. The pathway is clear, concrete, and measurable, leading to a fully scaled mainnet release."
  }
];

export default function PresentationDeck({ blueprintTitle }: PresentationDeckProps) {
  // Slides State (Initialized with defaults, allows persistent customization)
  const [slides, setSlides] = useState<Slide[]>(() => {
    const saved = localStorage.getItem("veklom_custom_slides");
    return saved ? JSON.parse(saved) : DEFAULT_SLIDES;
  });

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isAutoplay, setIsAutoplay] = useState(false);
  const [autoplaySpeed, setAutoplaySpeed] = useState(5); // in seconds
  const [showNotes, setShowNotes] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Advanced Keynote/PowerPoint Style Dual-View Presenter states
  const [presenterConsoleMode, setPresenterConsoleMode] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  // Editor Temporary states for the active slide
  const [editTitle, setEditTitle] = useState("");
  const [editSub, setEditSub] = useState("");
  const [editPoint0, setEditPoint0] = useState("");
  const [editPoint1, setEditPoint1] = useState("");
  const [editPoint2, setEditPoint2] = useState("");
  const [editNotes, setEditNotes] = useState("");

  // Interactive Sandboxes states
  // Slide 1 Sandbox: Capability Unit Toggler
  const [s1Caps, setS1Caps] = useState({
    auth: true,
    audit: true,
    multiRegion: false,
    routing: true,
    proofs: false
  });
  const [s1Sig, setS1Sig] = useState("0x3b1c...99a0");
  const [s1Status, setS1Status] = useState("STANDBY");

  // Slide 2 Sandbox: Market Calculator
  const [nodesSlider, setNodesSlider] = useState(15000); // number of nodes
  const [txnSlider, setTxnSlider] = useState(100);       // txns per node per day
  const [feeSlider, setFeeSlider] = useState(0.005);     // fee per transaction ($)

  // Slide 3 Sandbox: X402 Payment Handshake Flow
  const [paymentStep, setPaymentStep] = useState(0); // 0: Idle, 1: Collateral Locked, 2: Challenge Prompted, 3: DNS Verified, 4: Settled
  const [paymentLog, setPaymentLog] = useState<string[]>([]);
  const [isPaying, setIsPaying] = useState(false);

  // Slide 4 Sandbox: Einstein Routing Simulator
  const [simJitter, setSimJitter] = useState(12);
  const [simSla, setSimSla] = useState(98);
  const [simPacketLoss, setSimPacketLoss] = useState(0.4);
  const [simRoutePath, setSimRoutePath] = useState<string[]>([]);
  const [isRouting, setIsRouting] = useState(false);

  // Slide 5 Sandbox: Merkle Anchor Builder
  const [anchorInput, setAnchorInput] = useState("Seattle-Edge-Alpha: SLA Compliant 99.8%");
  const [merkleTree, setMerkleTree] = useState<Array<{ id: string; claim: string; hash: string }>>([
    { id: "1", claim: "Gnomeledger Genesis Block Initialized", hash: "8f4a1b02..." },
    { id: "2", claim: "Anchor ID #402: CAPPO Access Approved", hash: "c3d5a89e..." }
  ]);
  const [merkleRoot, setMerkleRoot] = useState("a1b2c3d4e5f6g7h8...");

  // Slide 6 Sandbox: Semantic arXiv Citation Grounder
  const [academicSearch, setAcademicSearch] = useState("");
  const [citationResult, setCitationResult] = useState<any[]>([]);

  // Slide 7 Sandbox: Tiers pricing simulator
  const [pricingVolume, setPricingVolume] = useState(500000); // transactions per month
  const [pricingTier, setPricingTier] = useState("Standard Scale");

  // Slide 8 Sandbox: Roadmap checkmarks
  const [activeRoadmapPhase, setActiveRoadmapPhase] = useState(1);

  // Populate editor when starting edit mode or when current slide changes
  useEffect(() => {
    const active = slides[currentSlide];
    if (active) {
      setEditTitle(active.title);
      setEditSub(active.sub);
      setEditPoint0(active.points[0] || "");
      setEditPoint1(active.points[1] || "");
      setEditPoint2(active.points[2] || "");
      setEditNotes(active.notes || "");
    }
  }, [currentSlide, isEditing, slides]);

  // Handle slide save
  const handleSaveSlide = () => {
    const updated = [...slides];
    updated[currentSlide] = {
      title: editTitle,
      sub: editSub,
      points: [editPoint0, editPoint1, editPoint2].filter(p => p !== ""),
      notes: editNotes
    };
    setSlides(updated);
    localStorage.setItem("veklom_custom_slides", JSON.stringify(updated));
    setIsEditing(false);
    setSuccessMsg("Slide settings saved successfully!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  // Reset to default slides
  const handleResetSlides = () => {
    if (window.confirm("Are you sure you want to reset all slides back to standard Veklom guidelines?")) {
      setSlides(DEFAULT_SLIDES);
      localStorage.removeItem("veklom_custom_slides");
      setCurrentSlide(0);
      setSuccessMsg("Slides restored to standard system blueprints!");
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  // Autoplay Logic
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isAutoplay) {
      timer = setInterval(() => {
        setCurrentSlide(prev => {
          if (prev >= slides.length - 1) {
            return 0; // loop back to first
          }
          return prev + 1;
        });
      }, autoplaySpeed * 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isAutoplay, autoplaySpeed, slides.length]);

  // Keyboard navigation for Theater Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isTheaterMode) return;
      if (e.key === "ArrowRight") {
        setCurrentSlide(prev => Math.min(slides.length - 1, prev + 1));
      } else if (e.key === "ArrowLeft") {
        setCurrentSlide(prev => Math.max(0, prev - 1));
      } else if (e.key === "Escape") {
        setIsTheaterMode(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isTheaterMode, slides.length]);

  // Handle presenter stopwatch timer increments
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (timerRunning) {
      timer = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timerRunning]);

  // Reset or start timer when entering theater mode
  useEffect(() => {
    if (isTheaterMode) {
      setElapsedSeconds(0);
      setTimerRunning(true);
    } else {
      setTimerRunning(false);
    }
  }, [isTheaterMode]);

  // Action for Slide 1 Sandbox: Verify Capability Node
  const handleSignNode = () => {
    setS1Status("CALCULATING_SIGNATURE");
    setTimeout(() => {
      const entropy = Math.random().toString(36).substring(2, 10);
      setS1Sig(`0x4a9b${entropy}cc2b`);
      setS1Status("VERIFIED_CAPABILITY_CLAIM");
    }, 800);
  };

  // Computations for Slide 2 Sandbox: TAM / SAM / SOM
  const s2MarketStats = useMemo(() => {
    const dailyTxns = nodesSlider * txnSlider;
    const dailyRev = dailyTxns * feeSlider;
    const annualRev = dailyRev * 365;

    // SOM is Veklom's targeting capacity (assume 8% of SAM)
    const somValue = annualRev * 0.08;
    return {
      dailyVolume: dailyTxns.toLocaleString(),
      dailyRevenue: dailyRev.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      annualTAM: (annualRev * 8.5).toLocaleString(undefined, { maximumFractionDigits: 0 }),
      annualSAM: annualRev.toLocaleString(undefined, { maximumFractionDigits: 0 }),
      annualSOM: somValue.toLocaleString(undefined, { maximumFractionDigits: 0 })
    };
  }, [nodesSlider, txnSlider, feeSlider]);

  // Action for Slide 3 Sandbox: X402 simulator
  const handleRunPayment = () => {
    setIsPaying(true);
    setPaymentStep(1);
    setPaymentLog(["[0ms] INITIATING HANDSHAKE: Locking 1,200 PGL collateral in escrow escrow_x402_c10"]);
    
    setTimeout(() => {
      setPaymentStep(2);
      setPaymentLog(prev => [...prev, "[250ms] CHALLENGE GENERATED: Handshake requested by worker node on port 8083"]);
    }, 600);

    setTimeout(() => {
      setPaymentStep(3);
      setPaymentLog(prev => [...prev, "[450ms] PROOF COMPUTED: Resolved DNS-over-HTTPS DNS proof. Merkle Root signature accepted."]);
    }, 1200);

    setTimeout(() => {
      setPaymentStep(4);
      setPaymentLog(prev => [...prev, "[650ms] SETTLEMENT DISBURSED: Escrow released. 1.25 PGL transferred to Seattle-Edge-Alpha. Pipeline Complete."]);
      setIsPaying(false);
    }, 1800);
  };

  // Action for Slide 4 Sandbox: Einstein Router Simulator
  const handlePulseRoute = () => {
    setIsRouting(true);
    setSimRoutePath(["Seattle-Edge-Alpha"]);
    
    setTimeout(() => {
      // route based on SLA and Jitter
      const score = Math.round((simSla * 0.6) - (simJitter * 1.5) - (simPacketLoss * 6.5) + 38);
      if (score > 80) {
        setSimRoutePath(["Seattle-Edge-Alpha", "London-Vault-Bravo", "Tokyo-Vessel-Delta"]);
      } else if (score > 55) {
        setSimRoutePath(["Seattle-Edge-Alpha", "Tokyo-Vessel-Delta"]);
      } else {
        setSimRoutePath(["Seattle-Edge-Alpha", "Bypassed-Jitter-Node"]);
      }
      setIsRouting(false);
    }, 1000);
  };

  // Action for Slide 5 Sandbox: Merkle Anchor Builder
  const handleAnchorClaim = () => {
    if (!anchorInput.trim()) return;
    const cleanClaim = anchorInput.trim().toUpperCase();
    const cleanHash = "sha256-" + Math.floor(Math.random() * 900000 + 100000).toString(16);
    
    const updated = [
      ...merkleTree,
      { id: Date.now().toString(), claim: cleanClaim, hash: cleanHash }
    ];
    setMerkleTree(updated);
    
    // Create compound hash representing root
    const rootHash = "sha256-root-" + Math.floor(Math.random() * 90000000 + 10000000).toString(16);
    setMerkleRoot(rootHash);
    setAnchorInput("");
  };

  // Action for Slide 6 Sandbox: Simulated Vector Search
  useEffect(() => {
    if (!academicSearch) {
      setCitationResult([]);
      return;
    }
    const query = academicSearch.toLowerCase();
    const database = [
      {
        paper: "Vance, E. (2025) - Foundations of Sovereign Machine-to-Machine Networks",
        quote: "We propose that decentralized autonomous actors settle latency challenges using isolated micro-escrow smart contracts built on the X402 standard to avoid middle-tier payment bottlenecks.",
        tags: ["vance", "m2m", "escrow", "sovereign"]
      },
      {
        paper: "Nakagawa, H. et al (2024) - Real-time SLA Integrity Models (arXiv:2403.09112)",
        quote: "By encoding service level agreement thresholds directly as cryptographic metadata inside capability structures, networks can dynamically drop high-jitter connections, optimizing paths up to 300%.",
        tags: ["nakagawa", "sla", "jitter", "arxiv"]
      },
      {
        paper: "Veklom Technical Paper V2 (2026)",
        quote: "The Gnomeledger ledger allows millisecond commitment of transaction receipts, creating a verifiable performance state history for edge network nodes.",
        tags: ["veklom", "gnomeledger", "evidence", "ledger"]
      }
    ];

    const matched = database.filter(item => 
      item.paper.toLowerCase().includes(query) || 
      item.quote.toLowerCase().includes(query) ||
      item.tags.some(t => t.includes(query))
    );
    setCitationResult(matched);
  }, [academicSearch]);

  // Compute stats for Slide 7 Sandbox: Pricing model
  const pricingStats = useMemo(() => {
    let basePrice = 0.005; // Base price floor per check
    let discount = 0;
    
    if (pricingVolume > 5000000) {
      basePrice = 0.0005;
      discount = 20;
    } else if (pricingVolume > 1000000) {
      basePrice = 0.001;
      discount = 15;
    } else if (pricingVolume > 200000) {
      basePrice = 0.0025;
      discount = 10;
    } else if (pricingVolume > 50000) {
      basePrice = 0.004;
      discount = 5;
    }

    const calculatedTier = pricingVolume > 5000000 ? "Global Sovereign Core" : pricingVolume > 1000000 ? "Enterprise Backbone" : pricingVolume > 200000 ? "Standard Scale" : "Developer Sandbox";
    setPricingTier(calculatedTier);

    const baseCost = pricingVolume * basePrice;
    const finalCost = baseCost * (1 - discount / 100);
    const nodeLicensingFee = finalCost * 0.15; // 15% revenue share to node operator
    const netVeklomMargin = finalCost * 0.85;  // 85% operating margin

    return {
      pricePerCheck: basePrice.toFixed(4),
      discountApplied: discount,
      totalCost: finalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      licensingShare: nodeLicensingFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      netMargin: netVeklomMargin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    };
  }, [pricingVolume]);

  const activeSlide = slides[currentSlide] || slides[0];

  return (
    <div className="space-y-6">
      {/* Top Controller Ribbon */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#222] pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Layers className="text-[#00F0FF] animate-pulse" size={18} />
            <span className="text-xs font-mono text-[#00F0FF] font-black uppercase tracking-widest bg-[#00F0FF]/10 px-2 py-0.5 border border-[#00F0FF]/25">
              PRESENTER CRADLE v4.02
            </span>
          </div>
          <h3 className="text-xl font-black text-white uppercase tracking-tight">
            Veklom Enterprise Presentation Deck
          </h3>
          <p className="text-[10px] font-mono text-gray-500 uppercase leading-relaxed font-semibold">
            Sleek brutalist slides paired with active real-time simulation sandboxes for stakeholder alignment.
          </p>
        </div>

        {/* Global Toolbar actions */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-[10px]">
          <button
            onClick={() => setIsTheaterMode(true)}
            className="px-3 py-1.5 bg-[#00F0FF]/15 hover:bg-[#00F0FF]/30 border border-[#00F0FF]/40 hover:border-[#00F0FF] text-[#00F0FF] font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer"
            title="Launch Boardroom Presenter Mode"
          >
            <Maximize2 size={12} />
            <span>Theater Mode</span>
          </button>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-3 py-1.5 border transition-all flex items-center gap-1.5 cursor-pointer font-bold uppercase ${
              isEditing 
                ? "bg-amber-500/20 border-amber-500 text-amber-400" 
                : "bg-[#111] border-[#222] hover:border-gray-500 text-gray-400 hover:text-white"
            }`}
          >
            <Edit3 size={12} />
            <span>{isEditing ? "Cancel Edit" : "Customize Slides"}</span>
          </button>

          <button
            onClick={handleResetSlides}
            className="px-3 py-1.5 bg-[#111] border border-[#222] hover:border-red-500/50 text-gray-500 hover:text-red-400 font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer"
            title="Reset to Template Standards"
          >
            <RefreshCw size={11} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-950/20 border border-emerald-500/40 text-emerald-300 font-mono text-[10px] uppercase font-black tracking-wider flex items-center gap-2">
          <CheckCircle2 size={13} className="text-emerald-500" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Slide & Sandbox Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Hand Column: Presentation Slides (Lg: col-span-7) */}
        <div className="lg:col-span-7 flex flex-col justify-between bg-[#040404] border-2 border-[#222] p-6 sm:p-8 relative overflow-hidden min-h-[480px]">
          
          {/* Subtle Ambient Laser Gradients */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#00F0FF]/2.5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-600/2.5 rounded-full blur-3xl pointer-events-none" />

          {/* Slide Metadata Header */}
          <div className="flex justify-between items-center border-b border-[#1A1A1A] pb-4">
            <span className="text-[10px] text-[#00F0FF] font-mono tracking-widest font-black uppercase">
              [ Slide {currentSlide + 1} of {slides.length} ] — {blueprintTitle || "Veklom Core Architecture"}
            </span>
            
            {/* Auto Player Indicator & speed selector */}
            <div className="flex items-center gap-2 bg-[#0c0c0c] border border-[#222] px-2 py-1">
              <button
                onClick={() => setIsAutoplay(!isAutoplay)}
                className="text-gray-400 hover:text-[#00F0FF] transition-colors"
                title={isAutoplay ? "Pause Autoplay" : "Start Autoplay"}
              >
                {isAutoplay ? <Pause size={12} className="text-[#00F0FF] animate-pulse" /> : <Play size={12} />}
              </button>
              
              <select
                value={autoplaySpeed}
                onChange={(e) => setAutoplaySpeed(parseInt(e.target.value))}
                className="bg-transparent text-[9px] font-mono font-bold uppercase text-gray-500 border-none outline-none cursor-pointer focus:ring-0"
              >
                <option value={3}>3s Autoplay</option>
                <option value={5}>5s Autoplay</option>
                <option value={10}>10s Autoplay</option>
                <option value={15}>15s Autoplay</option>
              </select>
            </div>
          </div>

          {/* Slide Body / Main Display */}
          <div className="py-6 sm:py-8 space-y-6 flex-1 flex flex-col justify-center">
            {isEditing ? (
              // Live Slide Customizer form
              <div className="space-y-4 font-mono text-[10px] text-gray-300">
                <div className="p-2 bg-amber-500/10 border border-amber-500/30 text-amber-300 uppercase font-bold text-[9px] tracking-wider mb-2">
                  Editing Mode active: Changes update local cached storage.
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-gray-500 uppercase font-black">Slide Header Title:</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value.toUpperCase())}
                    className="w-full bg-[#111] border border-[#222] p-2 font-mono text-white text-xs uppercase font-bold focus:border-[#00F0FF] outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-gray-500 uppercase font-black">Slide Description Subhead:</label>
                  <textarea
                    value={editSub}
                    onChange={(e) => setEditSub(e.target.value)}
                    rows={2}
                    className="w-full bg-[#111] border border-[#222] p-2 font-mono text-white text-xs focus:border-[#00F0FF] outline-none leading-relaxed"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-gray-500 uppercase font-black">Slide Bullet Statements:</label>
                  <input
                    type="text"
                    value={editPoint0}
                    onChange={(e) => setEditPoint0(e.target.value)}
                    placeholder="Bullet point 1..."
                    className="w-full bg-[#111] border border-[#222] p-2 font-mono text-white text-xs focus:border-[#00F0FF] outline-none"
                  />
                  <input
                    type="text"
                    value={editPoint1}
                    onChange={(e) => setEditPoint1(e.target.value)}
                    placeholder="Bullet point 2..."
                    className="w-full bg-[#111] border border-[#222] p-2 font-mono text-white text-xs focus:border-[#00F0FF] outline-none"
                  />
                  <input
                    type="text"
                    value={editPoint2}
                    onChange={(e) => setEditPoint2(e.target.value)}
                    placeholder="Bullet point 3..."
                    className="w-full bg-[#111] border border-[#222] p-2 font-mono text-white text-xs focus:border-[#00F0FF] outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-gray-500 uppercase font-black">Speaker / Presenter Guidelines:</label>
                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    rows={3}
                    placeholder="Speaker instructions..."
                    className="w-full bg-[#111] border border-[#222] p-2 font-mono text-white text-xs focus:border-[#00F0FF] outline-none leading-relaxed"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleSaveSlide}
                    className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/35 border border-amber-500 text-amber-200 font-bold uppercase transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Save size={12} />
                    <span>Apply Settings</span>
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-[#111] border border-[#222] text-gray-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Discard
                  </button>
                </div>
              </div>
            ) : (
              // Standard slide rendering
              <div className="space-y-5 animate-fadeIn">
                <div className="space-y-2">
                  <h4 className="text-3xl font-black text-white tracking-tight uppercase leading-none">
                    {activeSlide.title}
                  </h4>
                  <p className="text-xs font-mono text-gray-400 uppercase leading-relaxed max-w-2xl font-semibold">
                    {activeSlide.sub}
                  </p>
                </div>

                {/* Staggered beautiful list markers */}
                <div className="space-y-3.5 pt-4">
                  {activeSlide.points.map((pt, i) => (
                    <div
                      key={i}
                      className="p-3 bg-[#0a0a0a] border border-[#161616] hover:border-[#333] transition-all flex items-start gap-3 rounded-none relative"
                    >
                      <div className="absolute top-0 left-0 w-[2px] h-full bg-[#00F0FF]" />
                      <span className="text-[10px] text-[#00F0FF] font-black font-mono select-none">
                        0{i + 1}.
                      </span>
                      <p className="text-[10.5px] font-mono text-gray-300 uppercase leading-relaxed font-semibold">
                        {pt}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Speaker Notes expandable drawer */}
          <div className="border-t border-[#1C1C1C] pt-4 space-y-2">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowNotes(!showNotes)}
                className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#00F0FF] hover:text-white flex items-center gap-1.5 cursor-pointer"
              >
                <BookOpen size={12} />
                <span>{showNotes ? "[ HIDE SPEAKER NOTES ]" : "[ SHOW SPEAKER NOTES ]"}</span>
              </button>
              
              {isAutoplay && (
                <div className="w-16 bg-[#111] h-1 border border-[#222] rounded-none overflow-hidden">
                  <div className="h-full bg-[#00F0FF] animate-[pulse_1.5s_infinite]" style={{ width: "60%" }} />
                </div>
              )}
            </div>

            {showNotes && (
              <div className="p-3 bg-[#0c0c0c] border border-violet-500/20 font-mono text-[9px] text-[#8c8cbf] uppercase leading-relaxed space-y-1">
                <div className="flex items-center gap-1.5 text-violet-400 font-bold">
                  <Volume2 size={11} />
                  <span>PRESENTATION TALKING POINTS</span>
                </div>
                <p className="normal-case text-gray-400 font-semibold leading-relaxed">
                  {activeSlide.notes}
                </p>
              </div>
            )}
          </div>

          {/* Slide Deck bottom navigation bar */}
          <div className="flex justify-between items-center mt-6 border-t border-[#1A1A1A] pt-4">
            {/* Visual Thumbnails strip indicator */}
            <div className="hidden sm:flex items-center gap-1.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setCurrentSlide(i);
                    setIsEditing(false);
                  }}
                  className={`w-5 h-5 font-mono text-[8px] font-black uppercase transition-all flex items-center justify-center border cursor-pointer ${
                    i === currentSlide
                      ? "bg-[#00F0FF] text-black border-[#00F0FF]"
                      : "bg-[#0C0C0C] text-gray-600 border-[#222] hover:border-gray-500 hover:text-white"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            {/* Pagination Controls buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setCurrentSlide(prev => Math.max(0, prev - 1));
                  setIsEditing(false);
                }}
                disabled={currentSlide === 0}
                className="px-3 py-1 bg-[#0A0A0A] border-2 border-[#222] hover:border-white disabled:opacity-20 disabled:hover:border-[#222] text-white font-mono text-[9px] font-bold uppercase flex items-center gap-1 cursor-pointer transition-all rounded-none"
              >
                <ArrowLeft size={11} />
                <span>Prev</span>
              </button>

              <button
                onClick={() => {
                  setCurrentSlide(prev => Math.min(slides.length - 1, prev + 1));
                  setIsEditing(false);
                }}
                disabled={currentSlide === slides.length - 1}
                className="px-3 py-1 bg-[#0A0A0A] border-2 border-[#222] hover:border-white disabled:opacity-20 disabled:hover:border-[#222] text-white font-mono text-[9px] font-bold uppercase flex items-center gap-1 cursor-pointer transition-all rounded-none"
              >
                <span>Next</span>
                <ArrowRight size={11} />
              </button>
            </div>
          </div>

        </div>

        {/* Right Hand Column: Dynamic Interactive Sandboxes (Lg: col-span-5) */}
        <div className="lg:col-span-5 flex flex-col bg-[#050505] border-2 border-[#222] p-6 font-mono text-[10px] space-y-4 rounded-none min-h-[480px]">
          
          <div className="border-b border-[#222] pb-2.5 flex justify-between items-center">
            <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <Cpu size={13} className="text-[#00F0FF]" />
              <span>LIVE SLIDE TEST SANDBOX</span>
            </h4>
            <span className="px-1.5 py-0.5 bg-violet-600/10 text-violet-400 border border-violet-500/25 text-[8px] font-black uppercase tracking-widest">
              SLIDE {currentSlide + 1} EXPERIMENT
            </span>
          </div>

          {/* Dynamically render the playground corresponding to currentSlide */}
          <div className="flex-1 flex flex-col justify-between">
            {currentSlide === 0 && (
              // SLIDE 1 SANDBOX: THE CAPABILITY OS - Capability signature builder
              <div className="space-y-4 animate-fadeIn">
                <p className="text-gray-400 uppercase text-[9px] leading-relaxed font-semibold">
                  Select Capability features to append to your custom test node and click below to evaluate the cryptographic signature proof hash.
                </p>

                <div className="p-3.5 bg-[#0A0A0A] border border-[#222] space-y-2">
                  <div className="flex items-center justify-between text-white font-bold">
                    <span>CAPABILITY SELECTION</span>
                    <span className="text-[8px] text-gray-500">TOGGLERS</span>
                  </div>
                  
                  <div className="space-y-2 pt-1 text-[9px] uppercase">
                    <label className="flex items-center gap-2 cursor-pointer text-gray-300 hover:text-white">
                      <input
                        type="checkbox"
                        checked={s1Caps.auth}
                        onChange={(e) => setS1Caps(prev => ({ ...prev, auth: e.target.checked }))}
                        className="rounded-none border-[#222] bg-black text-[#00F0FF] focus:ring-0 cursor-pointer"
                      />
                      <span>CAPPO Security & Key Audit (auth_c402)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-gray-300 hover:text-white">
                      <input
                        type="checkbox"
                        checked={s1Caps.audit}
                        onChange={(e) => setS1Caps(prev => ({ ...prev, audit: e.target.checked }))}
                        className="rounded-none border-[#222] bg-black text-[#00F0FF] focus:ring-0 cursor-pointer"
                      />
                      <span>Gnomeledger Performance Anchor (perf_audit)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-gray-300 hover:text-white">
                      <input
                        type="checkbox"
                        checked={s1Caps.multiRegion}
                        onChange={(e) => setS1Caps(prev => ({ ...prev, multiRegion: e.target.checked }))}
                        className="rounded-none border-[#222] bg-black text-[#00F0FF] focus:ring-0 cursor-pointer"
                      />
                      <span>Multi-Region Localized DNS (dns_fallback)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-gray-300 hover:text-white">
                      <input
                        type="checkbox"
                        checked={s1Caps.routing}
                        onChange={(e) => setS1Caps(prev => ({ ...prev, routing: e.target.checked }))}
                        className="rounded-none border-[#222] bg-black text-[#00F0FF] focus:ring-0 cursor-pointer"
                      />
                      <span>Einstein Predictive Jitter Allocation (priority_route)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-gray-300 hover:text-white">
                      <input
                        type="checkbox"
                        checked={s1Caps.proofs}
                        onChange={(e) => setS1Caps(prev => ({ ...prev, proofs: e.target.checked }))}
                        className="rounded-none border-[#222] bg-black text-[#00F0FF] focus:ring-0 cursor-pointer"
                      />
                      <span>Merkle Tree Proof Generation (verifiable_proofs)</span>
                    </label>
                  </div>
                </div>

                <div className="p-3 bg-[#0A0A0A] border border-violet-500/20 text-[9px] uppercase space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Evaluated Status:</span>
                    <span className={`font-black ${s1Status === "STANDBY" ? "text-amber-400" : "text-emerald-400"}`}>
                      {s1Status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Verified Signature Hash:</span>
                    <span className="text-white font-mono font-bold tracking-wider">{s1Sig}</span>
                  </div>
                </div>

                <button
                  onClick={handleSignNode}
                  className="w-full py-2 bg-[#00F0FF]/10 hover:bg-[#00F0FF]/25 border border-[#00F0FF]/40 text-white font-mono uppercase font-black tracking-wider transition-colors cursor-pointer text-center"
                >
                  {s1Status === "CALCULATING_SIGNATURE" ? "Signing Payload..." : "Sign & Validate Capability Node"}
                </button>
              </div>
            )}

            {currentSlide === 1 && (
              // SLIDE 2 SANDBOX: MARKET LANDSCAPE - TAM/SAM/SOM Calculator
              <div className="space-y-4 animate-fadeIn">
                <p className="text-gray-400 uppercase text-[9px] leading-relaxed font-semibold">
                  Adjust standard inputs to model the annual Machine-to-Machine (M2M) payment settlement addressable market sizing.
                </p>

                <div className="space-y-3 p-3.5 bg-[#0a0a0a] border border-[#222]">
                  {/* Slider 1: Total Active Nodes */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-gray-300 font-bold">
                      <span>1. ACTIVE DECENTRALIZED NODES:</span>
                      <span className="text-[#00F0FF]">{nodesSlider.toLocaleString()} NODES</span>
                    </div>
                    <input
                      type="range"
                      min={1000}
                      max={100000}
                      step={500}
                      value={nodesSlider}
                      onChange={(e) => setNodesSlider(parseInt(e.target.value))}
                      className="w-full accent-[#00F0FF] h-1 bg-[#111] rounded-none cursor-pointer"
                    />
                  </div>

                  {/* Slider 2: Average Transactions / Node / Day */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-gray-300 font-bold">
                      <span>2. DAILY TRANSACTIONS / NODE:</span>
                      <span className="text-[#00F0FF]">{txnSlider} TXNS</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={1000}
                      step={10}
                      value={txnSlider}
                      onChange={(e) => setTxnSlider(parseInt(e.target.value))}
                      className="w-full accent-[#00F0FF] h-1 bg-[#111] rounded-none cursor-pointer"
                    />
                  </div>

                  {/* Slider 3: Escrow Settlement Fee */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-gray-300 font-bold">
                      <span>3. BASE PROTOCOL TRANS FEE:</span>
                      <span className="text-[#00F0FF]">${feeSlider.toFixed(4)} PGL</span>
                    </div>
                    <input
                      type="range"
                      min={0.0005}
                      max={0.05}
                      step={0.0005}
                      value={feeSlider}
                      onChange={(e) => setFeeSlider(parseFloat(e.target.value))}
                      className="w-full accent-[#00F0FF] h-1 bg-[#111] rounded-none cursor-pointer"
                    />
                  </div>
                </div>

                <div className="p-3 bg-[#0a0a0a] border border-[#222] font-mono space-y-1.5 uppercase text-[9px]">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Daily Trans Volume:</span>
                    <span className="text-white font-bold">{s2MarketStats.dailyVolume}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Daily Escrow Fees:</span>
                    <span className="text-white font-bold">${s2MarketStats.dailyRevenue}</span>
                  </div>
                  <div className="border-t border-[#1C1C1C] my-1 pt-1 space-y-1 font-bold">
                    <div className="flex justify-between text-gray-400">
                      <span>Total Addressable Market (TAM):</span>
                      <span className="text-white">${s2MarketStats.annualTAM} ARR</span>
                    </div>
                    <div className="flex justify-between text-[#00F0FF]">
                      <span>Serviceable Addressable (SAM):</span>
                      <span>${s2MarketStats.annualSAM} ARR</span>
                    </div>
                    <div className="flex justify-between text-emerald-400">
                      <span>Veklom SOM (8% Targeted Capture):</span>
                      <span>${s2MarketStats.annualSOM} ARR</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentSlide === 2 && (
              // SLIDE 3 SANDBOX: X402 PROTOCOL - Escrow sequence
              <div className="space-y-4 animate-fadeIn">
                <p className="text-gray-400 uppercase text-[9px] leading-relaxed font-semibold">
                  Interact with the X402 micro-escrow smart pipeline. Experience simulated state changes from collateral staking down to instant receipt disbursal.
                </p>

                {/* Vertical Stepper Graph */}
                <div className="space-y-2 p-3 bg-[#0A0A0A] border border-[#222] uppercase text-[9px]">
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center font-bold text-[8px] ${paymentStep >= 1 ? "bg-[#00F0FF] text-black" : "bg-[#111] border border-[#222] text-gray-500"}`}>1</div>
                    <span className={paymentStep >= 1 ? "text-white font-bold" : "text-gray-600"}>COLLATERAL STAKED (MIN_LOCK)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center font-bold text-[8px] ${paymentStep >= 2 ? "bg-[#00F0FF] text-black" : "bg-[#111] border border-[#222] text-gray-500"}`}>2</div>
                    <span className={paymentStep >= 2 ? "text-white font-bold" : "text-gray-600"}>CHALLENGE ISSUED (LOCAL_DNS)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center font-bold text-[8px] ${paymentStep >= 3 ? "bg-[#00F0FF] text-black" : "bg-[#111] border border-[#222] text-gray-500"}`}>3</div>
                    <span className={paymentStep >= 3 ? "text-white font-bold" : "text-gray-600"}>PROOF VERIFIED (SHA256_HASH)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center font-bold text-[8px] ${paymentStep >= 4 ? "bg-emerald-400 text-black" : "bg-[#111] border border-[#222] text-gray-500"}`}>4</div>
                    <span className={paymentStep >= 4 ? "text-emerald-400 font-bold animate-pulse" : "text-gray-600"}>ESCROW RELEASED (SETTLED)</span>
                  </div>
                </div>

                {/* Console Log display */}
                <div className="bg-black border border-[#222] p-2.5 h-24 overflow-y-auto font-mono text-[8.5px] text-[#00F0FF] space-y-1 uppercase scrollbar-thin">
                  {paymentLog.length === 0 ? (
                    <span className="text-gray-600 italic">Ready to run simulation...</span>
                  ) : (
                    paymentLog.map((log, i) => <div key={i}>{log}</div>)
                  )}
                </div>

                <button
                  onClick={handleRunPayment}
                  disabled={isPaying}
                  className="w-full py-2 bg-gradient-to-r from-violet-600/20 to-[#00F0FF]/20 hover:from-violet-600/35 hover:to-[#00F0FF]/35 border border-violet-500/30 hover:border-[#00F0FF] text-white font-mono uppercase font-black tracking-wider transition-colors cursor-pointer text-center disabled:opacity-50"
                >
                  {isPaying ? "Processing smart settlement..." : "Trigger X402 Escrow Pipeline"}
                </button>
              </div>
            )}

            {currentSlide === 3 && (
              // SLIDE 4 SANDBOX: EINSTEIN PRIORITY ROUTER - Dynamic Jitter Router Graph
              <div className="space-y-4 animate-fadeIn">
                <p className="text-gray-400 uppercase text-[9px] leading-relaxed font-semibold">
                  Test routing congestion based on network SLA and Jitter inputs. Click "Pulse Route" to evaluate how packets traverse available localized nodes.
                </p>

                <div className="grid grid-cols-3 gap-2 text-[8px] uppercase">
                  <div className="p-2 bg-[#0A0A0A] border border-[#222] space-y-1">
                    <span className="text-gray-500 block">Jitter (ms)</span>
                    <input
                      type="range"
                      min={2}
                      max={40}
                      value={simJitter}
                      onChange={(e) => setSimJitter(parseInt(e.target.value))}
                      className="w-full accent-violet-500 h-1 cursor-pointer bg-black"
                    />
                    <span className="text-[#00F0FF] font-bold block mt-1">{simJitter}ms</span>
                  </div>

                  <div className="p-2 bg-[#0A0A0A] border border-[#222] space-y-1">
                    <span className="text-gray-500 block">SLA (%)</span>
                    <input
                      type="range"
                      min={80}
                      max={100}
                      value={simSla}
                      onChange={(e) => setSimSla(parseInt(e.target.value))}
                      className="w-full accent-violet-500 h-1 cursor-pointer bg-black"
                    />
                    <span className="text-[#00F0FF] font-bold block mt-1">{simSla}%</span>
                  </div>

                  <div className="p-2 bg-[#0A0A0A] border border-[#222] space-y-1">
                    <span className="text-gray-500 block">Loss (%)</span>
                    <input
                      type="range"
                      min={0}
                      max={5}
                      step={0.1}
                      value={simPacketLoss}
                      onChange={(e) => setSimPacketLoss(parseFloat(e.target.value))}
                      className="w-full accent-violet-500 h-1 cursor-pointer bg-black"
                    />
                    <span className="text-[#00F0FF] font-bold block mt-1">{simPacketLoss}%</span>
                  </div>
                </div>

                {/* Animated Routing Path visualization */}
                <div className="p-3 bg-[#0c0c0c] border border-violet-500/20 text-[9px] uppercase font-bold space-y-2">
                  <div className="flex justify-between text-gray-500 text-[8px]">
                    <span>ACTIVE EINSTEIN ROUTE PATH:</span>
                    <span className="text-violet-400">REAL-TIME TELEMETRY</span>
                  </div>

                  <div className="flex items-center gap-1.5 py-1">
                    <span className="px-1.5 py-0.5 bg-[#111] border border-[#222] text-white">GATEWAY</span>
                    <ChevronRight size={10} className="text-gray-600" />
                    
                    {simRoutePath.map((node, i) => (
                      <React.Fragment key={i}>
                        <span className={`px-1.5 py-0.5 border ${
                          node === "Bypassed-Jitter-Node" 
                            ? "bg-red-950/20 border-red-500/30 text-red-400" 
                            : "bg-emerald-950/20 border-emerald-500/30 text-emerald-400"
                        }`}>
                          {node.replace("-Alpha", "").replace("-Delta", "").replace("-Bravo", "")}
                        </span>
                        {i < simRoutePath.length - 1 && <ChevronRight size={10} className="text-gray-600" />}
                      </React.Fragment>
                    ))}
                    
                    {simRoutePath.length === 0 && (
                      <span className="text-gray-600 italic">No packet running. Pulse below to check.</span>
                    )}
                  </div>
                </div>

                <button
                  onClick={handlePulseRoute}
                  disabled={isRouting}
                  className="w-full py-2 bg-[#00F0FF]/10 hover:bg-[#00F0FF]/25 border border-[#00F0FF]/40 text-white font-mono uppercase font-black tracking-wider transition-colors cursor-pointer text-center disabled:opacity-50"
                >
                  {isRouting ? "Calculating route weighting..." : "Pulse Test Packet Route"}
                </button>
              </div>
            )}

            {currentSlide === 4 && (
              // SLIDE 5 SANDBOX: VERIFIABLE EVIDENCE ANCHOR - Cryptographic Merkle Block Anchoring
              <div className="space-y-4 animate-fadeIn">
                <p className="text-gray-400 uppercase text-[9px] leading-relaxed font-semibold">
                  Type custom claims and click below to anchor them as a cryptographic block proof on Gnomledger, rebuilding the visual Merkle Tree.
                </p>

                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={anchorInput}
                      onChange={(e) => setAnchorInput(e.target.value)}
                      placeholder="ENTER PERFORMANCE CLAIM..."
                      className="flex-1 bg-[#111] border border-[#222] p-2 text-white font-mono uppercase text-[9px] outline-none focus:border-[#00F0FF]"
                    />
                    <button
                      onClick={handleAnchorClaim}
                      className="px-3 bg-[#00F0FF]/15 hover:bg-[#00F0FF]/30 border border-[#00F0FF]/40 text-[#00F0FF] font-black uppercase text-[9px] transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Plus size={11} />
                      <span>Anchor</span>
                    </button>
                  </div>
                </div>

                {/* Tree block log list */}
                <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1 text-[8.5px] uppercase scrollbar-thin">
                  {merkleTree.map((item, i) => (
                    <div key={item.id} className="p-2 bg-[#0A0A0A] border border-[#1C1C1C] flex justify-between items-center">
                      <div className="space-y-0.5">
                        <span className="text-[#666] font-bold block">CLAIM {i + 1}: {item.claim}</span>
                      </div>
                      <span className="text-[#00F0FF] font-bold tracking-wider">{item.hash}</span>
                    </div>
                  ))}
                </div>

                <div className="p-2.5 bg-violet-950/15 border border-violet-500/20 text-[8.5px] uppercase space-y-0.5">
                  <span className="text-violet-400 font-bold block">GNOMELEDGER MERKLE ROOT HASH:</span>
                  <span className="text-white font-black tracking-wider break-all">{merkleRoot}</span>
                </div>
              </div>
            )}

            {currentSlide === 5 && (
              // SLIDE 6 SANDBOX: ACADEMIC VALIDATION - Simulated Vector Citation search
              <div className="space-y-4 animate-fadeIn">
                <p className="text-gray-400 uppercase text-[9px] leading-relaxed font-semibold">
                  Syllabic search panel keyed to peer-reviewed citations. Type search terms such as "SLA", "M2M", or "Vance" to load verification blocks.
                </p>

                <div className="relative">
                  <input
                    type="text"
                    value={academicSearch}
                    onChange={(e) => setAcademicSearch(e.target.value)}
                    placeholder="Search arXiv / Vance citations... (e.g. Vance, SLA)"
                    className="w-full bg-[#111] border border-[#222] p-2.5 pl-8 text-white font-mono uppercase text-[9px] outline-none focus:border-[#00F0FF]"
                  />
                  <Search size={11} className="text-gray-500 absolute left-2.5 top-3.5" />
                </div>

                {/* Vector Query outputs */}
                <div className="space-y-2 max-h-36 overflow-y-auto text-[8.5px] uppercase scrollbar-thin pr-1">
                  {citationResult.length === 0 ? (
                    <div className="p-3 bg-[#0a0a0a] border border-[#222] text-gray-500 text-center italic">
                      {academicSearch ? "No matched citations found in the M2M grounding repository." : "Type keywords above to query local vector embeddings database."}
                    </div>
                  ) : (
                    citationResult.map((cit, idx) => (
                      <div key={idx} className="p-2.5 bg-[#0A0A0A] border border-[#222] space-y-1">
                        <span className="text-emerald-400 font-bold block">{cit.paper}</span>
                        <p className="text-gray-300 font-medium normal-case leading-relaxed">
                          "{cit.quote}"
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {currentSlide === 6 && (
              // SLIDE 7 SANDBOX: PRICING & REVENUE MODEL - Sliders model
              <div className="space-y-4 animate-fadeIn">
                <p className="text-gray-400 uppercase text-[9px] leading-relaxed font-semibold">
                  Drag the monthly transaction volume slider to model appropriate tiered scaling rates, operator rev-share, and operating margins.
                </p>

                <div className="p-3.5 bg-[#0a0a0a] border border-[#222] space-y-2">
                  <div className="flex justify-between items-center text-white font-bold">
                    <span>MONTHLY TRANSACTIONS:</span>
                    <span className="text-[#00F0FF]">{pricingVolume.toLocaleString()} CHECKS</span>
                  </div>
                  
                  <input
                    type="range"
                    min={10000}
                    max={10000000}
                    step={10000}
                    value={pricingVolume}
                    onChange={(e) => setPricingVolume(parseInt(e.target.value))}
                    className="w-full accent-[#00F0FF] h-1 bg-[#111] cursor-pointer"
                  />

                  <div className="flex justify-between text-[8px] text-gray-500 font-bold uppercase pt-1">
                    <span>10K CHECKS</span>
                    <span>10M CHECKS</span>
                  </div>
                </div>

                <div className="p-3 bg-[#0A0A0A] border border-[#222] space-y-2 font-mono uppercase text-[9px]">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Evaluated Package Tier:</span>
                    <span className="text-white font-bold">{pricingTier}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-[#1a1a1a]">
                    <div className="p-2 bg-black/40 border border-[#222] space-y-0.5">
                      <span className="text-[7.5px] text-gray-500 block">BASE RATE FLOOR</span>
                      <span className="text-white font-black">${pricingStats.pricePerCheck}</span>
                    </div>
                    <div className="p-2 bg-black/40 border border-[#222] space-y-0.5">
                      <span className="text-[7.5px] text-gray-500 block">VOLUME DISCOUNT</span>
                      <span className="text-emerald-400 font-black">{pricingStats.discountApplied}% OFF</span>
                    </div>
                  </div>

                  <div className="border-t border-[#1a1a1a] pt-1.5 space-y-1.5 font-bold">
                    <div className="flex justify-between text-white">
                      <span>Total Invoice Cost:</span>
                      <span>${pricingStats.totalCost} / MO</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Node Licensing share (15%):</span>
                      <span>${pricingStats.licensingShare} / MO</span>
                    </div>
                    <div className="flex justify-between text-[#00F0FF]">
                      <span>Net Operating Profit Margin (85%):</span>
                      <span>${pricingStats.netMargin} / MO</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentSlide === 7 && (
              // SLIDE 8 SANDBOX: ROADMAP & EXECUTION - Clickable Phase Inspector
              <div className="space-y-4 animate-fadeIn">
                <p className="text-gray-400 uppercase text-[9px] leading-relaxed font-semibold">
                  Interact with the four sequential execution cycles. Click each segment to inspect subtask progress meters and key deliverable checklists.
                </p>

                {/* Clickable segment indicators */}
                <div className="grid grid-cols-4 gap-1 text-[8px] font-bold text-center">
                  {[1, 2, 3, 4].map((ph) => (
                    <button
                      key={ph}
                      onClick={() => setActiveRoadmapPhase(ph)}
                      className={`p-2 border uppercase cursor-pointer transition-all ${
                        activeRoadmapPhase === ph
                          ? "bg-[#00F0FF]/15 border-[#00F0FF] text-[#00F0FF]"
                          : "bg-[#0a0a0a] border-[#222] text-gray-500 hover:border-gray-500 hover:text-white"
                      }`}
                    >
                      PHASE 0{ph}
                    </button>
                  ))}
                </div>

                {/* Details view */}
                <div className="p-3.5 bg-[#0A0A0A] border border-[#222] space-y-2.5">
                  {activeRoadmapPhase === 1 && (
                    <div className="space-y-2 animate-fadeIn text-[9px] uppercase">
                      <div className="flex justify-between items-center text-white font-bold">
                        <span>PHASE 1: ABSTRACT SCHEMAS</span>
                        <span className="text-[#00F0FF] font-black">95% COMPLETED</span>
                      </div>
                      <div className="w-full bg-[#111] h-1 border border-[#222]">
                        <div className="bg-[#00F0FF] h-full" style={{ width: "95%" }} />
                      </div>
                      <div className="space-y-1.5 pt-1 text-gray-400">
                        <div className="flex items-center gap-1.5"><Check size={11} className="text-emerald-400" /> <span>Define Capability Descriptors</span></div>
                        <div className="flex items-center gap-1.5"><Check size={11} className="text-emerald-400" /> <span>Unified Router & Lane Specs</span></div>
                        <div className="flex items-center gap-1.5"><Check size={11} className="text-emerald-400" /> <span>Compliance Rule Inheritance</span></div>
                      </div>
                    </div>
                  )}

                  {activeRoadmapPhase === 2 && (
                    <div className="space-y-2 animate-fadeIn text-[9px] uppercase">
                      <div className="flex justify-between items-center text-white font-bold">
                        <span>PHASE 2: SECURE ESCROWS</span>
                        <span className="text-[#00F0FF] font-black">60% COMPLETED</span>
                      </div>
                      <div className="w-full bg-[#111] h-1 border border-[#222]">
                        <div className="bg-[#00F0FF] h-full" style={{ width: "60%" }} />
                      </div>
                      <div className="space-y-1.5 pt-1 text-gray-400">
                        <div className="flex items-center gap-1.5"><Check size={11} className="text-emerald-400" /> <span>Draft X402 Escrow Rules</span></div>
                        <div className="flex items-center gap-1.5"><Check size={11} className="text-emerald-400" /> <span>Anchor Proof Badge models</span></div>
                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 border border-amber-500/30 flex items-center justify-center font-bold text-amber-500 text-[8px] shrink-0">○</div> <span>On-Chain Handshake checks</span></div>
                      </div>
                    </div>
                  )}

                  {activeRoadmapPhase === 3 && (
                    <div className="space-y-2 animate-fadeIn text-[9px] uppercase">
                      <div className="flex justify-between items-center text-white font-bold">
                        <span>PHASE 3: HARDWARE TESTBED</span>
                        <span className="text-amber-400 font-black">15% IN PLAN</span>
                      </div>
                      <div className="w-full bg-[#111] h-1 border border-[#222]">
                        <div className="bg-amber-500 h-full" style={{ width: "15%" }} />
                      </div>
                      <div className="space-y-1.5 pt-1 text-gray-400">
                        <div className="flex items-center gap-1.5"><Check size={11} className="text-emerald-400" /> <span>Procure Seattle Enclave boards</span></div>
                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 border border-gray-700 flex items-center justify-center font-bold text-gray-500 text-[8px] shrink-0">○</div> <span>Local Daemon Node Tunnels</span></div>
                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 border border-gray-700 flex items-center justify-center font-bold text-gray-500 text-[8px] shrink-0">○</div> <span>Gnomeledger Hardware wallet bind</span></div>
                      </div>
                    </div>
                  )}

                  {activeRoadmapPhase === 4 && (
                    <div className="space-y-2 animate-fadeIn text-[9px] uppercase">
                      <div className="flex justify-between items-center text-white font-bold">
                        <span>PHASE 4: SOVEREIGN MAINNET</span>
                        <span className="text-gray-500 font-black">0% PLANNED</span>
                      </div>
                      <div className="w-full bg-[#111] h-1 border border-[#222]">
                        <div className="bg-[#222] h-full" style={{ width: "0%" }} />
                      </div>
                      <div className="space-y-1.5 pt-1 text-gray-400">
                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 border border-gray-700 flex items-center justify-center font-bold text-gray-500 text-[8px] shrink-0">○</div> <span>Deploy isolated enclave sandboxes</span></div>
                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 border border-gray-700 flex items-center justify-center font-bold text-gray-500 text-[8px] shrink-0">○</div> <span>Bilateral node escrow settling</span></div>
                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 border border-gray-700 flex items-center justify-center font-bold text-gray-500 text-[8px] shrink-0">○</div> <span>Mainnet Token liquidity emission</span></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sandbox Footer: informational warning */}
          <div className="p-3 bg-red-950/10 border border-red-500/20 text-[8px] text-red-400 uppercase leading-relaxed font-semibold">
            <div className="flex items-center gap-1 font-black text-red-500 mb-0.5">
              <AlertTriangle size={10} />
              <span>TESTBED BOUNDARY</span>
            </div>
            Sandbox simulations are for architectural modeling only. Run the Test Harness tab to coordinate genuine bilateral node probes.
          </div>

        </div>

      </div>

      {/* Boardroom Presenter Mode Overlay (Theater Mode Portal) */}
      {isTheaterMode && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col justify-between p-6 sm:p-10 font-mono overflow-y-auto animate-fadeIn select-none">
          
          {/* Theater Header controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#222] pb-4 gap-4">
            <div className="flex items-center gap-3">
              <Building className="text-[#00F0FF] animate-pulse" size={20} />
              <div>
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-black block">EXECUTIVE PRESENTATION DECK</span>
                <h4 className="text-sm font-black text-white uppercase tracking-tight">
                  {presenterConsoleMode ? "SPEAKER CONSOLE (DUAL VIEW ACTIVE)" : "AUDIENCE VIEW"}
                </h4>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Toggle Presenter View */}
              <button
                onClick={() => setPresenterConsoleMode(!presenterConsoleMode)}
                className={`px-3 py-1.5 border text-xs font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                  presenterConsoleMode 
                    ? "bg-[#00F0FF]/15 border-[#00F0FF] text-[#00F0FF]" 
                    : "bg-[#111] border-[#222] text-gray-400 hover:text-white"
                }`}
              >
                <Cpu size={13} />
                <span>Presenter Console {presenterConsoleMode ? "ON" : "OFF"}</span>
              </button>

              <button
                onClick={() => setIsTheaterMode(false)}
                className="px-4 py-1.5 bg-red-500/10 hover:bg-red-500/30 border border-red-500/40 text-red-400 hover:text-white text-xs font-bold uppercase transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Minimize2 size={13} />
                <span>Exit Presentation</span>
              </button>
            </div>
          </div>

          {/* Dynamic Dual-View Presenter Console Mode vs Audience View Mode */}
          {presenterConsoleMode ? (
            <div className="my-6 grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 items-stretch">
              
              {/* LEFT COLUMN: WHAT THE AUDIENCE SEES + NEXT SLIDE PREVIEW (col-span-7) */}
              <div className="lg:col-span-7 space-y-6 flex flex-col justify-between">
                
                {/* 1. What Audience Sees Box */}
                <div className="flex-1 bg-[#030303] border-2 border-dashed border-[#00F0FF]/50 p-6 relative flex flex-col justify-between rounded-none min-h-[300px]">
                  <div className="absolute top-2 right-3 text-[8px] bg-[#00F0FF]/10 text-[#00F0FF] px-1.5 py-0.5 border border-[#00F0FF]/20 font-black">
                    WHAT THE AUDIENCE SEES (LIVE SCREEN)
                  </div>

                  <div className="space-y-3 pt-4">
                    <span className="text-[10px] text-[#00F0FF] tracking-widest font-black uppercase">
                      PITCH SLIDE {currentSlide + 1} OF {slides.length} — {slides[currentSlide]?.title}
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase leading-none">
                      {slides[currentSlide]?.title}
                    </h3>
                    <p className="text-xs font-mono text-gray-400 uppercase leading-relaxed max-w-2xl font-semibold">
                      {slides[currentSlide]?.sub}
                    </p>
                  </div>

                  {/* Bullet points summary list inside the live view box */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 pt-4 border-t border-[#1C1C1C]">
                    {slides[currentSlide]?.points.map((pt, i) => (
                      <div key={i} className="p-3 border border-[#1C1C1C] bg-[#0A0A0A] space-y-1 relative">
                        <div className="absolute top-0 left-0 w-[2px] h-full bg-[#00F0FF]" />
                        <span className="text-[10px] text-[#00F0FF] font-black">0{i + 1}.</span>
                        <p className="text-[9px] font-mono text-gray-300 uppercase leading-relaxed font-bold line-clamp-3">
                          {pt}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Next Slide Preview Box */}
                <div className="bg-[#080808] border border-[#222] p-4 relative rounded-none">
                  <div className="absolute top-2 right-3 text-[8px] text-gray-500 font-bold">
                    UPCOMING SLIDE PREVIEW
                  </div>

                  {currentSlide < slides.length - 1 ? (
                    <div className="space-y-1 pt-1">
                      <span className="text-[9px] text-violet-400 tracking-wider font-bold block">
                        UP NEXT: SLIDE {currentSlide + 2} — {slides[currentSlide + 1]?.title}
                      </span>
                      <p className="text-xs font-bold text-gray-400 uppercase line-clamp-1">
                        {slides[currentSlide + 1]?.sub}
                      </p>
                    </div>
                  ) : (
                    <div className="pt-1 text-[9px] text-gray-600 font-bold uppercase italic">
                      [ END OF PRESENTATION DECK ]
                    </div>
                  )}
                </div>

              </div>

              {/* RIGHT COLUMN: SPEAKER TIME, NOTES, AND ALL-SLIDE QUICK JUMPER (col-span-5) */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
                
                {/* 1. Timer stopwatch controls */}
                <div className="bg-[#0A0A0A] border border-[#222] p-4 space-y-3">
                  <div className="flex justify-between items-center text-[10px] text-gray-500 font-bold">
                    <span>SPEAKER RUNTIME MONITOR</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Activity size={10} className="animate-pulse" />
                      <span>LIVE LAP</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-2xl font-black text-white tracking-widest font-mono">
                        {Math.floor(elapsedSeconds / 60).toString().padStart(2, "0")}:{(elapsedSeconds % 60).toString().padStart(2, "0")}
                      </span>
                      <span className="text-[8px] text-gray-500 block uppercase font-bold">ELAPSED TIME (MM:SS)</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setTimerRunning(!timerRunning)}
                        className={`px-2.5 py-1 text-[9px] font-black border uppercase rounded-none transition-all cursor-pointer ${
                          timerRunning 
                            ? "bg-amber-500/10 border-amber-500 text-amber-400" 
                            : "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                        }`}
                      >
                        {timerRunning ? "Pause" : "Resume"}
                      </button>
                      <button
                        onClick={() => setElapsedSeconds(0)}
                        className="px-2.5 py-1 bg-[#111] border border-[#222] text-gray-400 hover:text-white text-[9px] font-bold uppercase rounded-none transition-all cursor-pointer"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. Big Readable Speaker Notes Scrolling area */}
                <div className="flex-1 bg-[#06060c] border border-violet-500/20 p-5 space-y-2.5 flex flex-col justify-between min-h-[160px]">
                  <div className="border-b border-[#1A1A2A] pb-2 flex justify-between items-center text-[10px] font-bold text-violet-400 uppercase">
                    <span className="flex items-center gap-1">
                      <Volume2 size={11} />
                      <span>PRESENTATION GUIDELINES & DISCLOSURE</span>
                    </span>
                    <span className="text-[8px] text-gray-500 font-normal">SCROLLABLE</span>
                  </div>

                  <div className="flex-1 overflow-y-auto pr-1 text-xs text-gray-300 normal-case leading-relaxed font-medium font-semibold space-y-2">
                    <p className="whitespace-pre-line leading-relaxed">
                      {slides[currentSlide]?.notes}
                    </p>
                  </div>
                </div>

                {/* 3. All Slides Quick Navigator Grid */}
                <div className="bg-[#0A0A0A] border border-[#222] p-4 space-y-2">
                  <span className="text-[9px] text-gray-500 font-bold uppercase block">
                    QUICK SLIDE NAVIGATOR (ONE-CLICK JUMP)
                  </span>

                  <div className="grid grid-cols-4 gap-1.5 font-mono text-[9px]">
                    {slides.map((slide, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentSlide(i)}
                        className={`py-2 text-center border font-black uppercase transition-all rounded-none cursor-pointer text-left px-2 flex flex-col justify-between h-11 ${
                          i === currentSlide
                            ? "bg-[#00F0FF] text-black border-[#00F0FF]"
                            : "bg-[#0C0C0C] text-gray-400 border-[#222] hover:border-gray-500 hover:text-white"
                        }`}
                      >
                        <span className="font-bold">0{i + 1}</span>
                        <span className="truncate text-[7px] font-black tracking-tight">{slide.title.slice(0, 10)}</span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          ) : (
            /* STANDARD FULL-SCREEN BOARDROOM/AUDIENCE VIEW MODE */
            <div className="my-8 max-w-5xl mx-auto w-full bg-[#030303] border-4 border-[#222] p-8 sm:p-12 relative aspect-[16/9] min-h-[400px] flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#00F0FF]/5 rounded-full blur-3xl pointer-events-none" />

              <div className="space-y-4 animate-fadeIn">
                <span className="text-xs text-[#00F0FF] tracking-widest font-black uppercase bg-[#00F0FF]/10 px-2 py-1 border border-[#00F0FF]/30 inline-block">
                  BLUEPRINT BRIEFING — PITCH SLIDE {currentSlide + 1} OF {slides.length}
                </span>
                <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight uppercase leading-none">
                  {activeSlide.title}
                </h2>
                <p className="text-sm font-mono text-gray-400 uppercase leading-relaxed max-w-3xl font-semibold">
                  {activeSlide.sub}
                </p>
              </div>

              {/* Oversized list statements */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-[#1C1C1C] animate-fadeIn">
                {activeSlide.points.map((pt, i) => (
                  <div key={i} className="p-5 border border-[#222] bg-[#0A0A0A] space-y-2 relative hover:border-[#444] transition-colors">
                    <div className="absolute top-0 left-0 w-[3px] h-full bg-[#00F0FF]" />
                    <span className="text-sm text-[#00F0FF] font-black font-mono">0{i + 1}.</span>
                    <p className="text-xs font-mono text-gray-300 uppercase leading-relaxed font-bold">
                      {pt}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dual-View Notes Drawer (only shown in standard mode since presenter console has its own persistent notes) */}
          {!presenterConsoleMode && (
            <div className="max-w-5xl mx-auto w-full bg-[#0c0c0c] border border-violet-500/20 p-4 font-mono text-[10px] text-[#8c8cbf] uppercase leading-relaxed space-y-1">
              <div className="flex items-center gap-1.5 text-violet-400 font-bold text-xs">
                <Volume2 size={13} />
                <span>PRESENTER DISCLOSURE RULES</span>
              </div>
              <p className="normal-case text-gray-400 font-semibold leading-relaxed">
                {activeSlide.notes}
              </p>
            </div>
          )}

          {/* Theater Bottom controller bar */}
          <div className="flex justify-between items-center max-w-5xl mx-auto w-full border-t border-[#222] pt-6 mt-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
                disabled={currentSlide === 0}
                className="px-4 py-2 bg-[#0A0A0A] border-2 border-[#222] hover:border-white disabled:opacity-20 disabled:hover:border-[#222] text-white font-mono text-xs font-bold uppercase flex items-center gap-2 cursor-pointer transition-all rounded-none"
              >
                <ArrowLeft size={14} />
                <span>Previous Slide</span>
              </button>

              <div className="px-4 py-2 bg-[#111] border border-[#222] text-xs font-bold font-mono text-gray-400 uppercase">
                Slide <span className="text-[#00F0FF] font-black">{currentSlide + 1}</span> / <span className="text-white">{slides.length}</span>
              </div>

              <button
                onClick={() => setCurrentSlide(prev => Math.min(slides.length - 1, prev + 1))}
                disabled={currentSlide === slides.length - 1}
                className="px-4 py-2 bg-[#0A0A0A] border-2 border-[#222] hover:border-white disabled:opacity-20 disabled:hover:border-[#222] text-white font-mono text-xs font-bold uppercase flex items-center gap-2 cursor-pointer transition-all rounded-none"
              >
                <span>Next Slide</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <div className="text-[10px] text-gray-600 font-bold uppercase hidden sm:block">
              Tip: Use Left/Right arrow keys to navigate. Esc to exit.
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
