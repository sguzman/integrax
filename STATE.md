# Continuation state

2026-11-25 — C01–C09 closed; C10 active. Read AGENTS.md and [C10](research/CAMPAIGN-10.md).

- F0007 IXG2 **280,380,483 B** (71.96% reduction), [E0043/V0009](experiments/records/E0043.md) isolated full reconstruction; gzip 322,591,988 B. Archive-only.
- E0044 mode 9 wins all three regions, 16 MiB 4,913,044 B. E0045 full mode 9 [CI 45707004827](https://github.com/sguzman/integrax/actions/runs/45707004827), job 139531440365, running at checkpoint.
- E0042/E0046: 120 independent Rust/BigInt byte-identical archives and cross-decodes passed, modes 3–10.
- E0047 predictive-cost parsing replacement [CI 45707225774](https://github.com/sguzman/integrax/actions/runs/45707225774), job 139532178843, running. Initial invalid shell script run 45707162172 failed and was corrected; no result claimed.
- E0048 optional strict canonical arithmetic decoding and append rejection [CI 45707458341](https://github.com/sguzman/integrax/actions/runs/45707458341), job 139532965420, running. [Proof](theory/canonical-root-intervals.md); no archive overhead, not authentication.
- Nix lock generation and build [CI 45707565821](https://github.com/sguzman/integrax/actions/runs/45707565821), job 139533331756, running. No lock persisted yet. [Notes](notes/nix-reproducibility.md). Pages settings API unavailable; no settings changed.

Next: collect E0045/E0047/E0048 evidence, accept only isolated verified full improvements; retrieve successful Nix lock output and commit exact lock, then rerun pinned. Assess parsing/model structural gains. Dashboard live deployment unverified. No workers.
