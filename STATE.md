# Continuation state

2026-11-25 — C01–C09 closed; C10 active. Read AGENTS.md and [C10](research/CAMPAIGN-10.md).

- F0005 IXG2 **383,314,419 B** (61.67% reduction), [E0030/V0007](experiments/records/E0030.md) isolated full reconstruction. F0004 394,507,869 B; gzip 322,591,988 B. Archive-only. C07 [closure](research/CAMPAIGN-07-CLOSURE.md).
- C10 E0037 24/24 authentic hybrid comparisons; only marginal gain over xz in one region. [E0038](experiments/records/E0038.md) 9/9 authentic roundtrips, 7 Rust tests; 16 MiB context 5,746,766 B, 6.26% below gzip, 15.01% below Huffman.
- E0039 hierarchical backoff/zero-rule ablation [CI 45704628771](https://github.com/sguzman/integrax/actions/runs/45704628771), running at checkpoint. E0040 native context full enwik9 [CI 45704723420](https://github.com/sguzman/integrax/actions/runs/45704723420), queued at checkpoint.

Next: collect E0039/E0040, promote only isolated verified full improvements, compare dictionary ablation and choose stronger model or structural pivot. Arithmetic termination integrity, Nix pin/dashboard deployment unverified. No workers.
