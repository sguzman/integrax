# Continuation state

2026-11-25 — C01–C10 closed; C11/C12 active. Read AGENTS.md, [C11](research/CAMPAIGN-11.md), [C12](research/CAMPAIGN-12.md).

- F0009 IXG2 **243,589,465 B** (75.64% reduction), [E0055/V0011](experiments/records/E0055.md) strict isolated full reconstruction; F0008 256,538,753 B, gzip 322,591,988 B. Archive-only.
- [E0058/V0012](experiments/records/E0058.md) 249,849,857 B strict isolated full, above F0009; [C10 closed](research/CAMPAIGN-10-CLOSURE.md).
- E0053 history16 improves all regions, 16 MiB 4,751,641 B. E0057 adaptive lengths 4,739,779 B; E0060 dual16 4,716,953 B. E0062 longer six/eight-byte contexts regress all regions; retain four-byte dual16. All authentic strict comparisons passed. [E0064](experiments/records/E0064.md) 10/10 strict, larger training plus dual recurrence wins both reused target regions. 16384-rule dual chosen for full E0065 based on smaller payload in both regions and one-time dictionary cost. E0065 [CI 45711961257](https://github.com/sguzman/integrax/actions/runs/45711961257), in_progress at checkpoint.
- 310 independent Rust/BigInt archive equality/cross-decodes verified, modes 3–17, including E0059 exact distance boundary and [E0063](experiments/records/E0063.md) 40/40 longer-context cases. Nix pin/build verified; dashboard source contract verified, live deployment inaccessible/unverified. No settings changed.

Next: collect E0065 strict isolated full result; accept only an improvement over F0009. C12 opened alongside final C11 test; collect E0066 and assess sparse corrections. No workers.

E0066 mode18 sparse-corrected recurrence authored, one charged correction position/value and adaptive flag, [CI 45712181728](https://github.com/sguzman/integrax/actions/runs/45712181728), in_progress at checkpoint. [Theory](theory/sparse-corrected-recurrences.md). Independent oracle covers through mode17 only.

E0067 independent mode18 reference: 40/40 exact synthetic cases, prior 80 mode15–17 observations unchanged; [CI 45712332816](https://github.com/sguzman/integrax/actions/runs/45712332816), queued at checkpoint.
