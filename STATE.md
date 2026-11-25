# Continuation state

2026-11-25 — C01/C02 closed; C04 active. Read AGENTS.md and [C04](research/CAMPAIGN-04.md).

## Completed
- C01/C02 closed: negative authentic near-power/geometric-template results, positive synthetic controls.
- Full enwik9 authenticated; [E0004](experiments/records/E0004.md) gzip 322,591,988 B exact roundtrip.
- [E0005](experiments/records/E0005.md) IX04 full enwik9 roundtrip passed: 644,708,597 B, 35.53% reduction; 41.63 s encode, 48.92 s decode. V0002 byte equality and hash verified, OS isolation pending; provisional dashboard/ledger entry.
- [E0006](experiments/records/E0006.md): IXR1 exact histogram rank, 3,280 exhaustive and 20 synthetic roundtrips, 14 malformed rejects. [Replay CI](https://github.com/sguzman/integrax/actions/runs/45685607169) pending at checkpoint.
- IX05 first-order conditional interval codec, format, [entropy and quantization bounds](theory/conditional-digit-intervals.md). [Full isolated corpus CI](https://github.com/sguzman/integrax/actions/runs/45685540601), job 139457047569, authenticated corpus and measurement in progress at checkpoint; no result claimed.
- [E0008](experiments/records/E0008.md): exact Markov transition class formula tested on 29524 strings / 5917 classes. [Theory](theory/transition-class-rank.md): global Euler constraint gains at most 256 log2 L bits over independent transition row rank before metadata. No new novelty claim or implemented transition rank codec.

## Next
Check IX05 run 45685540601 and IXR1 replay 45685607169; repair if needed and persist E0007 and verification, promote eligible frontier results only after isolation gate. Quantify actual conditional gain and quantization gap, close C04 if adequately answered. External E0008 replay pending. Nix pin/dashboard deployment pending; C03 candidate. No workers.
