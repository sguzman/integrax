# Continuation state

2026-11-25 — C01–C06 and C08 closed; C07 and C09 active. Read AGENTS.md and [C07](research/CAMPAIGN-07.md), [C09](research/CAMPAIGN-09.md).

- F0004 IXG2 394,507,869 B, isolated full reconstruction; gzip 322,591,988 B. Archive-only.
- E0030 full enwik9 weighted 8192-rule [CI 45703123838](https://github.com/sguzman/integrax/actions/runs/45703123838), job 139518094677, running at last check. No result claimed.
- E0034: 1,835,008 exhaustive IXT1 inversions and 589,824 BigInt identities, 420 synthetic frame tests. E0035 [authentic sweep](experiments/records/E0035.md): 168/168 exact round trips, 162/162 nonidentity candidates worse than gzip. No full-target gain.
- E0036: 576 long BigInt identities (488 nontrivial lags), 1792 inversions; independent Rust codec CI [45703775056](https://github.com/sguzman/integrax/actions/runs/45703775056), in_progress at checkpoint.

Next: collect E0030 and E0036, promote only isolated verified improvement, close finite-difference C09. Evaluate C07 structural limits and C10 hybrid root-context modeling. Nix pin/dashboard deployment unverified. No workers.
