# Continuation state

2026-11-25 — C01–C09 closed; C10 active. Read AGENTS.md and [C10](research/CAMPAIGN-10.md).

- F0007 IXG2 **280,380,483 B** (71.96% reduction), [E0043/V0009](experiments/records/E0043.md) isolated full reconstruction; gzip 322,591,988 B. Archive-only.
- E0044 mode 9 wins all three regions, 16 MiB 4,913,044 B. E0045 full mode 9 [CI 45707004827](https://github.com/sguzman/integrax/actions/runs/45707004827), job 139531440365, running at checkpoint.
- E0042/E0046: 120 independent Rust/BigInt byte-identical archives and cross-decodes passed, modes 3–10.
- [E0047](experiments/records/E0047.md) 12/12 exact, all nine predictive-cost cases regress; greedy retained. Initial script defect corrected, successful CI 45707225774.
- E0048 optional strict canonical arithmetic decoding and append rejection [CI 45707458341](https://github.com/sguzman/integrax/actions/runs/45707458341), job 139532965420, running. [Proof](theory/canonical-root-intervals.md); no archive overhead, not authentication.
- Nix lock generation/build [CI 45707565821](https://github.com/sguzman/integrax/actions/runs/45707565821) passed, 12/12 tests; exact generated flake.lock persisted. Pinned rerun pending. [Notes](notes/nix-reproducibility.md). Pages settings API unavailable; no settings changed.

Next: collect E0045/E0048 evidence, accept only isolated verified full improvements; verify pinned Nix rerun. Pivot from local ratio parsing; assess structural model gains. Dashboard live deployment unverified. No workers.
