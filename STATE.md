# Continuation state

2026-11-25 — C01–C06 closed; C07 active. Read AGENTS.md and [C07](research/CAMPAIGN-07.md).

- F0003 IXG2 472,797,366 B (52.72% reduction), isolated full reconstruction, [E0025/V0005](experiments/records/E0025.md). F0002 IX05 487,166,368 B; gzip 322,591,988 B. Archive-only.
- E0023/E0024 global dictionary held-out: 12 and 20 exact comparisons, weighted Huffman improves 16MiB 8,019,886 -> 7,863,564 B. E0026 boundary DP oracle 36,846 exact paths.

Next: test larger and diversified global training dictionaries against matched held-out regions; prioritize structural gains. Bounded-memory weighted parser implementation conditional on opportunity; Nix pin/dashboard deployment unverified. No workers.

E0027 dictionary-capacity workflow authored: six global dictionaries at 1024/4096/8192 rule caps, contiguous vs diverse 64/256 KiB training, matched authentic regions. CI pending; no results claimed. All held-out regions are disjoint from training offsets.

E0028 file-backed weighted parser implemented in Rust (1 MiB computational partitions, global path, same IXG2 format); independent boundary tests and byte-identical in-memory archive comparison CI authored. Results pending. E0027 dictionary CI [45702720748](https://github.com/sguzman/integrax/actions/runs/45702720748) running at checkpoint.
