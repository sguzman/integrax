# Continuation state

2026-11-25 — C01 and C02 closed; C04 active. Read AGENTS.md and [C04](research/CAMPAIGN-04.md).

## Completed
- C01: [closure](research/CAMPAIGN-01-CLOSURE.md); E0001/V0001 synthetic 20/20 independently reproduced; E0002 authentic 12/12 round trips, no gains.
- C02: [closure](research/CAMPAIGN-02-CLOSURE.md); [E0003](experiments/records/E0003.md) 30/30 exact round trips, three Rust tests, 64 KiB repeats 150 B and sparse mutations 918 B; 15/15 authentic slices raw. [Coverage bound](theory/IX03-cost-bound.md).
- Full enwik9 acquisition, published MD5/SHA-1 and enwik8 prefix check passed in [run 45682118817](https://github.com/sguzman/integrax/actions/runs/45682118817); gzip full corpus step in progress at last observation. Preserve measured full target SHA-256, baseline size, runtime, memory and verification after workflow completion. No full-target record yet.
- C04 opened; [digit-rank theory](theory/digit-rank.md).

## Next
Check full baseline run; then C04 M1: practical streaming digit rank or entropy-coded interval implementation with complete framing and exact reconstruction, compare real data and synthetic controls; scale to enwik9. C03 remains candidate. Nix pin pending; dashboard deployment unverified. No worker assigned.
