# Continuation state

2026-11-25 — C01 and C02 closed; C04 active. Read AGENTS.md and [C04](research/CAMPAIGN-04.md).

## Completed
- C01: [closure](research/CAMPAIGN-01-CLOSURE.md); E0001/V0001 synthetic 20/20 independently reproduced; E0002 authentic 12/12 round trips, no gains.
- C02: [closure](research/CAMPAIGN-02-CLOSURE.md); E0003 30/30 exact round trips, 64 KiB repeats 150 B and sparse mutations 918 B; 15/15 authentic slices raw.
- Full enwik9 authenticated; [E0004](experiments/records/E0004.md) gzip 322,591,988 B exact roundtrip, SHA-256 159b85351e5f76e60cbe32e04c677847a9ecba3adc79addab6f4c6c7aa3744bc.
- IX04 static streaming arithmetic-interval implementation and full-corpus CI committed (80c5a5c6a106729be608c035fefe52f8c30ecfe9). [Run 45684549210](https://github.com/sguzman/integrax/actions/runs/45684549210) authenticated enwik9; measurement step in progress at checkpoint. Not yet accepted.
- [E0006](experiments/records/E0006.md): IXR1 exact histogram rank oracle, 3,280 exhaustive small strings and 20 controls round-tripped, 14 malformed inputs rejected in V8 isolate. No independent replay/hash/timing evidence yet. [Type-class cost bound](theory/digit-rank-cost.md).

## Next
Retrieve IX04 full-corpus run 45684549210, job 139453564870; preserve logs/digests/timing as E0005, promote frontier only after exact full comparison. Fix defects if needed. Then quantify actual entropy gap, test conditional arithmetic intervals or conditional rank. IXR1 is a bounded reference, not a scalable whole-corpus codec. Nix pin and dashboard deployment pending. C03 candidate. No workers assigned.
