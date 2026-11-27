# Continuation state — IntegraX

Updated 2026-11-27 UTC. Read [AGENTS.md](AGENTS.md) and this file first; no chat export is needed.

## Mission and constraints
C20 is active: discover rigorous arithmetic descriptions for large integers, especially enwik9, prioritizing whole-integer methods while allowing hierarchical/block controls. Owner delegated research direction and campaign selection. No spending, external submission, access or mission changes without approval. Hosted GitHub Actions on free standard runners is primary; use Nix; no owner-local compute required. Preserve competition-restricted development license and historical MIT grants. See [C20](research/CAMPAIGN-20.md), [campaign registry](research/README.md), [frontier](benchmarks/FRONTIER.md), and [hosted CI](docs/HOSTED-CI.md).

## Established context
- E0119–E0125 saturated 62,823 objects / 16,081 factors. E0124 found 29 parent refinements (515 bits; one complete); E0125 found no remaining gains. Details in [C20](research/CAMPAIGN-20.md).
- E0126 added 17,259 nodes / 2,697 factors from fresh 14,337–16,384-byte pages; 6,902 inventory hits yielded 186,263 additional residual bits. Article gain 20 bits, page gain 0.
- E0127 propagated those factors to 42 parents / 30 values, removing 639 bits; article gain 0, one page/root value saved 19 bits.
- E0128 [measure 45906421142](https://github.com/sguzman/integrax/actions/runs/45906421142) and publication [45907710069](https://github.com/sguzman/integrax/actions/runs/45907710069) passed. Three 16,385–18,432-byte pages added 19,173 rows / 3,346 factors (22,124 total); 7,832 full hits. Child/global/full stages removed 27,518 / 43,051 / 213,702 bits. Article gain 34 bits; page/root 0. 730.44 s / 1,297,884 KiB. Frozen E0123→E0126 controls saved 5,802 bits.
- E0129 measure [45907827003](https://github.com/sguzman/integrax/actions/runs/45907827003) and publication [45908116084](https://github.com/sguzman/integrax/actions/runs/45908116084) passed; readback [a54e8d4](https://github.com/sguzman/integrax/commit/a54e8d4d24ce205e2ec94e0fd8bcd9e11393ac0e). Across 99,255 objects, 45 parents / 35 values improved, saving 770 bits and completing one cofactor (493 historical, 277 E0128). No article/page gain. 133.15 s / 1,513,748 KiB.
- E0128 inventory JSON was 205,665,328 B; E0129 refinement adds 63,524 B, cumulative 205,728,852 B (20.57% of the 1 GB corpus). This research metadata excludes some reports/seeds and is not a compressed archive. No contest-total or compression claim.
- E0130 [run 45912716043](https://github.com/sguzman/integrax/actions/runs/45912716043) passed; record [0197b48](https://github.com/sguzman/integrax/commit/0197b48c4cf6a0d5f851d64dcad20a023d1a96f3). On 200/15,721 width-stratified residuals, flat scans and product-tree GCD matched exactly; neither found a factor. Flat 11.59 s vs. tree 40.53 s (3.50× faster); 4,341,574 tests; index JSON 8,795,397 B; 53.64 s / 255,472 KiB. Small one-run benchmark. Initial dispatch failed on duplicate shard entries (26,282 vs. 22,124 unique); de-duplication fixed it.
- [E0125](experiments/records/E0125.json), [E0126](experiments/records/E0126.json), [E0127](experiments/records/E0127.json), [E0128](experiments/records/E0128.json), [E0129](experiments/records/E0129.json), [E0130](experiments/records/E0130.json) contain exact evidence.

## Resume here
E0131 [run 45914266095](https://github.com/sguzman/integrax/actions/runs/45914266095) is running on free hosted CI; corpus/cache checks passed. It scans fresh 18,433–21,504-byte pages with 14 frozen inventories through E0128. Its publisher triggers E0132 residual closure, whose publisher triggers E0133 comparison on up to 1,000 stratified residuals. Continue to larger scales and full side-information accounting. Campaign not complete.

## On-demand context
Prior compact checkpoint through E0128 is archived at [STATE-through-E0128](docs/history/STATE-through-E0128.md). Full history through E0117: [archive](docs/history/STATE-through-E0117.md). Targeted records, source, and verified results stay in Git. Dashboard deployment unverified; no human action currently required.
