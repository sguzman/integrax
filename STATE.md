# Continuation state

2026-11-25 — C01–C06 closed; C07 active. Read AGENTS.md and [C07](research/CAMPAIGN-07.md).

- F0002 IX05 487,166,368 B, isolated full reconstruction; gzip 322,591,988 B. Archive-only.
- C07 E0022 verified 70 independent Rust decodes, best 16 KiB authentic 7880 B, still behind gzip.
- IXG2 [E0023](experiments/records/E0023.md): 12/12 authentic roundtrips, 3 Rust tests; global 1024-rule dictionary, Huffman 16 MiB held-out 8,019,886 B (52.20% reduction), 0.48s encode / 2788 KiB. Complete dictionary charged. No full result.
- E0024 weighted shortest-path parse [CI 45702174176](https://github.com/sguzman/integrax/actions/runs/45702174176), pending. E0025 full enwik9 isolated Huffman DAG workflow authored, pending.

Next: check E0024/E0025 CI, preserve evidence and promote full archive only if accepted and smaller. Evaluate weighted-parser benefit and possible scaling or different arithmetic structure. Nix pin/dashboard deployment unverified; E0008 replay optional. No workers.
