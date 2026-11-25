# C11 — Decoder-derived arithmetic recurrences

Active alongside finishing C10. Goal: exploit long-range repeated digit subsequences as exact arithmetic recurrence descriptions, beyond a static dictionary and short suffix contexts. M1: [theory](../theory/decoder-derived-recurrence.md), IXG2 mode 13, deterministic previous-context distance, charged copy flag and length, overlap-safe bounded ring. E0053 authentic strict comparisons against matched mode 12; CI pending. M2: assess coverage and archive savings, independently verify recurrence model, scale only meaningful gains. No novelty claim (related to LZP/LZ77); no competition claim. Keep full integer stream, no decoder oracle.

[E0053](../experiments/records/E0053.md) 9/9 strict passed; history16 wins all three regions (16 MiB 4,751,641 B, 2.95% below matched median). E0054 independent oracle passed 36 local cases, [CI 45709112022](https://github.com/sguzman/integrax/actions/runs/45709112022) passed 36/36 independent byte equality and strict cross-decodes. E0055 strict isolated full history16 [CI 45709267554](https://github.com/sguzman/integrax/actions/runs/45709267554), queued at checkpoint. Next consider predictor context and charged length model only after actual evidence.

M3: [adaptive length coding](../theory/recurrence-length-coding.md), mode14; [E0056](../experiments/records/E0056.md) 38/38 independent archive equality and strict cross-decodes, including ring-wrap controls; E0057 authentic matched length model benchmark authored. No result claimed.

E0059 targeted maximum-distance verification: independent traces at W-1,W,W+1 for modes 13/14, six exact synthetic roundtrips; [E0059](../experiments/records/E0059.md) direct Rust boundary and all six byte-identical cross-codecs passed.

[E0057](../experiments/records/E0057.md) 9/9 strict, adaptive16 improves all three regions, 16 MiB 4739779 B (0.25% below fixed16); same parse. Retain adaptive length for structural predictor trials rather than scale the small isolated gain.

M4: E0060 [two-candidate recurrences](../theory/two-candidate-recurrences.md) mode15, charged selection between last two endpoints, same adaptive length. Rust and CI authored, pending; compare coverage, alternate choices and complete archive costs.

[E0060](../experiments/records/E0060.md) 9/9 strict, dual16 wins all 3 regions, 16 MiB 4716953 B (0.48% below length16), 11990 older selections. E0061 independent reference 40 synthetic cases, [CI 45710509602](https://github.com/sguzman/integrax/actions/runs/45710509602) passed 40/40 independent byte-identical archives and strict cross-decodes. Retain dual model for structural trials.

M5: E0062 [recurrence context specificity](../theory/recurrence-context-specificity.md), six/eight digit suffix classes vs four, matched two candidates and adaptive lengths. Code and CI authored; no measured gain yet.

E0063 independent six/eight-digit key reference 40/40 synthetic exact, mode15 regression control reproduced; [External CI 45710909068](https://github.com/sguzman/integrax/actions/runs/45710909068) passed 40/40 byte-identical archives and strict cross-decodes.

[E0062](../experiments/records/E0062.md) 9/9 strict; all six longer-context alternatives regressed, retain four-byte mode15. E0064 combined static dictionary and dual recurrence trial on two matched target regions authored; no assumed additive gains.

E0064 [CI 45711004123](https://github.com/sguzman/integrax/actions/runs/45711004123) queued at checkpoint; reused E0052 target validation regions. No gain yet.

[E0055/V0011](../experiments/records/E0055.md) strict isolated full enwik9 passed; F0009 accepted 243,589,465 B (75.64% reduction). 144546785 bytes recurrence-generated. E0064 pending.

[E0064](../experiments/records/E0064.md) 10/10 strict, expanded training and dual recurrence improve both reused target regions. Larger dictionary wins payload in both, archive in one; select 16384-rule dual16 for E0065 because full dictionary charged once. Strict isolated full workflow authored; no full result claimed. Close C11 after final full measurement; preserve all negative ablations.
