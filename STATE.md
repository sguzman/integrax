# Continuation state

2026-11-25 — C01–C09 closed; C10/C11 active. Read AGENTS.md, [C10](research/CAMPAIGN-10.md), [C11](research/CAMPAIGN-11.md).

- F0008 IXG2 **256,538,753 B** (74.35% reduction), [E0045/V0010](experiments/records/E0045.md) isolated full reconstruction; F0007 280,380,483 B, gzip 322,591,988 B. Archive-only. E0045 predates strict canonical decoder.
- [E0052](experiments/records/E0052.md) 10/10 strict, 16384-rule median tree wins both new target regions (1.59%, 1.45% below baseline). E0058 strict isolated full [CI 45709706242](https://github.com/sguzman/integrax/actions/runs/45709706242), in_progress at checkpoint.
- [E0053](experiments/records/E0053.md) 9/9 strict, history16 wins all 3 regions; 16 MiB 4,751,641 B vs median 4,896,315 B, 1,028,505 bytes recurrence-generated (6.13%). E0055 full history16 strict isolated [CI 45709267554](https://github.com/sguzman/integrax/actions/runs/45709267554), running at last check.
- E0042/E0046/E0051/[E0054](experiments/records/E0054.md): 224 independent Rust/BigInt archive equality and cross-decodes verified including E0056; two long periodic fixtures crossed ring capacity. Independent maximum-distance boundary still pending.
- Nix pin/build verified; dashboard source contract verified, live deployment inaccessible/unverified. No settings changed.

Next: collect E0055/E0056/E0057/E0058, close C10 after final combined full run. C11 assess predictor and charged length model, independent long ring wrap control. No workers.

[E0056](experiments/records/E0056.md) 38/38 independent strict cross-codec passed, mode14 adaptive length, including two ring-wrap cases. [E0057 CI 45709612402](https://github.com/sguzman/integrax/actions/runs/45709612402) in progress at last check; independent max-distance boundary not established. [Theory](theory/recurrence-length-coding.md).

E0059 exact distance boundary (W-1,W,W+1) independent reference 6/6 synthetic exact, trace confirms inclusive W and rejects stale W+1. Rust cross-codec/direct ring test authored, pending.
