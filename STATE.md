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
- E0117 passed: 33,676 indexed objects, 5,243 partial, 10,788 known factors; 32 improved records (23 distinct integers), all parents, one completed phrase, 599 overlapping residual bits removed. Historical cohort 29 improvements, E0116 cohort 3. Two revisions improved (25 bits total), zero article/page improvements. 23.28 s, 1,290,708 KiB peak RSS. All 32 exact products, residual decompositions, bit counts and cohort counts independently rechecked; full inventory replay and parent synthesis passed in CI. Verified corpus cache saved. No compression claim. Next: E0118 strict smaller global residual GCD on enlarged post-overlay inventory, compare against E0114.
- [E0117 record](experiments/records/E0117.md), [structured evidence](experiments/records/E0117.json), [CI](https://github.com/sguzman/integrax/actions/runs/45855741738). Attempts 1–2 failed acquisition; non-www endpoint recovery succeeded; cache save confirmed. Local acquisition unchanged.
- Next implement E0118 using the prior E0114 strictly smaller residual GCD protocol, replay E0117 overlays, retain proper splits and exact witnesses, keep descendant/global-only and inventory-only distinctions. Reuse verified hosted cache; do not claim compression. No E0118 implementation or run yet.

## On-demand context
- [Campaign registry](research/README.md), [C20](research/CAMPAIGN-20.md), [experiment records](experiments/records/), [hosted CI](docs/HOSTED-CI.md).
- [Full historical state through E0117](docs/history/STATE-through-E0117.md) archived verbatim. Use targeted sections only; history, code and evidence stay in Git. Dashboard deployment unverified.
- Keep this file a compact replacement checkpoint, not a running log. Update on every meaningful accepted change; archive superseded history when necessary. Human action: none.
