# Continuation state — IntegraX

Updated 2026-11-26 UTC. **Read [AGENTS.md](AGENTS.md) and this file first; no chat export needed.**

## Current mission
- [C20](research/CAMPAIGN-20.md) active, owner priority: cumulatively factor nested XML objects, retain actual factors and exact provenance, reuse smaller-object factors in larger integers, revisit unresolved objects, and measure scaling against frozen controls. C01–C18 closed; C19 deferred, mode8 independently verified.
- Hosted GitHub Actions primary CI; no owner-local jobs required. Rust/Nix preferred; existing JS experiment scripts retained; no npm. Public competition-restricted development license; earlier MIT grants remain valid. No contest submission, spending, access or mission changes without approval. Committee acknowledgment of prior notice pending.

## Accepted baseline
- E0119 verified: 46547 indexed objects, 13631 distinct factors, 12871 new objects and 2843 new factors. 3252 parent products independently reconstructed; [evidence](experiments/records/E0119.json), [CI](https://github.com/sguzman/integrax/actions/runs/45856991033). Probable-prime labels retained.
- E0120 verified: 40 exact refinements (29 distinct values), 39 parents, 3 completed, 691 overlapping residual bits removed; 28 historical / 12 E0119. One article improved, zero pages. [Evidence](experiments/records/E0120.json), [CI](https://github.com/sguzman/integrax/actions/runs/45865478280). E0118 had no proper shared divisors across 5242 residuals.
- E0121 verified: 7518 partial residuals, 5789 distinct, 2 proper global-only GCD hits and 2 new primes (13633 factors total), one text and one sentence improved, 32 overlapping residual bits removed. [Evidence](experiments/records/E0121.json), [CI](https://github.com/sguzman/integrax/actions/runs/45865938543). E0120 overlay replay passed.
- E0122 verified: both E0121 primes propagated into their two witness sentences, 32 additional overlapping residual bits removed, 7518 still partial. E0121 index union and overlay replay passed. [Evidence](experiments/records/E0122.json), [CI](https://github.com/sguzman/integrax/actions/runs/45867979440).
- [Frontier](benchmarks/FRONTIER.md): F0012 blockwise 217,045,597 B; F0013 whole-stream 232,493,451 B; archive-only, contest total unestablished. No compression claim from overlapping object factors.

## Resume here
- E0123 [CI 45868290145](https://github.com/sguzman/integrax/actions/runs/45868290145) passed: 16,276 objects, 3,089 parents, 2,448 new factors (16,081 total), 5,953 full-inventory hits, 1,374 parent hits, 156,220 residual bits removed. All eleven frozen inventories and exact parent products passed; runtime 371.36 s, peak RSS 1,328,748 KiB. All 164 object shards are on `main`. See [E0123](experiments/records/E0123.md).
- E0123 publication [45893099018](https://github.com/sguzman/integrax/actions/runs/45893099018) passed and verified readback at [`cefd45a`](https://github.com/sguzman/integrax/commit/cefd45a83752d37952d5af22405cbcee99cd8619): 62,823 indexed objects, 16,081 factors, 164 object shards, three snapshots, ten index shards. Frozen article/page residuals unchanged across eleven stages; adaptive reuse removed 0 article bits and 9 page bits.
- E0124 [45893189364](https://github.com/sguzman/integrax/actions/runs/45893189364) passed: 9,826 partial objects screened; 29 parent rows (21 distinct values) improved, one completed, 515 overlapping residual bits removed. Historical cohort: 358 bits; E0123 cohort: 157 bits. Runtime 67.38 s, peak RSS 1,395,816 KiB. Exact refinement rows and record are persisted; no article reduction and no full-corpus compression claim.
- E0125 is staged as a hosted saturation control: replay E0124 plus all prior overlays, then screen remaining cofactors against the unchanged 16,081-factor inventory. The workflow will trigger on this checkpoint's push and use the verified corpus cache. Its result will determine whether the next page expansion needs a changed search strategy.

## On-demand context
- [Campaign registry](research/README.md), [C20](research/CAMPAIGN-20.md), [experiment records](experiments/records/), [hosted CI](docs/HOSTED-CI.md).
- [Full historical state through E0117](docs/history/STATE-through-E0117.md) archived verbatim. Use targeted sections only; history, code and evidence stay in Git. Dashboard deployment unverified.
- Keep this file a compact replacement checkpoint, not a running log. Update on every meaningful accepted change; archive superseded history when necessary. Human action: none.
