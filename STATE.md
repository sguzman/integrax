# Continuation state

2026-11-25 — C01–C06 closed; C07 active. Read AGENTS.md and [C07](research/CAMPAIGN-07.md).

- F0002 IX05 487,166,368 B, isolated full reconstruction; gzip 322,591,988 B. Archive-only.
- C07 E0022 verified 70 independent Rust decodes, best 16 KiB authentic 7880 B.
- IXG2 [E0023](experiments/records/E0023.md): 12/12 authentic roundtrips, 3 Rust tests; global 1024-rule dictionary, Huffman 16 MiB held-out 8,019,886 B, 0.48s encode / 2788 KiB. Complete dictionary charged.
- [E0024](experiments/records/E0024.md): 20/20 authentic roundtrips and 4 Rust tests; weighted parsing improved all five regions, largest 7,863,564 B (1.95% relative gain over greedy), encode 2.99s / 145544 KiB. No full weighted result.
- [E0026](experiments/records/E0026.md): boundary-conditioned exact DP oracle matched 36,846 full paths, 43,721 boundary crossings; external replay and streaming Rust implementation pending.
- E0025 full enwik9 isolated Huffman DAG [CI 45702295001](https://github.com/sguzman/integrax/actions/runs/45702295001), job 139515237585, measurement running at checkpoint.

Next: retrieve E0025 full run, promote only verified improvement. Implement bounded-memory weighted file parsing if worthwhile, compare against fixed DAG and gzip; prioritize significant structural gains rather than endless minor optimization. Nix pin/dashboard deployment unverified; E0008 replay optional. No workers.
