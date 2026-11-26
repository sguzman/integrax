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
- E0117 accepted: 32 exact refinements, 23 distinct improved integers, 599 overlapping residual bits removed, one phrase completed, two revisions improved, zero article/page improvements. [Evidence](experiments/records/E0117.json). Corpus cache saved and restored successfully.
- E0118 passed: 5,242 partial objects, 4,122 distinct residuals, 111,044 product-tree GCD calls, 32,558 strict descendant checks, zero inventory-only hits, zero proper GCD hits, zero new factors. 193.93 s, peak RSS 1,277,272 KiB. Full corpus and inventory replay passed; summary and absence of emitted refinements rechecked. No inventory mutation or compression claim. Verified Actions corpus cache restored. [Evidence](experiments/records/E0118.json), [CI](https://github.com/sguzman/integrax/actions/runs/45856142038).
- E0119: expand to three fresh 10,241–12,288-byte pages, replay all E0117 overlays, compare nine frozen inventory stages through E0116 (10,788 factors) on identical held-out values before adaptive learning. Preserve exact products, parent synthesis and factor provenance; compare with E0116. Use the existing bounded search and verified corpus cache. Hosted CI pending. [Record](experiments/records/E0119.md), [script](experiments/xml/factor-inventory-larger-pages.mjs), [workflow](.github/workflows/factor-inventory-larger-pages.yml). Locate E0119 push CI by implementation commit. On success independently verify all parent products, inventory union, frozen controls and persist shards/snapshots and exact evidence. Do not duplicate running work.

## On-demand context
- [Campaign registry](research/README.md), [C20](research/CAMPAIGN-20.md), [experiment records](experiments/records/), [hosted CI](docs/HOSTED-CI.md).
- [Full historical state through E0117](docs/history/STATE-through-E0117.md) archived verbatim. Use targeted sections only; history, code and evidence stay in Git. Dashboard deployment unverified.
- Keep this file a compact replacement checkpoint, not a running log. Update on every meaningful accepted change; archive superseded history when necessary. Human action: none.
