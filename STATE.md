# Continuation state

2026-11-25 — C01 active. Bootstrap verified; first control measurements completed.

Read AGENTS.md and [C01](research/CAMPAIGN-01.md).

## Completed
- E0001: arbitrary-precision IX02 oracle (Node standard library, no npm); 20/20 synthetic round trips, 64–16,384 bytes. Largest exact/near fourth-power archives 4,114/4,117 bytes; random and repeated text 16,397 bytes. [Evidence](experiments/records/E0001.md).
- [IX02 density bound](theory/IX02-density.md): uniform-input upper bound for net savings under the fixed serialization. Elementary derivation, not novelty.
- Bootstrap Rust CI passed (run 45680262853).

## Next
M1 corpus and Nix lock still pending: container has no Rust/Nix or direct network. Seek official corpus via a reproducible, bounded CI/manual acquisition route without committing corpus; if inaccessible, use labeled controls and continue. M2 port IX02 to Rust arbitrary precision; cross-check deterministic archive hashes against E0001 and measure independent decoder. M3 evaluate authentic corpus prefixes if available, scale and close C01 with evidence. Next candidate: geometric sums (periodic integers) and sparse expressions; not yet active.

Full-corpus frontier remains empty. Official reference 100,424,672 bytes confirmed from https://prize.hutter1.net/ on 2026-11-25; award target <99,420,425 bytes. Dashboard deployment unverified. No workers assigned. 
