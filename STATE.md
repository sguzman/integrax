# Continuation state

2026-11-25 — C01–C09 closed; C10/C11 active. Read AGENTS.md, [C10](research/CAMPAIGN-10.md), [C11](research/CAMPAIGN-11.md).

- F0008 IXG2 **256,538,753 B** (74.35% reduction), [E0045/V0010](experiments/records/E0045.md) isolated full reconstruction; F0007 280,380,483 B, gzip 322,591,988 B. Archive-only. E0045 predates strict canonical decoder.
- [E0052](experiments/records/E0052.md) 10/10 strict, 16384-rule median tree wins both new target regions (1.59%, 1.45% below baseline). E0058 strict isolated full selected configuration authored, pending.
- [E0053](experiments/records/E0053.md) 9/9 strict, history16 wins all 3 regions; 16 MiB 4,751,641 B vs median 4,896,315 B, 1,028,505 bytes recurrence-generated (6.13%). E0055 full history16 strict isolated [CI 45709267554](https://github.com/sguzman/integrax/actions/runs/45709267554), running at last check.
- E0042/E0046/E0051/[E0054](experiments/records/E0054.md): 186 independent Rust/BigInt archive equality and cross-decodes verified; independent recurrence ring wrap still pending.
- Nix pin/build verified; dashboard source contract verified, live deployment inaccessible/unverified. No settings changed.

Next: collect E0055/E0056/E0057/E0058, close C10 after final combined full run. C11 assess predictor and charged length model, independent long ring wrap control. No workers.

E0056 adaptive length reference 36 synthetic + 2 ring-wrap periodic exact cases; 36 earlier mode13 observations unchanged. E0057 authentic mode14 vs mode13 length comparison authored. Both CI pending; independent max-distance boundary not established. [Theory](theory/recurrence-length-coding.md).
