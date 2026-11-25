# Continuation state

2026-11-25 — C01–C06 closed; C07 active. Read AGENTS.md and [C07](research/CAMPAIGN-07.md).

- F0003 IXG2 472,797,366 B, isolated full reconstruction; gzip 322,591,988 B. Archive-only.
- E0027 [dictionary sweep](experiments/records/E0027.md): 18/18 passed; 8192 diverse rules 6,761,528 B on 16 MiB vs 8,019,886 B baseline. 4096 contiguous wins 1 MiB controls.
- E0028 [file-backed weighted parser](experiments/records/E0028.md): 12/12 exact reconstructions, six matching archive pairs; 16 MiB peak encoder memory 145628 -> 14060 KiB.
- E0029/E0030 full enwik9 greedy and weighted 8192 diverse dictionary matrix workflow authored, pending. Exact sample/dictionary hashes checked against E0027, all costs charged, isolated decode with separate dictionary removed.

Next: retrieve full-large workflow status/logs, persist measured E0029/E0030 and promote only verified improvements. Evaluate marginal gains then pursue structural improvement or close C07/pivot. Nix pin/dashboard deployment unverified. No workers.
