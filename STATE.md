# Continuation state

2026-11-25 — C01–C06 closed; C07 active. Read AGENTS.md and [C07](research/CAMPAIGN-07.md).

- F0002 IX05 487,166,368 B, isolated full reconstruction; gzip 322,591,988 B. Archive-only.
- C07 E0022 verified 70 independent Rust decodes, best 16 KiB authentic 7880 B, still behind gzip.
- IXG2 global shared DAG Rust implementation, bounded trainer/trie, streamed fixed/Huffman roots. E0023 [CI 45702016570](https://github.com/sguzman/integrax/actions/runs/45702016570) running at checkpoint.
- Bounded exact weighted shortest-path parser, fixed-width optimum and four Huffman-model heuristic rounds, same archive format and actual-cost retention. [Theory](theory/weighted-root-parsing.md). E0024 workflow authored; tests/results pending.

Next: check both IXG2 workflows, fix defects and preserve measured E0023/E0024 evidence. Scale streaming or exact DP only when supported. Nix pin/dashboard deployment unverified; E0008 replay optional. No workers.
