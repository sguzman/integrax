# Continuation state — IntegraX

Updated 2026-11-27 UTC. Read [AGENTS.md](AGENTS.md) and this file first; no chat export is needed.

## Mission and constraints
C20 is active: find rigorous arithmetic descriptions for large integers, especially enwik9; prioritize whole integers while allowing hierarchical controls. Research direction and campaign selection are delegated. No spending, external submission, access or mission changes without approval. Compute on free standard GitHub Actions runners; use Nix. Preserve competition-restricted development license and historical MIT grants. See [C20](research/CAMPAIGN-20.md), [registry](research/README.md), [frontier](benchmarks/FRONTIER.md), [hosted CI](docs/HOSTED-CI.md).

## Accepted evidence
- E0119–E0133: multi-scale inventory expansion, closure and exact scan/index comparisons. See [campaign record](research/CAMPAIGN-20.md) and per-run [records](experiments/records/); inventory JSON is metadata, not an encoded archive.
- E0134–E0135: 26,721 nodes / 3,913 factors, 308,457 overlapping residual bits; then 75 parent refinements / 1,191 bits. Cumulative research JSON: 320,574,848 B.
- E0136: flat/tree matched on 1,557 sampled partials (zero hits); 82.12 vs. 248.21 s. Sample-specific.
- E0137 [measure](https://github.com/sguzman/integrax/actions/runs/46035167115), [publication](https://github.com/sguzman/integrax/actions/runs/46039383995): 30,964 nodes / 33,701 factors on three 25–27 KB pages; 12,507 inventory hits / 332,140 overlapping bits; flat/tree matched (40 s / 102 s).
- E0138 [measure](https://github.com/sguzman/integrax/actions/runs/46039527084), [publication](https://github.com/sguzman/integrax/actions/runs/46042805751): 113 refinements / 81 values, four complete; 2,055 overlapping bits. Cumulative JSON 402,518,851 B.
- E0139 [run](https://github.com/sguzman/integrax/actions/runs/46043317930): exact flat/tree sample agreement; flat 94.18 s vs. tree 287.25 s (3.05×), zero hits.
- E0140 [measure](https://github.com/sguzman/integrax/actions/runs/46046140033), [publication](https://github.com/sguzman/integrax/actions/runs/46051453568): 34,957 nodes / 4,373 factors on three 28–30 KB pages; 14,009 hits / 391,820 overlapping bits. Flat/tree matched (55 s / 135 s); cumulative JSON 496,707,565 B.
- E0141 [measurement](https://github.com/sguzman/integrax/actions/runs/46051574703), [publication](https://github.com/sguzman/integrax/actions/runs/46052725830), [record](experiments/records/E0141.json): 88 refinements / 65 values removed 1,890 overlapping bits, five complete cofactors; runtime 414 s, peak RSS 1.92 GB; cumulative JSON 496,845,205 B.
- E0142 [run](https://github.com/sguzman/integrax/actions/runs/46052835936), [record](https://github.com/sguzman/integrax/commit/de6d3196): flat/tree exact agreement on 1,654 stratified residuals, zero hits; 159.85 vs. 452.89 s (~2.83×); one-run sample.
- E0143 corrected [run](https://github.com/sguzman/integrax/actions/runs/46056265910), [record](experiments/records/E0143.json): all-children inference matched ranked outputs; 399/63,364 parent moduli avoided, but ran ~7× slower (307.52 vs. 43.87 ms). Negative result; correction in C20.
- E0144 [measurement](https://github.com/sguzman/integrax/actions/runs/46058097119), [verified publication](https://github.com/sguzman/integrax/actions/runs/46064271469), [record](experiments/records/E0144.json): three fresh pages, 38,094 nested objects, +5,254 factors (43,328 total); 15,403 full-inventory hits, 423,146 overlapping residual bits removed. Runtime 3,186.99 s, peak RSS 1,444,812 KiB; cumulative JSON 601,644,712 B. Page roots had zero reduction; this is not archive savings.

## Resume here
E0145 measurement [run](https://github.com/sguzman/integrax/actions/runs/46064405056) succeeded; its publication was skipped, so E0146 did not launch from that chain. E0147's first run was cancelled; a manual rerun is currently active: [enumerate full XML population](https://github.com/sguzman/integrax/actions/runs/46065570002). It counts all XML elements and IntegraX candidate objects, validates indexed pages against shard counts, and will establish the denominator; no count is verified yet. Through E0144, 16 batches cover 48 selected pages, 653,647 B (0.0654% of corpus bytes), and 249,538 indexed nested objects; object coverage remains unknown. E0143's theorem saved 0.63% of checks but ran ~7× slower. JSON is not an archive; lossless compression remains unproven. C20 active.

## On-demand context
Prior checkpoint through E0133: [archive](docs/history/STATE-through-E0133.md). Earlier compact checkpoint: [through E0128](docs/history/STATE-through-E0128.md). Full history through E0117: [archive](docs/history/STATE-through-E0117.md). Dashboard deployment unverified; no human action currently required.
