# Continuation state

2026-11-25 — C01–C06 closed; C07 active. Read AGENTS.md and [C07](research/CAMPAIGN-07.md).

- F0002 IX05 487,166,368 B, isolated full reconstruction; gzip baseline 322,591,988 B. Archive-only.
- C06 closure: nine net bitplane gains only constant high bits; xorshift correction persisted.
- C07 E0020/E0021: 9841 exhaustive round trips, 47667 pair-count checks, 30 synthetic, 15 authentic; 12 authentic net gains. [E0022](experiments/records/E0022.md): width-barrier search improves 10/15 authentic slices; 35 matched cases and 70 independent Rust archive decodes, 3 Rust tests passed. Best 16 KiB authentic 7880 B, selected grammar archives still worse than gzip. No full-target result.

Next: implement [global shared DAG streaming design](notes/C07-streaming-design.md) in Rust; compare charged fixed-width and variable-length root stream and held-out data; scale only if evidence warrants. Nix pin/dashboard live deployment unverified; E0008 replay optional. No workers.
