# Continuation state

2026-11-25 — C01–C09 closed; C10 active. Read AGENTS.md and [C10](research/CAMPAIGN-10.md).

- F0007 IXG2 **280,380,483 B** (71.96% reduction), [E0043/V0009](experiments/records/E0043.md) isolated full reconstruction. F0006 319,996,416 B; gzip 322,591,988 B. Archive-only.
- E0044 [deeper-context ablation](experiments/records/E0044.md) 9/9 exact, mode 9 wins all three regions; 16 MiB 4,913,044 B vs mode 7 5,232,879 B. E0045 full mode 9 workflow authored, pending.
- E0042 independent oracle modes 3–8 verified; modes 9/10 extension pending.

Next: independent deep predictor cross-codec tests, collect E0045, pursue structural improvements rather than indiscriminate depth. Arithmetic payload integrity, Nix pin/dashboard deployment unverified. No workers.

E0046 extended independent BigInt oracle to modes 9/10: 30 new synthetic roundtrips, all 90 prior observations reproduced. External cross-codec CI authored, pending.

E0047 predictive-cost parsing experiment authored: mode 9 greedy vs lambda 0/2/8 bits per root, same on-disk mode and decoder. 12 held-out comparisons pending. [Theory](theory/adaptive-root-parsing.md). E0045 full [CI 45707004827](https://github.com/sguzman/integrax/actions/runs/45707004827) running; E0046 cross-codec [CI 45707079222](https://github.com/sguzman/integrax/actions/runs/45707079222) queued at last check.
