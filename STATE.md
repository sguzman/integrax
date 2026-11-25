# Continuation state

2026-11-25 — C01–C06 closed; C07 active. Read AGENTS.md and [C07](research/CAMPAIGN-07.md).

- F0002 IX05 487,166,368 B, isolated full reconstruction; gzip baseline 322,591,988 B. Archive-only.
- C06 closure: nine net bitplane gains only constant high bits; xorshift correction persisted.
- C07 [E0020](experiments/records/E0020.md): IXG1 arithmetic DAG, 9841 exhaustive round trips, 47667 nonoverlap count checks, 30 synthetic controls. Authentic E0021 and replay pending.
- Optional bounded width-barrier search retains best prefix and dominates monotone greedy along same trajectory. Independent Rust IXG1 decoder authored; comparison workflow (E0022 planned), unit tests and external authentic data pending. [Design note](notes/C07-width-barriers.md).

Next: inspect original DAG and lookahead workflows, preserve actual evidence and compare gzip. If useful, scale via Rust or investigate more expressive rules; no full-corpus gain claimed. Nix pin/dashboard live deployment unverified; E0008 replay optional. No workers.
