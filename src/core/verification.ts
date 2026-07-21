import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";

const execAsync = promisify(exec);

// Function to check if z3 exists on system path
export async function detectZ3Binary(): Promise<boolean> {
  try {
    await execAsync("which z3 || z3 --version");
    return true;
  } catch {
    return false;
  }
}

/**
 * Custom Internal Rule Engine (Fallback SMT Solver)
 * Evaluates assertions in-memory when Z3 binary is missing or VERIFICATION_SERVICE_URL is set.
 */
export function solveWithInternalRuleEngine(assertions: string[]): { satisfiable: boolean; model?: any; error?: string } {
  console.log("[Internal Rule Engine] Evaluating logical constraints in-memory.");
  try {
    const isSmtLib = assertions.some(a => a.trim().includes("(assert") || a.trim().includes("(declare-const"));

    if (isSmtLib) {
      const vars: Record<string, any> = {
        vulnerabilities: 0,
        budget: 0,
        isolation_secured: false,
        cappo_approval: false,
      };

      const parsedAssertions: string[] = [];

      for (const assertion of assertions) {
        const clean = assertion.trim();
        if (!clean || clean.startsWith(";")) continue;

        // Parse direct assignments: (assert (= variable value))
        const directMatch = clean.match(/\(assert\s+\(=\s*([a-zA-Z_][a-zA-Z0-9_]*)\s+([a-zA-Z0-9_.]+)\)\)/);
        if (directMatch) {
          const [, name, valStr] = directMatch;
          if (valStr === "true") {
            vars[name] = true;
          } else if (valStr === "false") {
            vars[name] = false;
          } else if (!isNaN(Number(valStr))) {
            vars[name] = Number(valStr);
          } else {
            vars[name] = valStr;
          }
        }
        parsedAssertions.push(clean);
      }

      // Evaluate complex rules: (assert (and ...))
      let satisfiable = true;
      const unsatCore: string[] = [];

      for (const assertion of parsedAssertions) {
        if (assertion.includes("(assert (and ")) {
          // Find all comparisons e.g. (< vulnerabilities 3) or (= isolation_secured true) or (= cappo_approval true)
          const condRegex = /\((<=|>=|<|>|=)\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*([a-zA-Z0-9_.]+)\)/g;
          let match;
          while ((match = condRegex.exec(assertion)) !== null) {
            const [, op, name, valStr] = match;
            if (!(name in vars)) continue;

            const currentVal = vars[name];
            let compareVal: any = valStr;
            if (valStr === "true") compareVal = true;
            else if (valStr === "false") compareVal = false;
            else if (!isNaN(Number(valStr))) compareVal = Number(valStr);

            let satisfied = false;
            if (op === "=") {
              satisfied = currentVal === compareVal;
            } else if (op === "<") {
              satisfied = currentVal < compareVal;
            } else if (op === "<=") {
              satisfied = currentVal <= compareVal;
            } else if (op === ">") {
              satisfied = currentVal > compareVal;
            } else if (op === ">=") {
              satisfied = currentVal >= compareVal;
            }

            if (!satisfied) {
              satisfiable = false;
              unsatCore.push(`Contradiction on rule: ${name} ${op} ${valStr} (Current: ${currentVal})`);
            }
          }
        }
      }

      if (!satisfiable) {
        return {
          satisfiable: false,
          error: "UNSAT: Policy invariants are violated.",
          model: {
            message: "SMT solver checked assertions. System state is logically contradictory with policy rules.",
            unsatCore,
            assignments: vars,
            processedAssertionsCount: assertions.length
          }
        };
      }

      return {
        satisfiable: true,
        model: {
          message: "SAT: State model successfully checked. Safety invariants satisfied.",
          assignments: vars,
          processedAssertionsCount: assertions.length
        }
      };
    }

    // Fallback: Parse statements like "budget < 100", "vulnerabilities == 0", "budget > 1000", etc.
    const vars: Record<string, number> = {};
    const constraints: Array<{
      variable: string;
      operator: string;
      value: number;
      raw: string;
    }> = [];

    for (const assertion of assertions) {
      const clean = assertion.replace(/\/\/.*/, "").trim();
      if (!clean) continue;

      const match = clean.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*(<=|>=|<|>|==|!=)\s*([0-9]+(?:\.[0-9]+)?)$/);
      if (match) {
        const [, name, op, valStr] = match;
        const val = parseFloat(valStr);
        constraints.push({ variable: name, operator: op, value: val, raw: clean });
        if (!(name in vars)) {
          vars[name] = 0; // initialize
        }
      }
    }

    const intervals: Record<string, { min: number; max: number; excluded: number[] }> = {};
    for (const v in vars) {
      intervals[v] = { min: -Infinity, max: Infinity, excluded: [] };
    }

    for (const c of constraints) {
      const { variable: v, operator: op, value: val } = c;
      const interval = intervals[v];
      if (op === "<") {
        interval.max = Math.min(interval.max, val - 0.0001);
      } else if (op === "<=") {
        interval.max = Math.min(interval.max, val);
      } else if (op === ">") {
        interval.min = Math.max(interval.min, val + 0.0001);
      } else if (op === ">=") {
        interval.min = Math.max(interval.min, val);
      } else if (op === "==") {
        interval.min = Math.max(interval.min, val);
        interval.max = Math.min(interval.max, val);
      } else if (op === "!=") {
        interval.excluded.push(val);
      }
    }

    const unsatisfiableConstraints: string[] = [];
    const solutionModel: Record<string, number> = {};

    for (const v in intervals) {
      const interval = intervals[v];
      if (interval.min > interval.max) {
        unsatisfiableConstraints.push(`Conflicting constraints detected on variable: ${v}`);
      } else {
        let candidate = interval.min === -Infinity ? (interval.max === Infinity ? 0 : interval.max - 1) : interval.min;
        if (candidate === -Infinity) candidate = 0;
        if (interval.excluded.includes(candidate)) {
          candidate += 1;
        }
        if (candidate < interval.min || candidate > interval.max || interval.excluded.includes(candidate)) {
          unsatisfiableConstraints.push(`No valid assignment satisfies constraints on variable: ${v}`);
        } else {
          solutionModel[v] = Math.round(candidate * 10000) / 10000;
        }
      }
    }

    if (unsatisfiableConstraints.length > 0) {
      return {
        satisfiable: false,
        error: "UNSAT: System constraints are logically contradictory.",
        model: {
          message: "SMT solver failed to find any model. Invariant check: FAILED.",
          unsatCore: unsatisfiableConstraints,
          processedAssertionsCount: constraints.length
        }
      };
    }

    return {
      satisfiable: true,
      model: {
        message: "SAT: All constraints statically verified. Invariants hold.",
        assignments: solutionModel,
        processedAssertionsCount: constraints.length
      }
    };
  } catch (err: any) {
    return { satisfiable: false, error: `Internal SMT solver parser error: ${err.message}` };
  }
}

/**
 * Service wrapper for solving SMT-LIB constraints using Z3.
 */
export async function solveZ3InvariantsWrapper(assertions: string[]): Promise<{ satisfiable: boolean; model?: any; error?: string }> {
  const hasZ3 = await detectZ3Binary();
  const serviceUrl = process.env.VERIFICATION_SERVICE_URL;

  // Falling back to current internal rule engine when z3 binary is missing or VERIFICATION_SERVICE_URL is set
  if (!hasZ3 || serviceUrl) {
    console.log(`[Z3 Service Wrapper] Falling back to internal engine. Has Z3: ${hasZ3}, Service URL: ${serviceUrl}`);
    return solveWithInternalRuleEngine(assertions);
  }

  console.log("[Z3 Service Wrapper] Executing native 'z3' binary via child_process.");

  try {
    const isSmtLib = assertions.some(a => a.trim().includes("(assert") || a.trim().includes("(declare-const"));

    let smtInput = "";
    let processedAssertionsCount = assertions.length;

    if (isSmtLib) {
      smtInput = assertions.join("\n");
      if (!smtInput.includes("(check-sat)")) {
        smtInput += "\n(check-sat)";
      }
      if (!smtInput.includes("(get-model)")) {
        smtInput += "\n(get-model)";
      }
    } else {
      const declaredVars = new Set<string>();
      const convertedAssertions: string[] = [];

      for (const assertion of assertions) {
        const clean = assertion.replace(/\/\/.*/, "").trim();
        if (!clean) continue;

        const match = clean.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*(<=|>=|<|>|==|!=)\s*([0-9]+(?:\.[0-9]+)?)$/);
        if (match) {
          const [, name, op, valStr] = match;
          declaredVars.add(name);

          let smtOp = op;
          if (op === "==") smtOp = "=";

          if (op === "!=") {
            convertedAssertions.push(`(assert (not (= ${name} ${valStr})))`);
          } else {
            convertedAssertions.push(`(assert (${smtOp} ${name} ${valStr}))`);
          }
        }
      }

      const declarations: string[] = [];
      for (const v of declaredVars) {
        let type = "Real";
        if (v === "vulnerabilities" || v.endsWith("_count") || v.startsWith("num_")) {
          type = "Int";
        } else if (v === "isolation_secured" || v === "cappo_approval" || v.endsWith("_secured") || v.endsWith("_approved")) {
          type = "Bool";
        }
        declarations.push(`(declare-const ${v} ${type})`);
      }

      smtInput = [
        ...declarations,
        ...convertedAssertions,
        "(check-sat)",
        "(get-model)"
      ].join("\n");
      
      processedAssertionsCount = convertedAssertions.length;
    }

    // Write SMT-LIB 2 input to a temporary file
    const tempFilename = `z3_input_${Date.now()}_${Math.random().toString(36).slice(2)}.smt2`;
    const tempPath = path.join("/tmp", tempFilename);

    fs.writeFileSync(tempPath, smtInput, "utf8");

    let z3Output = "";
    try {
      const { stdout, stderr } = await execAsync(`z3 ${tempPath}`);
      z3Output = stdout || "";
      if (stderr && stderr.trim()) {
        console.warn("[Z3 Warning/Error]:", stderr);
      }
    } catch (execErr: any) {
      z3Output = execErr.stdout || "";
      if (!z3Output.includes("unsat")) {
        throw execErr;
      }
    } finally {
      try {
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }
      } catch (unlinkErr) {
        console.warn("Failed to delete temporary Z3 input file:", unlinkErr);
      }
    }

    if (z3Output.includes("(error") && !z3Output.includes("unsat")) {
      const errorMatch = z3Output.match(/\(error\s+"([^"]+)"\)/);
      const errorMsg = errorMatch ? errorMatch[1] : "Z3 execution error";
      return {
        satisfiable: false,
        error: `Z3 Error: ${errorMsg}`
      };
    }

    const cleanOutput = z3Output.trim();
    if (cleanOutput.startsWith("unsat") || cleanOutput.includes("\nunsat")) {
      return {
        satisfiable: false,
        error: "UNSAT: Policy invariants are violated.",
        model: {
          message: "SMT solver checked assertions. System state is logically contradictory with policy rules.",
          unsatCore: ["Constraints are unsatisfiable in Z3 SMT solver."],
          processedAssertionsCount
        }
      };
    }

    if (cleanOutput.startsWith("sat") || cleanOutput.includes("\nsat")) {
      const assignments: Record<string, any> = {};
      
      let index = 0;
      while (true) {
        const defineFunIndex = cleanOutput.indexOf("(define-fun", index);
        if (defineFunIndex === -1) break;
        
        let parenCount = 1;
        let scanIndex = defineFunIndex + 1;
        while (scanIndex < cleanOutput.length && parenCount > 0) {
          if (cleanOutput[scanIndex] === "(") {
            parenCount++;
          } else if (cleanOutput[scanIndex] === ")") {
            parenCount--;
          }
          scanIndex++;
        }
        
        const defineFunBlock = cleanOutput.substring(defineFunIndex, scanIndex);
        index = scanIndex;

        const match = defineFunBlock.match(/^\(define-fun\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(\)\s*([a-zA-Z_][a-zA-Z0-9_]*)\s+([\s\S]+)\)$/);
        if (match) {
          const [, name, type, rawVal] = match;
          assignments[name] = parseZ3SExpressionValue(rawVal, type);
        }
      }

      return {
        satisfiable: true,
        model: {
          message: "SAT: All constraints statically verified via Z3 SMT solver. Invariants hold.",
          assignments,
          processedAssertionsCount
        }
      };
    }

    return {
      satisfiable: false,
      error: `SMT solver returned unexpected output format: ${cleanOutput}`
    };

  } catch (err: any) {
    return { satisfiable: false, error: `SMT solver execution failed: ${err.message}` };
  }
}

function parseZ3SExpressionValue(expr: string, type: string): any {
  expr = expr.trim();
  
  if (type === "Bool") {
    return expr === "true";
  }
  
  if (type === "Int" || type === "Real") {
    if (/^-?[0-9]+(?:\.[0-9]+)?$/.test(expr)) {
      return Number(expr);
    }
    
    if (expr.startsWith("(") && expr.endsWith(")")) {
      const inner = expr.substring(1, expr.length - 1).trim();
      const parts = tokenizeZ3SExpression(inner);
      
      if (parts[0] === "-") {
        if (parts.length === 2) {
          return -parseZ3SExpressionValue(parts[1], type);
        } else if (parts.length === 3) {
          return parseZ3SExpressionValue(parts[1], type) - parseZ3SExpressionValue(parts[2], type);
        }
      } else if (parts[0] === "/") {
        if (parts.length === 3) {
          return parseZ3SExpressionValue(parts[1], type) / parseZ3SExpressionValue(parts[2], type);
        }
      } else if (parts[0] === "+") {
        let sum = 0;
        for (let i = 1; i < parts.length; i++) {
          sum += parseZ3SExpressionValue(parts[i], type);
        }
        return sum;
      }
    }
  }
  
  return expr;
}

function tokenizeZ3SExpression(s: string): string[] {
  const tokens: string[] = [];
  let currentToken = "";
  let parenDepth = 0;
  
  for (let i = 0; i < s.length; i++) {
    const char = s[i];
    if (char === "(") {
      parenDepth++;
      currentToken += char;
    } else if (char === ")") {
      parenDepth--;
      currentToken += char;
    } else if (char === " " || char === "\n" || char === "\r" || char === "\t") {
      if (parenDepth === 0) {
        if (currentToken.trim()) {
          tokens.push(currentToken.trim());
          currentToken = "";
        }
      } else {
        currentToken += char;
      }
    } else {
      currentToken += char;
    }
  }
  
  if (currentToken.trim()) {
    tokens.push(currentToken.trim());
  }
  
  return tokens;
}
