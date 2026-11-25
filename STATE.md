# Continuation state

2026-11-25 — C01–C06, C08, C09 closed; C07 and C10 active. Read AGENTS.md and [C07](research/CAMPAIGN-07.md), [C10](research/CAMPAIGN-10.md).

- F0004 IXG2 394,507,869 B, isolated full reconstruction; gzip 322,591,988 B. Archive-only.
- E0030 weighted 8192-rule [CI 45703123838](https://github.com/sguzman/integrax/actions/runs/45703123838), job 139518094677, running at last check.
- C10 [E0037](experiments/records/E0037.md) 24/24 authentic, only 1/18 hybrid improvements (1648 B over direct xz on 16 MiB). No full result.
- E0038 native IXG2 adaptive binary intervals with optional previous-final-byte context, same DAG and parse; complete self-contained frame, no transmitted model. Rust code, schema, theory and [CI 45704407640](https://github.com/sguzman/integrax/actions/runs/45704407640) running at checkpoint. Not yet verified; arithmetic payload termination not strict canonical/integrity validation.

Next: collect E0030 and E0038 evidence, repair if needed, scale only meaningful gains, close C07 when evaluated. Nix pin/dashboard deployment unverified. No workers.

E0039 native hierarchical backoff mode 5 and zero-rule ablation authored; [theory](theory/root-backoff.md). Nine held-out archive tests planned. Code/CI not yet verified; E0030/E0038 still running at last check.
