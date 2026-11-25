# Continuation state

2026-11-25 — C01–C06 closed; C07 active. Read AGENTS.md and [C07](research/CAMPAIGN-07.md).

- F0003 IXG2 472,797,366 B, isolated full reconstruction; gzip 322,591,988 B. Archive-only.
- E0027 [dictionary sweep](experiments/records/E0027.md): 18/18 passed; 8192 diverse rules 6,761,528 B on 16 MiB vs 8,019,886 B baseline. 4096 contiguous wins 1 MiB controls.
- E0028 [file-backed weighted parser](experiments/records/E0028.md): 12/12 exact reconstructions, six matching archive pairs; 16 MiB peak encoder memory 145628 -> 14060 KiB.
- E0029/E0030 full enwik9 greedy and weighted 8192 diverse dictionary matrix [CI 45703123838](https://github.com/sguzman/integrax/actions/runs/45703123838), queued at checkpoint, revision 79f5da140a04ca4f62207c30acebb3151ff52b8a. Exact sample/dictionary hashes checked against E0027, all costs charged, isolated decode with separate dictionary removed.

Next: retrieve full-large workflow status/logs, persist measured E0029/E0030 and promote only verified improvements. Evaluate marginal gains then pursue structural improvement or close C07/pivot. Nix pin/dashboard deployment unverified. No workers.

C08 opened in parallel with C07 full-run measurement: [E0031](experiments/records/E0031.md) fixed CRT grammar, 65536 exhaustive two-byte checks and 24 synthetic roundtrips executed in V8 isolate. [Theory](theory/crt-residue-cost.md). E0032 authentic replay workflow authored, pending. Next retrieve C07 and CRT evidence; no new full-target result.

E0033 independent generic CRT reconstruction 4096 checks, 12 full-width synthetic controls and 37 malformed rejects; executed in V8, external replay pending. C07 matrix jobs 139518095288 (huff), 139518094677 (streamopthuff) in progress; C08 authentic [CI 45703312599](https://github.com/sguzman/integrax/actions/runs/45703312599) queued at checkpoint.
