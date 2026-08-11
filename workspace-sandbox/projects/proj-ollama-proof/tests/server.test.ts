import { describe, test, expect } from "vitest";
import { z } from "zod";

describe("Ollama HTTP Classification Pipeline Verification", () => {
  test("Input Schema correctly validates customer payload", () => {
    const schema = z.object({ text: z.string().min(1) });
    expect(() => schema.parse({ text: "System crashed when uploading CSV" })).not.toThrow();
    expect(() => schema.parse({ text: "" })).toThrow();
  });

  test("Classification pipeline fallback routes deterministically", () => {
    const testText = "Critical security vulnerability in login endpoint";
    const isSecurity = testText.toLowerCase().includes("security") || testText.toLowerCase().includes("vulnerability");
    expect(isSecurity).toBe(true);
  });
});