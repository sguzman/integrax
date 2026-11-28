# Continuation state — IntegraX

Updated 2026-11-28 UTC. Read [AGENTS.md](AGENTS.md) and this file first; no chat export is needed.

## Mission and constraints
C20 is active: find rigorous arithmetic descriptions for large integers, especially enwik9; prioritize whole integers while allowing hierarchical controls. Research direction and campaign selection are delegated. No spending, external submission, access or mission changes without approval. Compute on free standard GitHub Actions runners; use Nix. Preserve competition-restricted development license and historical MIT grants. See [C20](research/CAMPAIGN-20.md), [registry](research/README.md), [frontier](benchmarks/FRONTIER.md), [hosted CI](docs/HOSTED-CI.md).

## Accepted evidence
- E0119–E0133: multi-scale inventory expansion, closure and exact scan/index comparisons. See [campaign record](research/CAMPAIGN-20.md) and per-run [records](experiments/records/); inventory JSON is metadata, not an encoded archive.
- E0134–35: 26,721 nodes/3,913 factors, 308,457 overlapping bits; +75 refinements/1,191 bits; JSON 320,574,848 B.
- E0136: flat/tree matched on 1,557 partials (zero hits); 82.12 vs. 248.21 s.
- E0137–E0144: repeated multi-page expansions, residual closures and exact flat/tree controls; see C20 and run records. E0142 tree was 2.83× slower; E0143's proven all-children rule avoided 0.63% of checks but ran ~7× slower. E0144 [publication](https://github.com/sguzman/integrax/actions/runs/46064271469), [record](experiments/records/E0144.json): 38,094 nodes/+5,254 factors, 15,403 hits, 423,146 overlapping bits; cumulative JSON 601,644,712 B (not an archive).
- E0150 post hoc width strata: reuse incidence on partials rose from 1/31,005 (9–32 B) to 4/223 (>2,048 B); sparse, sample-specific association, not causal. Full bands and storage caveat are in C20.

## Resume here
E0145 [measure](https://github.com/sguzman/integrax/actions/runs/46064405056)/[publish](https://github.com/sguzman/integrax/actions/runs/46074664218): 120 refinements, two complete, 2,066 overlapping bits. E0146 [run](https://github.com/sguzman/integrax/actions/runs/46074752103): exact on 1,717 residuals; tree 2.69× slower. E0147 [census](https://github.com/sguzman/integrax/actions/runs/46071781670), [record](experiments/records/E0147.json): 243,426 pages, 2,686,415 XML starts, 379,135,343 candidates. Corrected E0148 [audit](https://github.com/sguzman/integrax/actions/runs/46084541590): 245,565 complete / 44,615 partial of 290,180 indexed rows; complete-factor lower bound 0.06477%. E0149 [record](experiments/records/E0149.json): 40,642 new objects, +4,219 factors to 47,547; 290,180/379,135,343 candidates indexed (0.07654%). E0150 [record](experiments/records/E0150.json), [publication](https://github.com/sguzman/integrax/actions/runs/46085771873): 79 refinements / 60 distinct values, one complete, 1,389 overlapping bits; cumulative research JSON 717,953,786 B (not an archive). E0151 [record](experiments/records/E0151.json), [readback commit](https://github.com/sguzman/integrax/commit/217deaa2): flat/tree factors matched on 1,766 stratified residuals; tree 2.68× slower. Detailed results and mathematical limits are in [C20](research/CAMPAIGN-20.md).

Resume here: E0152 is active on GitHub Actions [run 46087736704](https://github.com/sguzman/integrax/actions/runs/46087736704), expanding to three fresh 65,536–81,920-byte pages with the full index and paired flat/tree controls. On verified publication, E0153 replays new factors across all residuals and E0154 rechecks indexing algorithms. No lossless archive/compression claim is established.

## On-demand context
Prior checkpoint through E0133: [archive](docs/history/STATE-through-E0133.md). Earlier compact checkpoint: [through E0128](docs/history/STATE-through-E0128.md). Full history through E0117: [archive](docs/history/STATE-through-E0117.md). Dashboard deployment unverified; no human action currently required.
