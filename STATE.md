# Continuation state — IntegraX

Updated 2026-11-26 UTC. **Read [AGENTS.md](AGENTS.md) and this file first; no chat export needed.**

## Current mission
- [C20](research/CAMPAIGN-20.md) active, owner priority: cumulatively factor nested XML objects, retain actual factors and exact provenance, reuse smaller-object factors in larger integers, revisit unresolved objects, and measure scaling against frozen controls. C01–C18 closed; C19 deferred, mode8 independently verified.
- Hosted GitHub Actions primary CI; no owner-local jobs required. Rust/Nix preferred; existing JS experiment scripts retained; no npm. Public competition-restricted development license; earlier MIT grants remain valid. No contest submission, spending, access or mission changes without approval. Committee acknowledgment of prior notice pending.

## Accepted baseline
- [E0116](experiments/records/E0116.md) completed: 33,676 objects, 10,788 distinct factors, 772 new parent values benefiting from reuse, 1,940/1,940 independent parent reconstructions. Inventory and index shards persisted at [91a02aa](https://github.com/sguzman/integrax/commit/91a02aa11f982eb6ede9695d43b2849ff5f563e3). [E0116 CI](https://github.com/sguzman/integrax/actions/runs/45849609355). Probable-prime labels retained.
- Article/page residuals unchanged across eight frozen inventory stages. Sentence/paragraph gains do not establish net compression; overlapping residual-bit counts are not archive savings.
- [Frontier](benchmarks/FRONTIER.md): F0012 blockwise 217,045,597 B; F0013 whole-stream 232,493,451 B; both strict full-corpus exact reconstruction, archive-only. Contest total unestablished.

## Resume here
- E0119 CI passed: [run 45856991033](https://github.com/sguzman/integrax/actions/runs/45856991033), job 140037861392. 12,871 new objects, 13,631 total distinct factors; results not yet accepted into the manifest. The initial atomic bulk write exceeded connector operation/payload limits; use smaller page-level staging commits.
- All three pages staged and independently verified: 12871 rows, 3252 parent products, 130 shards. Stage records: inventory/batches/E0119/stage-{101301255,400074022,800041834}.json. Next verify shard tree presence, derive factor index delta and snapshots from CI log, then atomically publish E0119 record, manifest and compact state. Do not rerun CI or begin E0120 before acceptance.

## On-demand context
- [Campaign registry](research/README.md), [C20](research/CAMPAIGN-20.md), [experiment records](experiments/records/), [hosted CI](docs/HOSTED-CI.md).
- [Full historical state through E0117](docs/history/STATE-through-E0117.md) archived verbatim. Use targeted sections only; history, code and evidence stay in Git. Dashboard deployment unverified.
- Keep this file a compact replacement checkpoint, not a running log. Update on every meaningful accepted change; archive superseded history when necessary. Human action: none.
