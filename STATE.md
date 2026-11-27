# Continuation state — IntegraX

Updated 2026-11-27 UTC. Read [AGENTS.md](AGENTS.md) and this file first; no chat export is needed.

## Mission and constraints
C20 is active: find rigorous arithmetic descriptions for large integers, especially enwik9; prioritize whole integers while allowing hierarchical controls. Research direction and campaign selection are delegated. No spending, external submission, access or mission changes without approval. Compute on free standard GitHub Actions runners; use Nix. Preserve competition-restricted development license and historical MIT grants. See [C20](research/CAMPAIGN-20.md), [registry](research/README.md), [frontier](benchmarks/FRONTIER.md), [hosted CI](docs/HOSTED-CI.md).

## Accepted evidence
- E0119–E0133: multi-scale inventory expansion, closure and exact scan/index comparisons. See [campaign record](research/CAMPAIGN-20.md) and per-run [records](experiments/records/); inventory JSON is metadata, not an encoded archive.
- E0134–35: 26,721 nodes/3,913 factors, 308,457 overlapping bits; +75 refinements/1,191 bits; JSON 320,574,848 B.
- E0136: flat/tree matched on 1,557 partials (zero hits); 82.12 vs. 248.21 s.
- E0137–E0144: repeated multi-page expansions, residual closures and exact flat/tree controls; see C20 and run records. E0142 tree was 2.83× slower; E0143's proven all-children rule avoided 0.63% of checks but ran ~7× slower. E0144 [publication](https://github.com/sguzman/integrax/actions/runs/46064271469), [record](experiments/records/E0144.json): 38,094 nodes/+5,254 factors, 15,403 hits, 423,146 overlapping bits; cumulative JSON 601,644,712 B (not an archive).

## Resume here
E0145 [measure](https://github.com/sguzman/integrax/actions/runs/46064405056)/[publish](https://github.com/sguzman/integrax/actions/runs/46074664218): 120 refinements, two complete, 2,066 overlapping bits. E0146 [run](https://github.com/sguzman/integrax/actions/runs/46074752103): exact on 1,717 residuals; tree 2.69× slower. E0147 [census](https://github.com/sguzman/integrax/actions/runs/46071781670), [record](experiments/records/E0147.json): 243,426 pages, 2,686,415 XML starts, 379,135,343 candidates. E0148 prior [audit](https://github.com/sguzman/integrax/actions/runs/46073894268): 211,677 complete rows, 198,196 proven-prime-only; full results in record. E0149 [measure](https://github.com/sguzman/integrax/actions/runs/46077592625)/[publish](https://github.com/sguzman/integrax/actions/runs/46083650657), [record](experiments/records/E0149.json), readback [515f9dd](https://github.com/sguzman/integrax/commit/515f9dd): 40,642 nodes on 99,698 B of pages; 15,511 full-inventory hits; +4,219 factors to 47,547; 33,886 complete; flat/tree exact but tree 2.35× slower. Index is 290,180/379,135,343 candidates (0.07654%); cumulative research JSON 717,318,350 B (71.73% of input, not an archive). E0148 rerun [46083760581](https://github.com/sguzman/integrax/actions/runs/46083760581) failed because it equated the older census index count (249,538) with the current 290,180. Source/publisher now use baseline lower bounds; rerun pending. Then E0150 residual reuse → E0151 flat/tree comparison. Compression remains unproven.

## On-demand context
Prior checkpoint through E0133: [archive](docs/history/STATE-through-E0133.md). Earlier compact checkpoint: [through E0128](docs/history/STATE-through-E0128.md). Full history through E0117: [archive](docs/history/STATE-through-E0117.md). Dashboard deployment unverified; no human action currently required.
