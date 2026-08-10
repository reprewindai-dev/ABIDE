import { test, expect } from "vitest";
import { scanForSecrets } from "../src/scanner";
test("detects exposed secrets", () => { expect(scanForSecrets("const k = 'sk_live_123';").length).toBe(1); });