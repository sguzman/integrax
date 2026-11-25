# Continuation state

2026-11-25 — C01–C09 closed; C10/C11 active. Read AGENTS.md, [C10](research/CAMPAIGN-10.md), [C11](research/CAMPAIGN-11.md).

- F0008 IXG2 **256,538,753 B** (74.35% reduction), [E0045/V0010](experiments/records/E0045.md) isolated full reconstruction; F0007 280,380,483 B, gzip 322,591,988 B. Archive-only. E0045 predates strict canonical decoder.
- E0058 16384-rule median tree strict isolated full [CI 45709706242](https://github.com/sguzman/integrax/actions/runs/45709706242), job 139540639867, running at checkpoint. E0055 history16 strict isolated full [CI 45709267554](https://github.com/sguzman/integrax/actions/runs/45709267554), job 139539166057, running.
- E0053 history16 improves all regions, 16 MiB 4,751,641 B. E0057 adaptive lengths 4,739,779 B; E0060 dual16 4,716,953 B. E0062 longer six/eight-byte contexts regress all regions; retain four-byte dual16. All authentic strict comparisons passed. E0064 combined recurrence/dictionary [CI 45711004123](https://github.com/sguzman/integrax/actions/runs/45711004123), queued. Two reused E0052 target regions, not new holdout.
- 310 independent Rust/BigInt archive equality/cross-decodes verified, modes 3–17, including E0059 exact distance boundary and [E0063](experiments/records/E0063.md) 40/40 longer-context cases. Nix pin/build verified; dashboard source contract verified, live deployment inaccessible/unverified. No settings changed.

Next: collect E0055/E0058/E0064, accept only isolated full improvements, close C10 after E0058; scale at most one combined recurrence candidate if justified. No workers.
