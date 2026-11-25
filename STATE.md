# Continuation state

2026-11-25 — C01–C09 closed; C10 active. Read AGENTS.md and [C10](research/CAMPAIGN-10.md).

- F0005 IXG2 383,314,419 B, isolated full reconstruction; gzip 322,591,988 B. Archive-only.
- E0038/E0039 verified dictionary contribution; fixed-strength backoff regressed. E0040 native context full [CI 45704723420](https://github.com/sguzman/integrax/actions/runs/45704723420), job 139523648030, running at last check.
- [E0041](experiments/records/E0041.md) 12/12 exact, 9 Rust tests, lexicographic two-byte context wins all 3 regions; 16 MiB 5,232,879 B (14.65% below gzip).
- [E0042](experiments/records/E0042.md) 90/90 independent BigInt/Rust archive equality and cross-decodes verified.
- E0043 full lexorder2 isolated workflow authored, pending.

Next: collect E0040/E0043 full evidence, promote only qualified improvements; investigate context depth or adaptive parsing based on measured value. Arithmetic termination integrity, Nix pin/dashboard deployment unverified. No workers.

E0044 deeper-context ablation (last 3 bytes vs previous original root ID, matched mode 7) authored in Rust; [theory](theory/deep-root-context.md). Nine authentic reconstructions planned, not yet verified. Independent oracle currently covers modes 3–8 only.
