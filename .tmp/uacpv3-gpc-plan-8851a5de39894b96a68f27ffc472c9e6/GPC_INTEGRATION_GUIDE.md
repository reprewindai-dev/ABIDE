"""
GPC INTEGRATION & DEPLOYMENT GUIDE
Generative Pipeline Compiler — Production Integration
Phase 2 Completion → Phase 3 Preparation

OVERVIEW
========
This guide integrates the GPC system into veklom-byos-backend and veklom-control-plane.

PHASE 2 COMPLETE: All code modules generated.
PHASE 3 START: Deploy into production, run compliance suite, monitor.

"""

# ============================================================================
# PART 1: BACKEND INTEGRATION (veklom-byos-backend)
# ============================================================================

## Step 1.1: Add Python dependencies to pyproject.toml

pyproject.toml additions:
```toml
[tool.poetry.dependencies]
pydantic = "^2.0"
pydantic-settings = "^2.0"
fastapi = "^0.104"
uvicorn = "^0.24"
graphlib = "*"  # stdlib in Python 3.9+
astor = "^0.8"  # for AST unparse fallback (Python < 3.9)
instructor = "^0.4"  # for LLM structured output (optional, for production AI)
vllm = "^0.4"  # for local inference (optional, replace with Claude API)
```

Run: `poetry install`

## Step 1.2: Add GPC schemas to backend

Files to add to `backend/gpc/`:
- `schemas.py` ← use gpc_schemas.py (rename and place)
- `compiler.py` ← use gpc_compiler.py
- `__init__.py` ← empty

```bash
mkdir -p veklom-byos-backend/backend/gpc
cp gpc_schemas.py veklom-byos-backend/backend/gpc/schemas.py
cp gpc_compiler.py veklom-byos-backend/backend/gpc/compiler.py
touch veklom-byos-backend/backend/gpc/__init__.py
```

## Step 1.3: Add GPC routes to FastAPI app

File: `backend/apps/gpc/routes.py` ← use gpc_routes.py

```python
# In backend/main.py or backend/app.py, register the router:

from backend.apps.gpc import router as gpc_router

app.include_router(gpc_router)
```

## Step 1.4: Create GPC database models (optional, for audit trail)

File: `backend/db/models/gpc.py`

```python
from sqlalchemy import Column, String, JSON, DateTime, Float, Integer
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class GpcPipelineAudit(Base):
    """
    Audit log for pipeline executions (Law 25 Section 93 compliance).
    """
    __tablename__ = "gpc_audit"

    trace_id = Column(String, primary_key=True)
    tenant_id = Column(String, index=True)
    pipeline_id = Column(String, index=True)
    user_id = Column(String, index=True)
    execution_status = Column(String)  # running, success, failure, partial
    node_id = Column(String, nullable=True)
    node_index = Column(Integer, nullable=True)
    
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    duration_ms = Column(Float)
    
    data_residency_region = Column(String)
    rows_processed = Column(Integer, nullable=True)
    tokens_consumed = Column(Integer, nullable=True)
    
    schema_version = Column(String)
    prompt_version = Column(String, nullable=True)
    error_details = Column(String, nullable=True)
    compliance_checks = Column(JSON, default={})
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
```

Run migration:
```bash
alembic revision --autogenerate -m "Add GPC audit tables"
alembic upgrade head
```

## Step 1.5: Test backend endpoints

```bash
# Start backend
uvicorn backend.main:app --reload

# Test compile endpoint
curl -X POST http://localhost:8000/api/v1/gpc/compile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test_token" \
  -d '{
    "pipeline_id": "test_pipeline",
    "tenant_id": "test_tenant"
  }'

# Should return: compilation result with python_code, execution_order, etc.
```

# ============================================================================
# PART 2: FRONTEND INTEGRATION (veklom-control-plane)
# ============================================================================

## Step 2.1: Add TypeScript dependencies

File: `package.json`

```json
{
  "dependencies": {
    "reactflow": "^11.10",
    "zustand": "^4.4",
    "@glideapps/glide-data-grid": "^6.0",
    "lucide-react": "^0.263"
  }
}
```

Run: `npm install`

## Step 2.2: Add type definitions and stores

Files to add to `lib/gpc/`:
- `stores.ts` ← use gpc_stores.ts
- `useGpc.ts` ← use useGpc.ts

```bash
mkdir -p veklom-control-plane/lib/gpc
cp gpc_stores.ts veklom-control-plane/lib/gpc/stores.ts
cp useGpc.ts veklom-control-plane/lib/gpc/useGpc.ts
```

Add types:
```bash
cp gpc_types.ts veklom-control-plane/types/gpc.ts
```

## Step 2.3: Add canvas components

Files to add to `components/gpc/`:
- `GpcCanvas.tsx` ← use GpcCanvas.tsx

```bash
mkdir -p veklom-control-plane/components/gpc
cp GpcCanvas.tsx veklom-control-plane/components/gpc/GpcCanvas.tsx
```

## Step 2.4: Update GPC page

Replace: `app/gpc/page.tsx` ← use gpc_page.tsx

```bash
cp gpc_page.tsx veklom-control-plane/app/gpc/page.tsx
```

## Step 2.5: Test frontend

```bash
# Start dev server
npm run dev

# Navigate to http://localhost:3000/gpc

# Expected:
# - Canvas renders with toolbar
# - "Generate from Intent" button works
# - Canvas responds to drag/select
# - Compile button shows modal with Python code
```

# ============================================================================
# PART 3: COMPLIANCE & PRODUCTION CHECKLIST
# ============================================================================

## 3.1: Canadian Sovereignty Checklist (Law 25 Section 93)

Requirement: All pipeline executions must audit trail for Quebec PIA.

- [ ] `PipelineExecutionTrace` model added to database
- [ ] All execution paths call `log_execution_trace()`
- [ ] Audit logs quereable by tenant_id, pipeline_id, user_id
- [ ] Data residency region enforced (ca-central-1 / ca-west-1 / on-premise only)
- [ ] No US API keys available in Quebec-regulated routing profile
- [ ] Encryption at rest for audit logs

## 3.2: Performance Checklist

- [ ] Canvas renders 200+ nodes without frame drop (60fps)
- [ ] Zustand stores decoupled (execution updates don't re-render canvas)
- [ ] All custom components wrapped in React.memo
- [ ] Shallow selectors used for state subscriptions
- [ ] Compilation time < 5s for 50-node pipeline
- [ ] Execution streaming via SSE (progressive updates, not blocking)

## 3.3: Security Checklist

- [ ] Bearer token validation on all endpoints
- [ ] Tenant isolation enforced (tenant_id in JWT)
- [ ] AST compilation never calls eval() or exec()
- [ ] Execution sandbox isolates tenants (separate processes)
- [ ] Secrets/API keys never logged
- [ ] CORS properly configured

## 3.4: Testing Checklist

Unit tests:
```bash
# Backend compiler tests
pytest backend/tests/test_gpc_compiler.py

# Should test:
# - Topological sort (cycle detection)
# - Port type compatibility
# - AST generation (verify Python is syntactically valid)
# - Incremental execution (lastUpdated check)
```

Integration tests:
```bash
# E2E pipeline flow
pytest backend/tests/test_gpc_e2e.py

# Should test:
# - NL intent → graph generation
# - Graph → Python compilation
# - Python execution in sandbox
# - Audit trail logged
```

## 3.5: Monitoring & Observability

Add metrics to `/api/v1/gpc/stats`:
- plans_total (counter)
- runs_total (counter)
- compile_time_ms (histogram)
- execution_time_ms (histogram)
- success_rate (gauge)

Example Prometheus/DataDog scrape:
```
# HELP gpc_plans_total Total pipelines compiled
# TYPE gpc_plans_total counter
gpc_plans_total{tenant_id="tenant_123"} 42

# HELP gpc_execution_time_ms Pipeline execution time
# TYPE gpc_execution_time_ms histogram
gpc_execution_time_ms_bucket{le="1000", tenant_id="tenant_123"} 10
```

# ============================================================================
# PART 4: LLM INTEGRATION (NL→Graph Generation)
# ============================================================================

Production uses:
A) Claude API (Anthropic, managed service)
B) vLLM self-hosted (open-source, on-premise)

## Option A: Claude API (Recommended for Veklom)

Update `gpc_routes.py` NL-to-graph endpoint:

```python
import anthropic
from gpc_schemas import GPCPipelineGraph

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

async def generate_pipeline_from_intent(request: NLToGraphRequest) -> NLToGraphResult:
    prompt = f"""
You are an expert data engineer. Convert this intent into a deterministic pipeline graph.

INTENT:
{request.user_intent}

AVAILABLE COMPONENTS:
- CsvFileInput, ParquetInput, JsonInput
- FilterRows, SelectColumns, Aggregate, Join, Union
- DuckDBQuery
- ParquetOutput, CsvOutput, JsonOutput

Respond with ONLY a JSON object matching this schema:
{{
  "nodes": [
    {{"id": "node_0", "node_type": "CsvFileInput", "label": "Load CSV", ...}},
    ...
  ],
  "edges": [
    {{"id": "edge_0", "source_node_id": "node_0", "target_node_id": "node_1", ...}},
    ...
  ],
  "reasoning": "Why you structured the pipeline this way"
}}
"""

    response = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=2000,
        messages=[{"role": "user", "content": prompt}],
    )
    
    # Parse response as GPCPipelineGraph
    # Validate against Pydantic schema
    # Retry if validation fails (max 2 retries)
```

## Option B: vLLM Self-Hosted

```python
from vllm import LLM, SamplingParams
from xgrammar import StringToJSONGrammar

llm = LLM(model="meta-llama/Llama-2-7b-hf", tensor_parallel_size=4)
sampling_params = SamplingParams(temperature=0.7, top_p=0.9)

# Use xgrammar for constrained decoding to GPCPipelineGraph JSON schema
grammar = StringToJSONGrammar(GPCPipelineGraph.model_json_schema())

response = llm.generate(
    prompts=[nl_intent],
    sampling_params=sampling_params,
    logits_processors=[grammar],
)
```

# ============================================================================
# PART 5: DEPLOYMENT (Docker + Kubernetes)
# ============================================================================

## Docker build (veklom-byos-backend)

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY pyproject.toml poetry.lock ./
RUN pip install poetry && poetry install

COPY backend ./backend

EXPOSE 8000
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Docker build (veklom-control-plane)

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "start"]
```

## Kubernetes deployment

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: veklom-gpc

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: gpc-backend
  namespace: veklom-gpc
spec:
  replicas: 3
  selector:
    matchLabels:
      app: gpc-backend
  template:
    metadata:
      labels:
        app: gpc-backend
    spec:
      containers:
      - name: backend
        image: veklom/gpc-backend:1.0.0
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: gpc-secrets
              key: database_url
        - name: ANTHROPIC_API_KEY
          valueFrom:
            secretKeyRef:
              name: gpc-secrets
              key: anthropic_api_key
        resources:
          requests:
            cpu: "500m"
            memory: "512Mi"
          limits:
            cpu: "2"
            memory: "2Gi"

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: gpc-frontend
  namespace: veklom-gpc
spec:
  replicas: 2
  selector:
    matchLabels:
      app: gpc-frontend
  template:
    metadata:
      labels:
        app: gpc-frontend
    spec:
      containers:
      - name: frontend
        image: veklom/gpc-frontend:1.0.0
        ports:
        - containerPort: 3000
        env:
        - name: NEXT_PUBLIC_API_URL
          value: "https://api.veklom.com"

---
apiVersion: v1
kind: Service
metadata:
  name: gpc-backend
  namespace: veklom-gpc
spec:
  selector:
    app: gpc-backend
  ports:
  - port: 8000
    targetPort: 8000
  type: ClusterIP

---
apiVersion: v1
kind: Service
metadata:
  name: gpc-frontend
  namespace: veklom-gpc
spec:
  selector:
    app: gpc-frontend
  ports:
  - port: 3000
    targetPort: 3000
  type: LoadBalancer
```

# ============================================================================
# PART 6: GO-LIVE CHECKLIST
# ============================================================================

48 hours before go-live:

- [ ] All tests passing (unit + integration + E2E)
- [ ] Load testing: 100 concurrent pipelines, 200 nodes each
- [ ] Compliance audit: Law 25 Section 93 PIA completed
- [ ] Security scan: OWASP top 10, no high/critical vulns
- [ ] Performance baseline: compile < 5s, execute < 30s (50 nodes)
- [ ] Monitoring/alerting configured (Prometheus + Datadog)
- [ ] Runbook documented (incident response)
- [ ] Rollback plan documented

24 hours before go-live:

- [ ] Dry-run cutover with staging data
- [ ] Backup strategy tested
- [ ] All stakeholders notified
- [ ] Support team trained

Post go-live (Week 1):

- [ ] Monitor error rates, latency, CPU
- [ ] Weekly compliance audit
- [ ] Gather user feedback
- [ ] Plan for Phase 3 optimizations (Module Federation, HITL checkpoints)

# ============================================================================
# SUCCESS CRITERIA FOR PHASE 2
# ============================================================================

✅ COMPLETE when:

1. Canvas renders pipelines with full node/edge editing
2. Compile endpoint generates syntactically correct Python
3. Execute endpoint streams node completion events via SSE
4. NL-to-graph generates pipelines from intent (mock or Claude)
5. All audit events logged to database (Law 25 compliance)
6. Performance: 200-node canvas at 60fps, compile < 5s
7. Security: JWT auth, tenant isolation, AST-only code gen
8. Tests: 85%+ coverage on compiler, 70%+ on routes
9. Documentation: runbook, deployment guide, operator training

Phase 3 begins: Scale & Diversify (Module Federation, HITL, custom nodes)
"""

# Write to file
