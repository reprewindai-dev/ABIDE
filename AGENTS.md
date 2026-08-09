# AGENTS.md — READ FIRST

Before any work, read [`00_VEKLOM_BIBLE.md`](./00_VEKLOM_BIBLE.md).

ABIDE is both a standalone blueprint product and a reusable Veklom blueprint/contract capability domain. Inside Capability OS, reuse the capability and build a Veklom-native surface; do not embed the standalone product wholesale.

Repo-local source and tests govern implementation details only when they do not conflict with current runtime evidence or the Bible. Use Coolify UI/API/MCP for Coolify management; SSH is for direct host/container verification or operations. Never allocate host ports from memory; host `8000` is currently Coolify-owned.
