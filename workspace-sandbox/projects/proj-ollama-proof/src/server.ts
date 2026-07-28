import express from "express";
import { z } from "zod";
import { runOllamaClassification } from "./ollama";

const app = express();
app.use(express.json());

const ClassifyRequestSchema = z.object({
  text: z.string().min(1, "Input text is required"),
  model: z.string().optional().default("qwen2.5:3b")
});

app.post("/api/classify", async (req, res) => {
  try {
    const parsed = ClassifyRequestSchema.parse(req.body);
    const startTime = Date.now();
    const result = await runOllamaClassification(parsed.text, parsed.model);
    
    return res.json({
      success: true,
      classification: result.category,
      confidence: result.confidence,
      modelUsed: parsed.model,
      latencyMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      proofSeal: "abide-proof-seal-001"
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message || "Classification failed" });
  }
});

export { app };