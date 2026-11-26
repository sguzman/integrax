# Continuation state — IntegraX

Updated 2026-11-26 UTC. Read [AGENTS.md](AGENTS.md) and this file first; no chat export is needed.

## Mission and constraints
C20 is active: discover rigorous arithmetic descriptions for large integers, especially enwik9, prioritizing whole-integer methods while allowing hierarchical/block controls. Owner delegated research direction and campaign selection. No spending, external submission, access or mission changes without approval. Hosted GitHub Actions on free standard runners is primary; use Nix; no owner-local compute required. Preserve competition-restricted development license and historical MIT grants. See [C20](research/CAMPAIGN-20.md), [campaign registry](research/README.md), [frontier](benchmarks/FRONTIER.md), and [hosted CI](docs/HOSTED-CI.md).

## Established context
- E0119–E0125 saturated a 62,823-object inventory at 16,081 factors; E0124 produced 29 parent refinements / 515 residual bits, then E0125 found none on remaining cofactors. Exact records and runs are linked in [C20](research/CAMPAIGN-20.md).
- E0126 added 17,259 nested nodes and 2,697 factors from three fresh 14,337–16,384-byte pages; 6,902 full-inventory hits yielded 186,263 extra residual bits after child/global reuse. Article values improved 20 bits; pages 0.
- E0127 propagated those factors to 42 historical/new parents (30 values), removing 639 residual bits; no article gain and one page/root value saved 19 bits.
- E0128 [measure 45906421142](https://github.com/sguzman/integrax/actions/runs/45906421142) and publication [45907710069](https://github.com/sguzman/integrax/actions/runs/45907710069) passed. Three held-out 16,385–18,432-byte pages added 19,173 rows / 3,346 factors (22,124 total); 7,832 full-inventory hits removed 213,702 bits after child/global stages, which removed 27,518 and 43,051 bits. Across these pages article reuse saved 34 bits; page and root 0. Runtime 730.44 s, peak RSS 1,297,884 KiB. Frozen inventory screens reduced residuals by 5,802 bits from E0123 to E0126 on identical objects.
- E0129 chained measure [45907827003](https://github.com/sguzman/integrax/actions/runs/45907827003) and publication [45908116084](https://github.com/sguzman/integrax/actions/runs/45908116084) passed; verified readback at [a54e8d4](https://github.com/sguzman/integrax/commit/a54e8d4d24ce205e2ec94e0fd8bcd9e11393ac0e). Replaying 22,124 factors over 99,255 objects refined 45 parent rows / 35 distinct values, removed 770 residual bits and completed one cofactor. Historical cohort: 493 bits; E0128 cohort: 277. Sentence/paragraph values account for 720 bits; no article, revision, page or page-root gains. Runtime 133.15 s, peak RSS 1,513,748 KiB.
- E0128 inventory JSON was 205,665,328 B; E0129 refinement adds 63,524 B, cumulative 205,728,852 B (20.57% of the 1 GB corpus). This research metadata excludes some reports/seeds and is not a compressed archive. No contest-total or compression claim.
- [E0125](experiments/records/E0125.json), [E0126](experiments/records/E0126.json), [E0127](experiments/records/E0127.json), [E0128](experiments/records/E0128.json), [E0129](experiments/records/E0129.json) contain exact evidence.

## Resume here
E0130 is an automatic follow-on after E0129 publication: compare direct flat factor scans with the balanced product-tree GCD index on deterministic, width-stratified residuals, requiring exact factor and cofactor agreement. Then continue C20 beyond the current 16–18 KB page scale with fresh larger held-out spans and frozen controls. Preserve witnesses, hashes, resource use and complete side-information cost; keep all computation on free hosted runners. Article/page effects remain weak empirically; do not infer universal bounds or claim archive compression. Campaign not complete.

## On-demand context
Prior compact checkpoint through E0128 is archived at [STATE-through-E0128](docs/history/STATE-through-E0128.md). Full history through E0117: [archive](docs/history/STATE-through-E0117.md). Targeted records, source, and verified results stay in Git. Dashboard deployment unverified; no human action currently required.
