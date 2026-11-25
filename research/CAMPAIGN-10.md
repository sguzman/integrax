# C10 — Hybrid arithmetic and context coding

Active. M1: E0037 24/24 exact comparisons, only one marginal hybrid gain, no scaling. M2: [E0038](../experiments/records/E0038.md) adaptive binary intervals and context determined by last expanded byte; 9/9 exact, 7 Rust tests, 16 MiB held-out context 5,746,766 B vs gzip 6,130,610 B. Same root sequence, complete dictionary charged. E0039 hierarchical backoff and zero-rule ablation pending. M3: [E0040](../experiments/records/E0040.md) isolated full verification passed: 319,996,416 B, F0006 accepted, first native archive below recorded gzip. Compare against F0004, E0030 and gzip. No novelty claim; adaptive coding established prior art. No claim of contest eligibility.

M4: [E0039](../experiments/records/E0039.md) 9/9, dictionary ablation shows 29.12% reduction on largest held-out region; fixed backoff regresses. E0041 ordered root ranks and two-byte suffix contexts, factorial ablation, [theory](../theory/ordered-root-context.md); [E0041](../experiments/records/E0041.md) 12/12 exact; mode 7 wins all regions, 16 MiB 5,232,879 B (14.65% below gzip). [E0042](../experiments/records/E0042.md) 90 independent archive equality/cross-decode comparisons passed. [E0043](../experiments/records/E0043.md) full isolated passed, F0007 280,380,483 B. Retain mode 4 as baseline and scale verified mode 7.

M5: E0044 last-three-byte vs previous-root predictors [CI 45705431555](https://github.com/sguzman/integrax/actions/runs/45705431555), passed: [E0044](../experiments/records/E0044.md) 9/9 exact; mode 9 wins all regions, 16 MiB 4,913,044 B. E0045 full mode 9 authored. Independent oracle modes 3–8 only. No full depth extrapolation.

M6: E0046 independent deep predictor reference authored; E0047 [adaptive predictive-cost parsing](../theory/adaptive-root-parsing.md) compares greedy and three local ratio penalties, no wire-format changes. Results pending. Do not scale until measured gain.

M7: E0048 optional strict canonical arithmetic decoding and append rejection; benchmark runtime/memory overhead. No archive overhead, not a checksum. [Theory](../theory/canonical-root-intervals.md). Pending CI.

[E0047](../experiments/records/E0047.md) completed: 12/12 exact, all nine cost-ratio variants larger than greedy. Retain greedy. No full-scale test of the inferior heuristic.

[E0048](../experiments/records/E0048.md) passed 12/12 comparisons and 18/18 append rejects. E0049 larger dictionary ablation (8192/16384 rules, 256/512 KiB training) authored with strict decoder, pending. No extrapolation.

M8: E0050 [root decision geometry](../theory/root-decision-geometry.md) full binary root trees derived from dictionary, with first-digit alignment or median splits. Same third-order context, matched greedy parse and strict comparisons. CI pending. No novelty claim or assumed improvement.
