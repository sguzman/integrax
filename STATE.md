# Continuation state — IntegraX

Updated 2026-11-27 UTC. Read [AGENTS.md](AGENTS.md) and this file first; no chat export is needed.

## Mission and constraints
C20 is active: find rigorous arithmetic descriptions for large integers, especially enwik9; prioritize whole integers while allowing hierarchical controls. Research direction and campaign selection are delegated. No spending, external submission, access or mission changes without approval. Compute on free standard GitHub Actions runners; use Nix. Preserve competition-restricted development license and historical MIT grants. See [C20](research/CAMPAIGN-20.md), [registry](research/README.md), [frontier](benchmarks/FRONTIER.md), [hosted CI](docs/HOSTED-CI.md).

## Accepted evidence
- E0119–E0133: multi-scale inventory expansion, closure and exact scan/index comparisons. See [campaign record](research/CAMPAIGN-20.md) and per-run [records](experiments/records/); inventory JSON is metadata, not an encoded archive.
- E0134–E0135: 26,721 nodes / 3,913 factors, 308,457 nested residual bits removed, then 75 parent refinements / 1,191 bits. Cumulative research JSON: 320,574,848 B.
- E0136: exact flat/tree agreement on 1,557 sampled partials, zero hits; flat 82.12 s vs. tree 248.21 s. Sample-specific, not population absence.
- E0137 [measure](https://github.com/sguzman/integrax/actions/runs/46035167115), [publication](https://github.com/sguzman/integrax/actions/runs/46039383995), [record revision](https://github.com/sguzman/integrax/commit/fc67f92ecc1b4b50283484c8da98dac218cb9e5e): three 25,143–27,457-byte pages; 30,964 nodes / 33,701 factors. Full inventory improved 12,507 objects / 332,140 overlapping residual bits. Flat/tree snapshots matched; 39.76 s vs. 101.65 s. Cumulative JSON 401,879,209 B.
- E0138 measurement [run](https://github.com/sguzman/integrax/actions/runs/46039527084) screened 27,104 partials: 113 refinements / 81 distinct values, four complete, 2,055 residual bits (110 parent rows). Measurement: 311.20 s, peak RSS 1,796,272 KiB. Publication failed because its workflow invoked the E0135 script; exact replay/readback remains pending. JSONL artifact retained on run 46039527084.

## Resume here
Resume with E0138 exact publication recovery: [failed publisher](https://github.com/sguzman/integrax/actions/runs/46040368795); workflow fix adds manual artifact-run dispatch and calls the E0138-specific validator. Then E0139 repeats the paired flat/tree comparison. Continue to larger page scales, competing indices and whole-integer storage accounting. Prior results show real lexical/mid-level reuse but adverse inventory-storage economics; no archive compression has been demonstrated. C20 remains active.

## On-demand context
Prior checkpoint through E0133: [archive](docs/history/STATE-through-E0133.md). Earlier compact checkpoint: [through E0128](docs/history/STATE-through-E0128.md). Full history through E0117: [archive](docs/history/STATE-through-E0117.md). Dashboard deployment unverified; no human action currently required.
