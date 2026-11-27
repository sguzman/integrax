# Continuation state — IntegraX

Updated 2026-11-27 UTC. Read [AGENTS.md](AGENTS.md) and this file first; no chat export is needed.

## Mission and constraints
C20 is active: find rigorous arithmetic descriptions for large integers, especially enwik9; prioritize whole integers while allowing hierarchical controls. Research direction and campaign selection are delegated. No spending, external submission, access or mission changes without approval. Compute on free standard GitHub Actions runners; use Nix. Preserve competition-restricted development license and historical MIT grants. See [C20](research/CAMPAIGN-20.md), [registry](research/README.md), [frontier](benchmarks/FRONTIER.md), [hosted CI](docs/HOSTED-CI.md).

## Accepted evidence
- E0119–E0133: multi-scale inventory expansion, closure and exact scan/index comparisons. See [campaign record](research/CAMPAIGN-20.md) and per-run [records](experiments/records/); inventory JSON is metadata, not an encoded archive.
- E0134–E0135: 26,721 nodes / 3,913 factors, 308,457 nested residual bits removed, then 75 parent refinements / 1,191 bits. Cumulative research JSON: 320,574,848 B.
- E0136: exact flat/tree agreement on 1,557 sampled partials, zero hits; flat 82.12 s vs. tree 248.21 s. Sample-specific, not population absence.
- E0137 [measure](https://github.com/sguzman/integrax/actions/runs/46035167115), [publication](https://github.com/sguzman/integrax/actions/runs/46039383995): 30,964 nodes / 33,701 factors on three 25–27 KB pages; 12,507 inventory hits / 332,140 overlapping bits; flat/tree matched (40 s / 102 s).
- E0138 [measure](https://github.com/sguzman/integrax/actions/runs/46039527084), [publication](https://github.com/sguzman/integrax/actions/runs/46042805751): 113 refinements / 81 values, four complete; 2,055 overlapping bits across 27,104 partials. Cumulative JSON 402,518,851 B.
- E0139 [run](https://github.com/sguzman/integrax/actions/runs/46043317930): exact flat/tree sample agreement; flat 94.18 s vs. tree 287.25 s (3.05×), zero hits.
- E0140 [measure](https://github.com/sguzman/integrax/actions/runs/46046140033), [publication](https://github.com/sguzman/integrax/actions/runs/46051453568): 34,957 nodes / 4,373 factors on three 28–30 KB pages; 14,009 hits / 391,820 overlapping bits. Flat/tree matched (55 s / 135 s); cumulative JSON 496,707,565 B.
- E0141 [measurement](https://github.com/sguzman/integrax/actions/runs/46051574703), [publication](https://github.com/sguzman/integrax/actions/runs/46052725830), [record](experiments/records/E0141.json): screened 32,435 partial objects with 38,074 factors; 88 refinements / 65 values removed 1,890 overlapping residual bits, including 85 parent rows and five complete cofactors. Runtime 414.01 s, peak RSS 1,919,392 KiB; cumulative research JSON 496,845,205 B.
- E0142 [run](https://github.com/sguzman/integrax/actions/runs/46052835936), [record revision](https://github.com/sguzman/integrax/commit/de6d3196): exact flat/tree agreement on 1,654 deterministic width-stratified residuals from 32,430 partial objects; zero sample hits. Flat 159.85 s vs. tree 452.89 s (~2.83×); tree build 62 ms; 61,411,694 flat divisibility tests / 1,654 GCD calls. One-run timings, not population absence.
- E0143 corrected [run](https://github.com/sguzman/integrax/actions/runs/46056265910), [record](experiments/records/E0143.json): 1,954 parent sample across five width bands. The all-children theorem produced the same exact factors/residuals as ranked checks; 399 common prime occurrences avoided 399 of 63,364 parent modulo tests. Runtime was 307.52 ms vs. 43.87 ms (~7× slower), so this implementation is a negative efficiency result. Original timing flaw is documented in C20; corrected run excludes proof checks.

## Resume here
Resume with E0144: expand to three fresh 30,721–34,816-byte pages using flat-scan inventory. E0143 proved all-children inheritance but saved 0.63% of parent modulo checks and ran ~7× slower. Prior hit density stayed near 40% as factor additions declined; page-root reductions remained zero. Continue larger scales and decoder/storage accounting. Research JSON is not an archive; no lossless compression has been demonstrated. C20 remains active.

## On-demand context
Prior checkpoint through E0133: [archive](docs/history/STATE-through-E0133.md). Earlier compact checkpoint: [through E0128](docs/history/STATE-through-E0128.md). Full history through E0117: [archive](docs/history/STATE-through-E0117.md). Dashboard deployment unverified; no human action currently required.
