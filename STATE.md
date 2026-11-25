# Continuation state

2026-11-25 — C01 closed; C02 active. Read AGENTS.md and [C02](research/CAMPAIGN-02.md).

## Completed
- C01: [closure](research/CAMPAIGN-01-CLOSURE.md). E0001/V0001: 20 synthetic round trips independently reproduced. E0002: 12 authentic enwik8 slices exact round trips; IX02 raw fallback every time, gzip wins all. Published MD5/SHA-1 verified; SHA-256 2b49720ec4d78c3c9fabaee6e4179a5e997302b3a70029f30f2d582218c024a8. Locked Rust cross-check CI passed.
- C02: [geometric sum identity and modal correction lemma](theory/geometric-sums.md). Rust IX03 codec, format, synthetic/authentic runner, [cost and coverage bounds](theory/IX03-cost-bound.md) authored. Corrected candidate-pruning lower bound at 0be5a31245138b12ae2daaffac94c32ae10313ca. Authoritative corrected [IX03 run 45682142546](https://github.com/sguzman/integrax/actions/runs/45682142546), pending at last observation.
- Full enwik9 acquisition and gzip baseline workflow authored; [run 45682118817](https://github.com/sguzman/integrax/actions/runs/45682118817), pending at last observation.

## Next
Inspect IX03 geometric controls and full corpus conventional baseline workflows, preserve logs/records or repair failures. C02 M2: analyze cost, scaling and limitations; pivot if periodic structure fails on authentic slices. Nix lock pending; dashboard deployment unverified. No full-target Integrax record. No worker assigned.
