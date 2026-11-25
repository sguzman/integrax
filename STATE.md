# Continuation state

2026-11-25 — C01–C12 closed; C13 active. Read AGENTS.md and [C13](research/CAMPAIGN-13.md).

- F0010 IXG2 **236,272,025 B** (76.37% reduction), [E0065/V0013](experiments/records/E0065.md) strict isolated full reconstruction; F0009 243,589,465 B, gzip 322,591,988 B. Archive-only.
- [C11 closed](research/CAMPAIGN-11-CLOSURE.md); E0065 passed, final expanded dictionary and dual recurrence accepted.
- [C12 closed](research/CAMPAIGN-12-CLOSURE.md): E0066 patch mixed; [E0068](experiments/records/E0068.md) adaptive correction wins all 3 regions, largest 4,712,831 B vs exact 4,716,953 B (0.087% gain). All strict, no full scale. Preserve mode19.
- 370 independent IXG2 Rust/BigInt archive equality/cross-decodes verified, modes 3–19. E0069 passed 20/20, E0067 40/40. Nix pin/build verified; dashboard source verified, live deployment inaccessible/unverified.
- C13 [radix context permutations](research/CAMPAIGN-13.md), IXB1 BWT/MTF/zero runs. E0070 independent naive reference passed 9841 strings/29523 frames. [E0070](experiments/records/E0070.md) 45/45 independent cross-codecs passed; [E0071](experiments/records/E0071.md) 36/36 exact, BWT+xz 4,378,540 B on 16 MiB (3.35% below raw xz, 7.17% below IXG2 dual16); external wrapped, sample only.

Next: collect E0074/E0080; accept full blockwise result only on isolated exact evidence, decide on one final combined blockwise candidate after E0074 and E0080. No workers.

[E0072](experiments/records/E0072.md) 6/6 exact and 6/6 append rejects; mode4 4,273,508 B on 16 MiB, wins all 3 regions vs E0071. E0074 IXB2 full native 16 MiB blockwise with raw fallback, strict isolated byte comparison authored. Initial CI 45713806361 contains a test fixture assumption identified by independent oracle (ascending 128 bytes actually encodes to 127 B); corrected fixture checks guaranteed three-byte raw tail. Corrected E0074 [CI 45713883869](https://github.com/sguzman/integrax/actions/runs/45713883869), running at checkpoint. [Theory](theory/context-permutation-rank-coding.md). No performance claim; E0073 independent native rank reference 30 exact frames, 30 append rejects, 12 run bounds, all 29523 earlier frames reproduced; [CI 45713436133](https://github.com/sguzman/integrax/actions/runs/45713436133) passed 30/30 independent byte-identical frames and both-direction cross-decodes. IXB1 total 75 independent cross-codecs, separate from IXG2 370.

E0075 IXB2 independent reference 30 synthetic exact, 3448 truncation and 224 malformed rejects; variable block sizes and mixed raw/compressed tails. Rust cross-codec [CI 45714196811](https://github.com/sguzman/integrax/actions/runs/45714196811) passed 30/30 byte-identical archives, both-direction cross-decodes, 254 malformed rejects, 5 Rust tests. IXB1/2 total 150 independent codec comparisons, IXG2 370.

[E0076](experiments/records/E0076.md) 9/9 exact and append rejects; mode5 wins all three regions (16 MiB 4,244,143 B, 0.687% below mode4), mode6 regresses all. [Theory](theory/rank-token-context.md). IXB2 remains mode4; independent new modes verified in E0077.

E0077 independent mode5/6 rank context reference 30/30 synthetic frames/append rejects, earlier 30 mode3/4 frames and 12 run bounds reproduced; [CI 45714477638](https://github.com/sguzman/integrax/actions/runs/45714477638) passed 30/30 independent byte-identical frames and both-direction cross-decodes.

[E0078](experiments/records/E0078.md) 9/9 exact fresh enwik9 comparisons, mode5 wins all three (6/6 across E0076/E0078); rank symbols account for ~70% of mode5 empirical comparator. [Theory](theory/rank-cost-decomposition.md). No wire change.

[E0079](experiments/records/E0079.md) 6/6 exact and append rejects; mode7 wins all three, aggregate 2,873,464 B vs mode5 2,892,508 B (0.658% gain), vs mode4 2,910,762 B (1.281% gain). [Theory](theory/rank-backoff.md). Independent mode7 verification passed E0080; no full gain claimed.

E0080 independent mode7 reference 15 exact frames/append rejects, 30 earlier context observations unchanged; Rust cross-codec [CI 45715148000](https://github.com/sguzman/integrax/actions/runs/45715148000) passed 15/15 independent byte-identical frames and both-direction cross-decodes.

E0081 IXB2 tag2 mode7 extension authored; default mode4 byte format unchanged. Independent reference 30 exact, 3456 truncation and 236 malformed rejects, prior E0075 reproduced. [External CI 45715504252](https://github.com/sguzman/integrax/actions/runs/45715504252), in_progress at checkpoint. Final full candidate not yet launched; E0074 baseline still running.
