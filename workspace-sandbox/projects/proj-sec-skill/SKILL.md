---
name: security-review-agent-skill
description: Scans project source files for hardcoded secrets, SQL injection vectors, and missing auth headers before deployment.
---

# Security Review Agent Skill

When triggered before deployment, execute the following inspection checklist:
1. Scan all `.ts` and `.tsx` files for strings matching `sk_`, `secret_`, or `password =`.
2. Verify that all HTTP endpoints enforce `Authorization` or `X-Veklom-Connection-Id` headers.
3. Assert that no raw SQL concatenation occurs in database adapters.
