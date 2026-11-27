# Continuation state — IntegraX

Updated 2026-11-27 UTC. Read [AGENTS.md](AGENTS.md) and this file first; no chat export is needed.

## Mission and constraints
C20 is active: find rigorous arithmetic descriptions for large integers, especially enwik9; prioritize whole integers while allowing hierarchical controls. Research direction and campaign selection are delegated. No spending, external submission, access or mission changes without approval. Compute on free standard GitHub Actions runners; use Nix. Preserve competition-restricted development license and historical MIT grants. See [C20](research/CAMPAIGN-20.md), [registry](research/README.md), [frontier](benchmarks/FRONTIER.md), [hosted CI](docs/HOSTED-CI.md).

## Accepted evidence
- E0119–E0133: multi-scale inventory expansion, closure and exact scan/index comparisons. See [campaign record](research/CAMPAIGN-20.md) and per-run [records](experiments/records/); inventory JSON is metadata, not an encoded archive.
- E0134–35: 26,721 nodes/3,913 factors, 308,457 overlapping bits; +75 refinements/1,191 bits; JSON 320,574,848 B.
- E0136: flat/tree matched on 1,557 partials (zero hits); 82.12 vs. 248.21 s.
- E0137 [measure](https://github.com/sguzman/integrax/actions/runs/46035167115), [publication](https://github.com/sguzman/integrax/actions/runs/46039383995): 30,964 nodes, 33,701 factors, 12,507 hits, 332,140 overlapping bits; flat/tree exact.
- E0138 [measure](https://github.com/sguzman/integrax/actions/runs/46039527084), [publication](https://github.com/sguzman/integrax/actions/runs/46042805751): 113/81 refinements/values, four complete, 2,055 bits; JSON 402,518,851 B.
- E0139 [run](https://github.com/sguzman/integrax/actions/runs/46043317930): flat/tree exact on sample, zero hits; 94.18 vs. 287.25 s (3.05×).
- E0140 [measure](https://github.com/sguzman/integrax/actions/runs/46046140033), [publication](https://github.com/sguzman/integrax/actions/runs/46051453568): 34,957 nodes/+4,373 factors, 14,009 hits, 391,820 overlapping bits; flat/tree exact.
- E0141 [measurement](https://github.com/sguzman/integrax/actions/runs/46051574703), [publication](https://github.com/sguzman/integrax/actions/runs/46052725830), [record](experiments/records/E0141.json): 88 refinements/65 values, 1,890 bits, five complete; 414 s/1.92 GB RSS.
- E0142 [run](https://github.com/sguzman/integrax/actions/runs/46052835936), [record](https://github.com/sguzman/integrax/commit/de6d3196): exact flat/tree on 1,654 stratified residuals; 159.85 vs. 452.89 s (~2.83×).
- E0143 corrected [run](https://github.com/sguzman/integrax/actions/runs/46056265910), [record](experiments/records/E0143.json): all-children matched ranked factors; avoided 399/63,364 moduli but ran ~7× slower; negative result in C20.
- E0144 [measurement](https://github.com/sguzman/integrax/actions/runs/46058097119), [verified publication](https://github.com/sguzman/integrax/actions/runs/46064271469), [record](experiments/records/E0144.json): 38,094 nodes/+5,254 factors, 15,403 hits, 423,146 overlapping bits; roots zero; 3,187 s, 1.44 GB RSS; cumulative JSON 601,644,712 B, not archive savings.

## Resume here
E0145 [measure](https://github.com/sguzman/integrax/actions/runs/46064405056)/[publish](https://github.com/sguzman/integrax/actions/runs/46074664218): 120 refinements, two complete, 2,066 overlapping bits; 466 s. E0146 [run](https://github.com/sguzman/integrax/actions/runs/46074752103): exact on 1,717 residuals; tree ~2.69× slower. E0147 [census](https://github.com/sguzman/integrax/actions/runs/46071781670), [record](experiments/records/E0147.json): 243,426 pages, 2,686,415 XML starts, 379,135,343 candidates; index 249,538 (0.06582%) on 48 pages. E0148 [audit](https://github.com/sguzman/integrax/actions/runs/46073894268), [record](experiments/records/E0148.json): 211,677 complete rows (84.83% indexed; 0.05583% population lower bound), 198,196 proven-prime-only; 13,481 include probable primes. Retry gates use the E0144 storage lower bound. E0149 [code](https://github.com/sguzman/integrax/commit/3176c340), [measurement](https://github.com/sguzman/integrax/actions/runs/46077592625) succeeded; artifact validation passed. Publication failed twice on stale-head pushes; publisher now checks out main and supports run-ID recovery. Dispatch publication, then E0148 audit → E0150 residual reuse → E0151 flat/tree. One extended retry [5309cf74](https://github.com/sguzman/integrax/commit/5309cf74) covers a measurement timeout. JSON is not an archive; compression remains unproven.

## On-demand context
Prior checkpoint through E0133: [archive](docs/history/STATE-through-E0133.md). Earlier compact checkpoint: [through E0128](docs/history/STATE-through-E0128.md). Full history through E0117: [archive](docs/history/STATE-through-E0117.md). Dashboard deployment unverified; no human action currently required.
