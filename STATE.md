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
1. E0117 implemented at [84a09fc](https://github.com/sguzman/integrax/commit/84a09fcc3fe533212402c6a0c0276db1b1a85749). [Record](experiments/records/E0117.md), [workflow](.github/workflows/inventory-scale-closure.yml), [script](experiments/xml/inventory-scale-closure.mjs).
2. [CI run 45851580341](https://github.com/sguzman/integrax/actions/runs/45851580341) first attempt failed before measurement: enwik9 transfer interrupted after 12,074 bytes; server refused range resume (curl 33). Reference codec and IX02 cross-codec passed. Failed jobs rerun requested and accepted; inspect latest attempt. Do not launch duplicate work or count this as a mathematical result.
3. On success, extract only relevant evidence, independently verify exact products, cohort attribution, counts and index union as applicable; commit verified evidence/overlays and read them back. On another acquisition failure, inspect only failing step and consider hosted-only bounded recovery without modifying local partial preservation policy.
4. Once E0117 accepted, choose next scientifically justified C20 experiment based on measured scale effects, with frozen controls and exact verification. Do not claim compression without fully accounted reversible archive.

## On-demand context
- [Campaign registry](research/README.md), [C20](research/CAMPAIGN-20.md), [experiment records](experiments/records/), [hosted CI](docs/HOSTED-CI.md).
- [Full historical state through E0117](docs/history/STATE-through-E0117.md) archived verbatim. Use targeted sections only; history, code and evidence stay in Git. Dashboard deployment unverified.
- Keep this file a compact replacement checkpoint, not a running log. Update on every meaningful accepted change; archive superseded history when necessary. Human action: none.
