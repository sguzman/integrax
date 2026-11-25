# Continuation state

2026-11-25 — C01–C06 closed; C07 active. Read AGENTS.md and [C07](research/CAMPAIGN-07.md).

- F0002 IX05 487,166,368 B, isolated full reconstruction; gzip baseline 322,591,988 B. Archive-only.
- C06 closure: nine net bitplane gains only constant high bits; xorshift correction persisted.
- C07 [E0020](experiments/records/E0020.md): IXG1 arithmetic DAG, 9841 exhaustive round trips, 47667 nonoverlap count checks, 30 synthetic controls. [E0021](experiments/records/E0021.md) replay and authentic 15/15 roundtrips passed; 12 net reductions, best 16KiB archive 9639 B; selected frames all worse than gzip.
- Optional bounded width-barrier search retains best prefix and dominates monotone greedy along same trajectory. Independent Rust IXG1 decoder authored; comparison workflow [45701303041](https://github.com/sguzman/integrax/actions/runs/45701303041), job 139511795182, running; unit tests and external authentic data pending. [Design note](notes/C07-width-barriers.md).

Next: inspect lookahead workflow, preserve E0022 actual evidence and compare gzip. If useful, scale via Rust or investigate more expressive rules; no full-corpus gain claimed. Nix pin/dashboard live deployment unverified; E0008 replay optional. No workers.
