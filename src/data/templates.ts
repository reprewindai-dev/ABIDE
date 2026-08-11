import { ExampleTemplate } from "../types";

export const TEMPLATES: ExampleTemplate[] = [
  {
    name: "Autonomous M2M Scooter Fleet",
    description: "Electric micro-mobility units with automated solar re-charging via X402 payment settlements.",
    icon: "Coins",
    targetPlatform: "React Native + Embedded Rust Node",
    notes: `I want to build a fleet of self-driving electric scooters. 
They should pay for their own charging at automated solar charging stations using smart contract wallets. 
Riders are charged per minute. When battery goes below 20%, the scooter automatically updates its routing to navigate to a solar pad, or hires an autonomous mobile charging drone.
We need secure machine-to-machine payments.
Cross-border settlements should happen instantly without traditional payment processing delays.
The core vision is that "API is not the product; the scooter's autonomous charging and transport capability is the product."`,
    codebaseContext: `// Target scooter hardware loop
struct ScooterState {
    id: String,
    battery_level: f32,
    wallet_balance: u64, // micro-satoshis
    is_rented: bool,
    coordinates: (f64, f64),
}

impl ScooterState {
    fn check_charge_and_hire(&mut self) -> Result<(), PaymentError> {
        if self.battery_level < 20.0 {
            // Initiate X402 automated smart contract call to lock solar charger
            let solar_station_id = "STATION_992_CALI";
            self.lock_and_pay_solar(solar_station_id, 5000)?;
        }
        Ok(())
    }
}`
  },
  {
    name: "Sovereign Distributed Edge CDN",
    description: "Encrypted community web caches rewarded in real-time micro-payments per megabyte served.",
    icon: "Globe",
    targetPlatform: "Go / Rust Node + Web Dashboard",
    notes: `A content delivery network where individuals can host edge nodes on a Raspberry Pi or old server.
Nodes are paid in real-time micro-payments for every megabyte of static content they serve.
Need robust cryptography so that edge node operators cannot peek into cached user-sensitive payload data (strict sovereignty).
Automatic zero-knowledge verification to prove bandwidth was actually delivered without letting node falsify traffic.
Optimized throughput using X402 distributed ledgers to settle million-scale global micropayments instantly.`,
    codebaseContext: `// Edge server proxy routine
async fn serve_block(block_id: Hash, client_key: PublicKey) -> Result<Bytes, CDNError> {
    // 1. Verify user paid micropayment transaction ID
    let is_settled = x402::verify_micropayment(client_key, block_id, 100).await?;
    if !is_settled {
        return Err(CDNError::PaymentRequired);
    }
    // 2. Fetch encrypted block from local disk cache
    let data = storage::read_encrypted_block(block_id).await?;
    Ok(data)
}`
  },
  {
    name: "Vitals-Adaptive AI Tutoring SaaS",
    description: "An AI-powered programming instructor that monitors engagement and adapts teaching speed.",
    icon: "Sparkles",
    targetPlatform: "Next.js Web App + Python Fast-API",
    notes: `An AI-powered tutor that teaches engineering. 
It analyzes the user's focus, attention level, and frustration index by reading heart rate and pulse wave parameters via a companion smartwatch API.
It dynamically slows down lessons when high frustration is detected, or jumps ahead when focus is perfect.
Students pay micro-fees per educational prompt successfully answered.
We must secure our intellectual property so competitors cannot replicate our probability-based tutor adaptive model, using cryptographic creation certification.`,
    codebaseContext: `// Vitals receiver controller
@app.post("/api/vitals")
async def analyze_vitals(heart_rate: int, HRV: float, student_id: str):
    # Calculate cognitive load using Einstein frequency analysis
    cognitive_load = calc_cognitive_load(heart_rate, HRV)
    if cognitive_load > 0.85:
        # Trigger adaptive slowdown protocol
        return {"action": "SLOW_LESSON", "explanation": "Frustration spike detected. Recalibrating module speed."}
    return {"action": "MAINTAIN_PACE"}
`
  }
];
