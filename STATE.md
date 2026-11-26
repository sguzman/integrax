# Continuation state — IntegraX

Updated 2026-11-26 UTC. **Read [AGENTS.md](AGENTS.md) and this file first; no chat export needed.**

## Current mission
- [C20](research/CAMPAIGN-20.md) active, owner priority: cumulatively factor nested XML objects, retain actual factors and exact provenance, reuse smaller-object factors in larger integers, revisit unresolved objects, and measure scaling against frozen controls. C01–C18 closed; C19 deferred, mode8 independently verified.
- Hosted GitHub Actions primary CI; no owner-local jobs required. Rust/Nix preferred; existing JS experiment scripts retained; no npm. Public competition-restricted development license; earlier MIT grants remain valid. No contest submission, spending, access or mission changes without approval. Committee acknowledgment of prior notice pending.

## Accepted baseline
- E0119 verified: 46547 indexed objects, 13631 distinct factors, 12871 new objects and 2843 new factors. 3252 parent products independently reconstructed; [evidence](experiments/records/E0119.json), [CI](https://github.com/sguzman/integrax/actions/runs/45856991033). Probable-prime labels retained.
- E0120 verified: 40 exact refinements (29 distinct values), 39 parents, 3 completed, 691 overlapping residual bits removed; 28 historical / 12 E0119. One article improved, zero pages. [Evidence](experiments/records/E0120.json), [CI](https://github.com/sguzman/integrax/actions/runs/45865478280). E0118 had no proper shared divisors across 5242 residuals.
- [Frontier](benchmarks/FRONTIER.md): F0012 blockwise 217,045,597 B; F0013 whole-stream 232,493,451 B; archive-only, contest total unestablished. No compression claim from overlapping object factors.

## Resume here
- E0120 accepted and all 40 overlays published. Next E0121: replay post-E0120 inventory and repeat strict smaller global residual GCD using the unchanged E0118 algorithm. Compare with E0118; exact products and witnesses required. No E0121 run launched yet. Expected partial count 7518. Use verified hosted cache.
- Check reference CI and verify overlay replay; do not duplicate running work.

## On-demand context
- [Campaign registry](research/README.md), [C20](research/CAMPAIGN-20.md), [experiment records](experiments/records/), [hosted CI](docs/HOSTED-CI.md).
- [Full historical state through E0117](docs/history/STATE-through-E0117.md) archived verbatim. Use targeted sections only; history, code and evidence stay in Git. Dashboard deployment unverified.
- Keep this file a compact replacement checkpoint, not a running log. Update on every meaningful accepted change; archive superseded history when necessary. Human action: none.
