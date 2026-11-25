# Continuation state

2026-11-25 — C01–C09 closed; C10/C11 active. Read AGENTS.md, [C10](research/CAMPAIGN-10.md), [C11](research/CAMPAIGN-11.md).

- F0008 IXG2 **256,538,753 B** (74.35% reduction), [E0045/V0010](experiments/records/E0045.md) isolated full reconstruction; F0007 280,380,483 B, gzip 322,591,988 B. Archive-only. E0045 predates strict canonical decoder.
- E0052 combined dictionary/tree target-slice [CI 45708673006](https://github.com/sguzman/integrax/actions/runs/45708673006), job 139537120640, running at last check.
- [E0053](experiments/records/E0053.md) 9/9 strict, history16 wins all 3 regions; 16 MiB 4,751,641 B vs median 4,896,315 B, 1,028,505 bytes recurrence-generated (6.13%). E0055 full history16 strict isolated [CI 45709267554](https://github.com/sguzman/integrax/actions/runs/45709267554), queued at checkpoint.
- E0042/E0046/E0051/[E0054](experiments/records/E0054.md): 186 independent Rust/BigInt archive equality and cross-decodes verified; independent recurrence ring wrap still pending.
- Nix pin/build verified; dashboard source contract verified, live deployment inaccessible/unverified. No settings changed.

Next: collect E0052/E0055, choose combined model only on actual evidence, close C10 after resolving combined ablation. C11 assess predictor and charged length model, independent long ring wrap control. No workers.
