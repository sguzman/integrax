# Continuation state

2026-11-25 — C01–C09 closed; C10 active. Read AGENTS.md and [C10](research/CAMPAIGN-10.md).

- F0005 IXG2 **383,314,419 B** (61.67% reduction), [E0030/V0007](experiments/records/E0030.md) isolated full reconstruction. F0004 394,507,869 B; gzip 322,591,988 B. Archive-only. C07 [closure](research/CAMPAIGN-07-CLOSURE.md).
- C10 E0037 24/24 authentic hybrid comparisons; only marginal gain over xz in one region. [E0038](experiments/records/E0038.md) 9/9 authentic roundtrips, 7 Rust tests; 16 MiB context 5,746,766 B, 6.26% below gzip, 15.01% below Huffman.
- [E0039](experiments/records/E0039.md) 9/9 exact, dictionary reduces contextual 16 MiB archive by 29.12%; backoff strength 32 regresses all cases. E0040 native context full enwik9 [CI 45704723420](https://github.com/sguzman/integrax/actions/runs/45704723420), queued at checkpoint.

Next: collect E0039/E0040, promote only isolated verified full improvements, compare dictionary ablation and choose stronger model or structural pivot. Arithmetic termination integrity, Nix pin/dashboard deployment unverified. No workers.

E0041 modes 6–8 lexicographic root rank and tagged last-two-byte context ablation implemented; 12 held-out cases, [theory](theory/ordered-root-context.md), [CI 45705043869](https://github.com/sguzman/integrax/actions/runs/45705043869) running at checkpoint. No verified result yet. E0040 still running at last check.

E0042 independent BigInt root interval oracle: 90 synthetic exact roundtrips in V8; independent Rust archive equality/cross-decoding CI authored, pending.
