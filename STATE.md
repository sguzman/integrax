# Continuation state

2026-11-25 — C01 active. Bootstrap verified; first control measurements completed and independently reproduced.

Read AGENTS.md and [C01](research/CAMPAIGN-01.md).

## Completed
- E0001: 20/20 synthetic IX02 round trips, 64–16,384 bytes; exact/near fourth-power archives 4,114/4,117 bytes at 16 KiB; random and repeated text 16,397 bytes. [Evidence](experiments/records/E0001.md). Source blob matches locally tested file.
- V0001: 20/20 identical independently encoded Rust archives and independent decoded byte comparisons passed. [CI evidence](experiments/records/E0001-verification.md). Dependency lock captured.
- [IX02 density bound](theory/IX02-density.md): uniform-input upper bound for net savings, elementary derivation.
- Published enwik8/enwik9 reference digests recorded; bounded acquisition script and authentic slice workflow authored, results pending.

## Next
Check authentic corpus controls workflow, preserve actual SHA-256 and measurements or failure. Check locked Rust CI. M1 full enwik9 acquisition and Nix lock remain pending; no direct container network or Nix. M3 evaluate evidence and scaling, close C01 with limitations; next candidate geometric sums (periodic integers) and sparse expressions. No need to repeat E0001.

Full-corpus frontier empty. Official record 100,424,672 bytes confirmed 2026-11-25; award target <99,420,425 bytes. Dashboard deployment unverified. No workers assigned.
