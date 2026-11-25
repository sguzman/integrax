# Continuation state

2026-11-25 — C01 and C02 closed; C04 active. Read AGENTS.md and [C04](research/CAMPAIGN-04.md).

## Completed
- C01: [closure](research/CAMPAIGN-01-CLOSURE.md); E0001/V0001 synthetic 20/20 independently reproduced; E0002 authentic 12/12 round trips, no gains.
- C02: [closure](research/CAMPAIGN-02-CLOSURE.md); [E0003](experiments/records/E0003.md) 30/30 exact round trips, three Rust tests, 64 KiB repeats 150 B and sparse mutations 918 B; 15/15 authentic slices raw. [Coverage bound](theory/IX03-cost-bound.md).
- Full enwik9 acquisition and published hashes passed; [E0004](experiments/records/E0004.md) gzip 322,591,988 B exact roundtrip, SHA-256 159b85351e5f76e60cbe32e04c677847a9ecba3adc79addab6f4c6c7aa3744bc.
- C04: [digit-rank theory](theory/digit-rank.md); IX04 static arithmetic-interval streaming implementation, format, tests and full-corpus CI authored. Execution pending; conventional coding baseline, not exact multinomial rank.

## Next
Check IX04 CI, fix defects if any, persist logs/digests/timing and verified full-corpus frontier entry only after exact comparison. Then investigate conditional models or mixed-radix enumerative rank, quantify overhead and compare to gzip. Nix pin and dashboard deployment pending. C03 remains candidate. No worker assigned.
