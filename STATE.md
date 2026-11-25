# Continuation state

2026-11-25 — C01–C09 closed; C10 active. Read AGENTS.md and [C10](research/CAMPAIGN-10.md).

- F0006 IXG2 **319,996,416 B** (68.00% reduction), [E0040/V0008](experiments/records/E0040.md) isolated full reconstruction. First native full archive below gzip 322,591,988 B (2,595,572 B smaller). F0005 383,314,419 B. Archive-only.
- [E0041](experiments/records/E0041.md) 12/12 exact, 9 Rust tests, lexicographic two-byte context wins all 3 regions; 16 MiB 5,232,879 B (14.65% below gzip). [E0042](experiments/records/E0042.md) 90/90 independent BigInt/Rust archive equality and cross-decodes verified.
- E0043 full lexorder2 isolated [CI 45705343900](https://github.com/sguzman/integrax/actions/runs/45705343900), running at checkpoint.
- E0044 last-three-byte vs previous-root predictors [CI 45705431555](https://github.com/sguzman/integrax/actions/runs/45705431555), running at checkpoint; independent oracle currently modes 3–8 only.

Next: collect E0043/E0044, accept only isolated full improvements and assess deeper contexts/structural pivot. Arithmetic payload integrity, Nix pin/dashboard deployment unverified. No workers.
