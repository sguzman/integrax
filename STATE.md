# Continuation state

2026-11-25 — C01–C12 closed; C13 active. Read AGENTS.md and [C13](research/CAMPAIGN-13.md).

- F0010 IXG2 **236,272,025 B** (76.37% reduction), [E0065/V0013](experiments/records/E0065.md) strict isolated full reconstruction; F0009 243,589,465 B, gzip 322,591,988 B. Archive-only.
- [C11 closed](research/CAMPAIGN-11-CLOSURE.md); E0065 passed, final expanded dictionary and dual recurrence accepted.
- [C12 closed](research/CAMPAIGN-12-CLOSURE.md): E0066 patch mixed; [E0068](experiments/records/E0068.md) adaptive correction wins all 3 regions, largest 4,712,831 B vs exact 4,716,953 B (0.087% gain). All strict, no full scale. Preserve mode19.
- 370 independent IXG2 Rust/BigInt archive equality/cross-decodes verified, modes 3–19. E0069 passed 20/20, E0067 40/40. Nix pin/build verified; dashboard source verified, live deployment inaccessible/unverified.
- C13 [radix context permutations](research/CAMPAIGN-13.md), IXB1 BWT/MTF/zero runs. E0070 independent naive reference passed 9841 strings/29523 frames. [E0070](experiments/records/E0070.md) 45/45 independent cross-codecs passed; [E0071](experiments/records/E0071.md) 36/36 exact, BWT+xz 4,378,540 B on 16 MiB (3.35% below raw xz, 7.17% below IXG2 dual16); external wrapped, sample only.

Next: collect E0074; independently verify IXB2 framing, accept full blockwise result only on isolated exact evidence. No workers.

[E0072](experiments/records/E0072.md) 6/6 exact and 6/6 append rejects; mode4 4,273,508 B on 16 MiB, wins all 3 regions vs E0071. E0074 IXB2 full native 16 MiB blockwise with raw fallback, strict isolated byte comparison authored. Initial CI 45713806361 contains a test fixture assumption identified by independent oracle (ascending 128 bytes actually encodes to 127 B); corrected fixture checks guaranteed three-byte raw tail. Corrected E0074 [CI 45713883869](https://github.com/sguzman/integrax/actions/runs/45713883869), queued at checkpoint. [Theory](theory/context-permutation-rank-coding.md). No performance claim; E0073 independent native rank reference 30 exact frames, 30 append rejects, 12 run bounds, all 29523 earlier frames reproduced; [CI 45713436133](https://github.com/sguzman/integrax/actions/runs/45713436133) passed 30/30 independent byte-identical frames and both-direction cross-decodes. IXB1 total 75 independent cross-codecs, separate from IXG2 370.

E0075 IXB2 independent reference 30 synthetic exact, 3448 truncation and 224 malformed rejects; variable block sizes and mixed raw/compressed tails. Rust cross-codec CI authored, pending.
