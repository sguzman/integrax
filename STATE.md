# Continuation state

2026-11-25 — C01–C09 closed; C10 active. Read AGENTS.md and [C10](research/CAMPAIGN-10.md).

- F0007 IXG2 **280,380,483 B** (71.96% reduction), [E0043/V0009](experiments/records/E0043.md) isolated full reconstruction; gzip 322,591,988 B. Archive-only.
- E0045 full third-order [CI 45707004827](https://github.com/sguzman/integrax/actions/runs/45707004827), job 139531440365, running at last check.
- E0047 all local cost-ratio parses regressed; retain greedy. E0048 strict decode 12/12 and 18/18 append rejects, not authentication.
- [E0049](experiments/records/E0049.md) 9/9 strict, 16 MiB 4,849,686 B larger 16384-rule dictionary; [E0050](experiments/records/E0050.md) 9/9 strict, median tree 4,896,315 B. Gains modest; leading-digit tree regressed.
- E0042/E0046/[E0051](experiments/records/E0051.md): 150 independent archive equality/cross-decodes passed across modes 3–12.
- E0052 combined dictionary/median tree target-slice ablation [CI 45708673006](https://github.com/sguzman/integrax/actions/runs/45708673006), in_progress at checkpoint. [Design](notes/C10-combined-target-slices.md).
- Nix pin/build verified (CI 45707850743); dashboard source contract tested, live deployment inaccessible/unverified. No settings changed.

Next: retrieve E0045/E0052; accept only isolated full improvements, scale strongest combined candidate if justified. Avoid unnecessary minor tuning; consider structurally distinct next campaign. No workers.
