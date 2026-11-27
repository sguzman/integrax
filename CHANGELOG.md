# Changelog

## 2026-11-26 — E0127 factor propagation closure
Hosted closure propagated E0126 factors across 80,082 objects: 42 parent refinements / 30 distinct values, all witnessed in the new pages, removing 639 overlapping residual bits. Historical objects gained 526 bits of reduction, E0126 objects 113; no article gain, one 19-bit page/root value. Persisted 42 exact rows and provenance after independent product and witness checks. No archive compression claim.

## 2026-11-26 — E0128 and E0129 hosted chain
Three fresh 16,385–18,432-byte pages added 19,173 nodes and 3,346 factors (99,255 objects / 22,124 factors total). On the pages, child/global/full-inventory stages removed 27,518 / 43,051 / 213,702 residual bits incrementally; article savings were 34 bits and page savings zero. Automatic E0129 closure refined 45 parent rows / 35 values across historical and new objects, completed one cofactor, and removed 770 residual bits. Runtime 730.44 s for E0128 and 133.15 s for E0129; peak RSS 1,297,884 / 1,513,748 KiB. Cumulative research inventory JSON is 205,728,852 B (20.57% of corpus), not an archive.

## 2026-11-26 — E0130 factor-index comparison
First dispatch failed before measurement: 26,282 historical shard entries represented 22,124 unique factors. Deduplicated by factor value, then reran on 200 SHA-256-sorted residuals stratified across five object-width bands. Product-tree GCD and flat scans matched exactly; neither found a factor. On this sample flat scans took 11.59 s vs. 40.53 s for tree queries, despite 4,341,574 exact divisibility checks. The index JSON was 8,795,397 B. The result is a small one-run algorithm benchmark, not a full-population claim. [Record](experiments/records/E0130.json), [run](https://github.com/sguzman/integrax/actions/runs/45912716043).

## 2026-11-27 — E0131–E0133 scale and algorithm chain
E0131 added 19,547 nodes / 2,684 net factors at the 19,295–20,635-byte scale; child/global/full-index stages removed 14,360 / 59,992 / 204,273 bits. E0132 propagated factors across the 118,802-object inventory: 50 rows / 36 values, one cofactor completed, 895 bits removed. E0133 compared exact outputs on 913 stratified residuals: flat scan was 2.84× faster than product-tree GCD in one hosted run; neither found factors in the sample. Cumulative inventory JSON is 251,907,951 B (25.19% of corpus), not an archive. E0134–E0136 test direct scans and product trees on paired residuals at the next held-out scale, close newly found factors and repeat the comparison.

## 2026-11-26 — E0125 inventory saturation control
Hosted replay and rescreen of all 62,823 indexed objects using 16,081 factors found zero further refinements or residual bits removed after E0124 overlays; one cofactor had completed. Persisted the stratified summary. No compression result claimed.

## 2026-11-26 — E0126 page scale and inventory publication
Hosted expansion added 17,259 objects and 2,697 factors from three fresh 14,337–16,384-byte pages. Full-inventory reuse removed 186,263 residual bits across overlapping rows, with 20 article bits and zero page bits improved. Published 173 object shards, factor-index deltas, snapshots, and storage accounting after independent byte, factor-product, parent, snapshot, and index checks. No archive compression result claimed.

## 2026-11-26 — E0124 cumulative inventory closure
Hosted closure screened 9,826 partial objects, improving 29 parent rows (21 distinct values) and removing 515 residual bits across overlapping nodes; one cofactor completed. Persisted all 29 exact refinements and summary. Article residuals were unchanged; no compression result claimed.

## 2026-11-26 — E0123 larger held-out inventory scale
Hosted enwik9 run added 16,276 nested objects across three larger pages and 2,448 new factors. Published and verified the 62,823-object / 16,081-factor inventory. Frozen article/page residuals did not change; E0124 cumulative closure started automatically. No compression result claimed.

## 2026-11-26 UTC — F0013 accepted; C14/C15 closed
Hosted E0085 full isolated reconstruction: 232,493,451 B. Independent E0087 confirmed N=32Q with no prime <=997 dividing Q. C16 nontrivial factorization feasibility selected.

## 2026-11-25 — Return to public development and hosted CI
Owner authorized restoring the prior competition-restricted license and public GitHub Actions; prior MIT rights preserved. Prepared hosted E0085 workflow; repository settings and execution pending verification. Local tooling/cache retained as optional fallback.

## 2026-11-25 — Private development and local CI
Owner made repository private, restored MIT, and authorized local wrkflw/Nix CI using existing GitHub App. E0083 passed; E0084 independent replay selected for first local job.

## 2026-11-25 — F0012 accepted, C13 closed
Hierarchical IXB2 217,045,597 B, verified full isolated reconstruction; corrected verification script reproduced identical archive digest.

## 2026-11-25 — Development license changed
Owner-authorized source-available competition restriction; earlier MIT grants and third-party terms preserved. Separate eligible licensing required before Hutter Prize submission.

## 2026-11-25 — F0011 blockwise frontier
Accepted E0074/V0014 (220,113,320 B), isolated full reconstruction. Selected final C13 hierarchical blockwise candidate E0082.

## 2026-11-25 — C05 closed, C06 opened
C03 multiplicative and C05 rational controls showed no authentic slice savings; closed both with reproducible records. Opened finite-field recurrence campaign.

## 2026-11-25 — C04 closed, C03 opened
Accepted F0001/F0002 after isolated enwik9 reconstruction; conditional IX05 reduces archive to 487,166,368 bytes. Closed C04 and opened multiplicative structure campaign.

## 2026-11-25 — C02 closed, C04 opened
IX03 geometric templates, sparse corrections, exact cost/coverage bounds, 30 measured controls (E0003), negative authentic results and C02 closure. Opened mixed-radix/entropy-rank campaign. Full-corpus acquisition and baseline workflow launched.

## 2026-11-25 — C01 closed, C02 opened
Authentic Wikipedia slice controls (E0002), independently verified IX02 synthetic controls, C01 closure, C02 geometric-sum framework.

## 2026-11-25 — C01 first measurements
E0001 synthetic controls, IX02 oracle, format, density bound, independent Rust codec and acquisition scripts.

## 2026-11-25 — Bootstrap
Research ontology, campaigns, foundations, experiment protocols, frontier ledger, paper prospectus, IX01, CI and dashboard.
