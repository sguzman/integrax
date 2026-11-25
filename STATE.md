# Continuation state

2026-11-25 — C01–C05 closed; C06 active. Read AGENTS.md and [C06](research/CAMPAIGN-06.md).

## Verified
- F0002 IX05 487,166,368 B, isolated full reconstruction; gzip baseline 322,591,988 B. Archive-only.
- C05 [E0014](experiments/records/E0014.md): E0013 replay passed, 15/15 authentic roundtrips, zero gains. [Closure](research/CAMPAIGN-05-CLOSURE.md).
- C06 [E0015](experiments/records/E0015.md): 24 synthetic controls, 3280 exhaustive minimum-degree and roundtrip checks, 60 malformed rejects in V8. [Theory](theory/finite-field-recurrence.md). Authentic E0016/replay pending.

## Next
Check recurrence workflow; preserve E0016 measurements and hashes or diagnose failure. Consider sparse residual recurrence on structured sequences only if warranted; otherwise close and pursue C07 arithmetic circuits or C09 reversible transforms. Nix pin/dashboard deployment unverified, E0008 replay optional. No workers.
