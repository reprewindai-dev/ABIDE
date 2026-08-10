import { test, expect } from "vitest";
import { classifySentiment } from "../src/classify";
test("classifies positive sentiment", () => { expect(classifySentiment("I love this app")).toBe("POSITIVE"); });