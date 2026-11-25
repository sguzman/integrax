# Continuation state

2026-11-25 — C01–C06 closed; C07 active. Read AGENTS.md and [C07](research/CAMPAIGN-07.md).

- F0002 IX05 487,166,368 B, isolated full reconstruction; gzip 322,591,988 B. Archive-only.
- C07 E0022 verified 70 independent Rust decodes, best 16 KiB authentic 7880 B, still behind gzip.
- IXG2 global shared arithmetic DAG Rust implementation, bounded trainer/trie, two-pass streamed fixed/Huffman roots, format and cost theory authored. Held-out workflow E0023 pending; no measured results claimed.

Next: check IXG2 CI, fix defects if necessary, persist all six cases (12 roundtrips) and compare held-out size/time. If useful scale to authenticated enwik9 with isolated decoder; consider root conditional models or cost-aware parsing. Nix pin/dashboard live deployment unverified; E0008 replay optional. No workers.
