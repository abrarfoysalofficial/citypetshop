# Docs Inventory

**Generated:** March 1, 2026

---

## Docs Tree

```
docs/
├── PROJECT_ROADMAP.md      — Canonical roadmap (phases 0–7)
├── GIT_PUSH_READY.md       — Pre-push checklist
├── DEPLOY.md               — Production deployment
├── OPS_RUNBOOKS.md         — Backup, restore, monitoring
├── MUST_REPLACE_SECRETS.md — Secrets checklist
├── ARCHITECTURE.md         — System architecture
├── RANDOM_SAFE_DEFAULTS.md — Safe default values
├── GAP_REPORT.md           — Gap analysis vs plan
├── PR-10-SUMMARY.md        — PR-10 summary
├── PR-9-SUMMARY.md         — PR-9 summary
├── PR-9-AUDIT-AND-PLAN.md  — PR-9 audit
├── PR-8-SUMMARY.md         — PR-8 summary
├── PR-8-PERFORMANCE-CACHING-AUDIT.md
├── PROJECT_COMPLETION_REPORT.md
├── PR-6-SECURITY-OBSERVABILITY.md
├── PR-5-DESIGN-PLAN.md
├── PHASE_SUMMARIES.md
└── _audit/                 — This audit output
```

---

## Doc Status

| Doc | Status | Required Actions |
|-----|--------|------------------|
| PROJECT_ROADMAP.md | **active** | Single source of truth; update after changes |
| GIT_PUSH_READY.md | **active** | Route checklist, build commands |
| DEPLOY.md | **active** | RBAC §13b, SSL, security |
| OPS_RUNBOOKS.md | **active** | Backup, restore, courier |
| MUST_REPLACE_SECRETS.md | **active** | Pre-deploy review |
| ARCHITECTURE.md | **active** | Reference |
| RANDOM_SAFE_DEFAULTS.md | **active** | Reference |
| GAP_REPORT.md | **stale** | Feb 2026; some items now done (e.g. Phase 6/7) |
| PR-10-SUMMARY.md | **superseded** | Historical PR summary |
| PR-9-SUMMARY.md | **superseded** | Historical |
| PR-9-AUDIT-AND-PLAN.md | **superseded** | Historical |
| PR-8-SUMMARY.md | **superseded** | Historical |
| PR-8-PERFORMANCE-CACHING-AUDIT.md | **superseded** | Historical |
| PROJECT_COMPLETION_REPORT.md | **stale** | May not reflect current state |
| PR-6-SECURITY-OBSERVABILITY.md | **superseded** | Historical |
| PR-5-DESIGN-PLAN.md | **superseded** | Historical |
| PHASE_SUMMARIES.md | **stale** | May need update |

---

## Canonical Roadmap

**File:** `docs/PROJECT_ROADMAP.md`

- Single source of truth for phases 0–7
- Completion table: 50 steps, 100% done
- Change log maintained
- Copy-paste snippets for error-prone steps

---

## Contradictions

1. **GAP_REPORT vs ROADMAP:** GAP_REPORT (Feb 2026) lists items as missing/partial that ROADMAP marks Done (e.g. Phase 6.4–6.7, 7.6–7.8). **Resolution:** Trust ROADMAP as canonical.

2. **admin.citypetshop.bd subdomain:** GAP_REPORT lists as missing. Admin is at `/admin` on same domain. **Resolution:** Design decision; no subdomain.

3. **Colour scheme:** GAP_REPORT mentions "green primary"; ROADMAP shows primary #5cd4ff (aqua). **Resolution:** ROADMAP reflects current design.
