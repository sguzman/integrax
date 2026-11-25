# Continuation state

2026-11-25 — C01–C09 closed; C10 active. Read AGENTS.md and [C10](research/CAMPAIGN-10.md).

- F0007 IXG2 **280,380,483 B** (71.96% reduction), [E0043/V0009](experiments/records/E0043.md) isolated full reconstruction. F0006 319,996,416 B; gzip 322,591,988 B. Archive-only.
- [E0044](experiments/records/E0044.md) 9/9 exact, mode 9 wins all three regions; 16 MiB 4,913,044 B. E0045 full mode 9 [CI 45707004827](https://github.com/sguzman/integrax/actions/runs/45707004827), job 139531440365, running.
- E0042 and [E0046](experiments/records/E0046.md): 120 independent BigInt/Rust byte-identical archives and cross-decodes passed, modes 3–10.
- E0047 predictive-cost parsing (lambda 0/2/8) authored; first workflow 45707162172 has invalid shell file due to source-selection error. Corrected script in this commit, replacement CI pending. No measurement claimed.

Next: collect E0045/E0047, accept only isolated verified full improvements; assess parse/model structural gains. Arithmetic payload integrity, Nix pin/dashboard deployment unverified. No workers.
