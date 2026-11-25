# Continuation state

2026-11-25 — C01–C06 closed; C07 active. Read AGENTS.md and [C07](research/CAMPAIGN-07.md).

- F0003 IXG2 **472,797,366 B** (52.72% reduction), isolated full reconstruction, [E0025/V0005](experiments/records/E0025.md). F0002 IX05 487,166,368 B; gzip 322,591,988 B. Archive-only.
- E0023/E0024 global dictionary held-out: 12 and 20 exact comparisons; weighted Huffman improves 16 MiB 8,019,886 -> 7,863,564 B. E0026 boundary DP oracle 36,846 exact paths.
- E0027 six global dictionaries, 1024/4096/8192 rule budgets, contiguous vs diverse training; all three measured regions disjoint from training. [CI 45702720748](https://github.com/sguzman/integrax/actions/runs/45702720748), job 139516709455, running at checkpoint. No results yet.
- E0028 file-backed weighted parser, 1 MiB computational partitions with exact global boundary costs. [CI 45702831871](https://github.com/sguzman/integrax/actions/runs/45702831871), job 139517084589, running at checkpoint; archive equality and reconstruction pending.

Next: retrieve E0027/E0028 logs, preserve measurements and evaluate larger dictionary and bounded-memory parser combinations. Promote full-corpus improvement only after isolated exact reconstruction. Prioritize significant structural gains rather than endless minor tuning. Nix pin/dashboard deployment unverified. No workers.
