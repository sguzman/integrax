# Continuation state

2026-11-25 — C01–C10 and C12 closed; C11/C13 active. Read AGENTS.md, [C11](research/CAMPAIGN-11.md), [C13](research/CAMPAIGN-13.md).

- F0009 IXG2 **243,589,465 B** (75.64% reduction), [E0055/V0011](experiments/records/E0055.md) strict isolated full reconstruction; F0008 256,538,753 B, gzip 322,591,988 B. Archive-only.
- E0065 expanded 16384-rule dual16 full [CI 45711961257](https://github.com/sguzman/integrax/actions/runs/45711961257), job 139548362535, running at checkpoint. Close C11 after final result; accept only a verified improvement over F0009.
- [C12 closed](research/CAMPAIGN-12-CLOSURE.md): E0066 patch mixed; [E0068](experiments/records/E0068.md) adaptive correction wins all 3 regions, largest 4,712,831 B vs exact 4,716,953 B (0.087% gain). All strict, no full scale. Preserve mode19.
- 370 independent IXG2 Rust/BigInt archive equality/cross-decodes verified, modes 3–19. E0069 passed 20/20, E0067 40/40. Nix pin/build verified; dashboard source verified, live deployment inaccessible/unverified.
- C13 [radix context permutations](research/CAMPAIGN-13.md), IXB1 BWT/MTF/zero runs. E0070 independent naive reference passed 9841 strings/29523 frames. [E0070](experiments/records/E0070.md) 45/45 independent cross-codecs passed; [E0071](experiments/records/E0071.md) 36/36 exact, BWT+xz 4,378,540 B on 16 MiB (3.35% below raw xz, 7.17% below IXG2 dual16); external wrapped, sample only.

Next: collect E0065/E0072/E0073; close C11, evaluate native rank performance and whether blockwise full-target control is justified. No workers.

E0072 IXB1 native rank interval modes3/4 authored (bucketed rank model, adaptive zero-run exponents), six exact authentic reconstructions and append rejects [CI 45713327312](https://github.com/sguzman/integrax/actions/runs/45713327312), running at checkpoint. [Theory](theory/context-permutation-rank-coding.md). No performance claim; E0073 independent native rank reference 30 exact frames, 30 append rejects, 12 run bounds, all 29523 earlier frames reproduced; [CI 45713436133](https://github.com/sguzman/integrax/actions/runs/45713436133), running at checkpoint.
