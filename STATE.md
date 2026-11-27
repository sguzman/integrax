# Continuation state — IntegraX

Updated 2026-11-27 UTC. Read [AGENTS.md](AGENTS.md) and this file first; no chat export is needed.

## Mission and constraints
C20 is active: find rigorous arithmetic descriptions for large integers, especially enwik9; prioritize whole integers while allowing hierarchical controls. Research direction and campaign selection are delegated. No spending, external submission, access or mission changes without approval. Compute on free standard GitHub Actions runners; use Nix. Preserve competition-restricted development license and historical MIT grants. See [C20](research/CAMPAIGN-20.md), [registry](research/README.md), [frontier](benchmarks/FRONTIER.md), [hosted CI](docs/HOSTED-CI.md).

## Accepted evidence
- E0119–E0133: multi-scale inventory expansion, closure and exact scan/index comparisons. See [campaign record](research/CAMPAIGN-20.md) and per-run [records](experiments/records/); inventory JSON is metadata, not an encoded archive.
- E0134–E0135: 26,721 nodes / 3,913 factors, 308,457 nested residual bits removed, then 75 parent refinements / 1,191 bits. Cumulative research JSON: 320,574,848 B.
- E0136: exact flat/tree agreement on 1,557 sampled partials, zero hits; flat 82.12 s vs. tree 248.21 s. Sample-specific, not population absence.
- E0137 [measure](https://github.com/sguzman/integrax/actions/runs/46035167115), [publication](https://github.com/sguzman/integrax/actions/runs/46039383995), [record revision](https://github.com/sguzman/integrax/commit/fc67f92ecc1b4b50283484c8da98dac218cb9e5e): three 25,143–27,457-byte pages; 30,964 nodes / 33,701 factors. Full inventory improved 12,507 objects / 332,140 overlapping residual bits. Flat/tree snapshots matched; 39.76 s vs. 101.65 s. Cumulative JSON 401,879,209 B.
- E0138 [measure](https://github.com/sguzman/integrax/actions/runs/46039527084), [publication recovery](https://github.com/sguzman/integrax/actions/runs/46042805751), [record revision](https://github.com/sguzman/integrax/commit/8c2cc5a6501921dc18342185219bf4f63be9790b): 113 refinements / 81 values, four complete, 2,055 overlapping bits across 27,104 partials (110 parents); 99 historical and 14 E0137 rows. 311.20 s, 1,796,272 KiB peak RSS; cumulative research JSON 402,518,851 B.
- E0139 [run](https://github.com/sguzman/integrax/actions/runs/46043317930), [record](experiments/records/E0139.json): exact flat/tree agreement, zero hits, on 1,618 / 27,100 partials across all width bands. Flat 94.18 s vs. tree 287.25 s (3.05×); build 42 ms; 53,150,244 divisibility tests / 1,618 GCD calls. Sample-specific single-run timing.
- E0140 [measure](https://github.com/sguzman/integrax/actions/runs/46046140033), [publication](https://github.com/sguzman/integrax/actions/runs/46051453568), [record revision](https://github.com/sguzman/integrax/commit/1c77ff1c2a6480586567cd220aa73c914d03a0d5): 34,957 nodes / 4,373 net factors on three 27,951–29,633-byte pages. Full inventory improved 14,009 rows / 391,820 overlapping bits. Flat/tree snapshots matched; 55.45 s vs. 135.38 s. 17 controls through E0137 validated; cumulative research JSON 496,707,565 B.

## Resume here
Resume with E0141 closure [run 46051574703](https://github.com/sguzman/integrax/actions/runs/46051574703), then E0142 paired index comparison. E0140 adds 4,373 factors but shows stable full-inventory hit density (~40% of rows) and continued flat-scan timing advantage; page-root reductions remain zero. Continue higher scales and whole-integer storage accounting. Research JSON is not an archive; no lossless compression has been demonstrated. C20 remains active.

## On-demand context
Prior checkpoint through E0133: [archive](docs/history/STATE-through-E0133.md). Earlier compact checkpoint: [through E0128](docs/history/STATE-through-E0128.md). Full history through E0117: [archive](docs/history/STATE-through-E0117.md). Dashboard deployment unverified; no human action currently required.
