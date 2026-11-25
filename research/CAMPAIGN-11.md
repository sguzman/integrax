# C11 — Decoder-derived arithmetic recurrences

Active alongside finishing C10. Goal: exploit long-range repeated digit subsequences as exact arithmetic recurrence descriptions, beyond a static dictionary and short suffix contexts. M1: [theory](../theory/decoder-derived-recurrence.md), IXG2 mode 13, deterministic previous-context distance, charged copy flag and length, overlap-safe bounded ring. E0053 authentic strict comparisons against matched mode 12; CI pending. M2: assess coverage and archive savings, independently verify recurrence model, scale only meaningful gains. No novelty claim (related to LZP/LZ77); no competition claim. Keep full integer stream, no decoder oracle.

[E0053](../experiments/records/E0053.md) 9/9 strict passed; history16 wins all three regions (16 MiB 4,751,641 B, 2.95% below matched median). E0054 independent oracle passed 36 local cases, [CI 45709112022](https://github.com/sguzman/integrax/actions/runs/45709112022) passed 36/36 independent byte equality and strict cross-decodes. E0055 strict isolated full history16 [CI 45709267554](https://github.com/sguzman/integrax/actions/runs/45709267554), queued at checkpoint. Next consider predictor context and charged length model only after actual evidence.

M3: [adaptive length coding](../theory/recurrence-length-coding.md), mode14; [E0056](../experiments/records/E0056.md) 38/38 independent archive equality and strict cross-decodes, including ring-wrap controls; E0057 authentic matched length model benchmark authored. No result claimed.

E0059 targeted maximum-distance verification: independent traces at W-1,W,W+1 for modes 13/14, six exact synthetic roundtrips; [E0059](../experiments/records/E0059.md) direct Rust boundary and all six byte-identical cross-codecs passed.

[E0057](../experiments/records/E0057.md) 9/9 strict, adaptive16 improves all three regions, 16 MiB 4739779 B (0.25% below fixed16); same parse. Retain adaptive length for structural predictor trials rather than scale the small isolated gain.

M4: E0060 [two-candidate recurrences](../theory/two-candidate-recurrences.md) mode15, charged selection between last two endpoints, same adaptive length. Rust and CI authored, pending; compare coverage, alternate choices and complete archive costs.
