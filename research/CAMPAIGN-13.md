# C13 — Radix context permutations and rank descriptions

Active alongside pending C11/C12 results. Test reversible context sorting (BWT), move-to-front ranks and zero-run descriptions as an alternative to streaming recurrence grammar. M1 E0070 [reference](../experiments/records/E0070.md), 9841 ternary strings, 29523 frames. IXB1 Rust implementation and cross-codec CI authored. M2 E0071 authentic three-region backend ablation, 36 complete archive comparisons, same raw controls, no hidden primary index or length. Decide whether native context-permutation entropy coding or blockwise scaling is justified by actual results. No novelty claim; BWT/MTF are established algorithms. No full-corpus run until measured advantage.

E0070/E0071 [CI 45712990055](https://github.com/sguzman/integrax/actions/runs/45712990055) running at checkpoint; Rust and authentic results pending.

M3 E0072 [native rank intervals](../theory/context-permutation-rank-coding.md), modes3/4, rank buckets and adaptive zero runs, six authentic comparisons and append rejection authored. Compare against E0071 and IXG2 controls; no full scaling until evidence.

E0073 independent BigInt rank reference 30 exact frames and append rejects, 12 zero-run bounds; prior 29523 frames reproduced. External replay pending.

[E0070](../experiments/records/E0070.md) 45/45 independent byte equality and cross-decodes; [E0071](../experiments/records/E0071.md) 36/36 authentic exact, largest BWT+xz 4,378,540 B (3.35% below raw xz, 7.17% below IXG2 dual16); small raw bzip2 controls still win. E0072 native rank and E0073 independent replay pending. No full gain assumed.

[E0073](../experiments/records/E0073.md) 30/30 independent byte-identical frames and cross-decodes passed in [CI 45713436133](https://github.com/sguzman/integrax/actions/runs/45713436133); 75 IXB1 cross-codecs total. Native authentic E0072 pending.

[E0072](../experiments/records/E0072.md) 6/6 exact, 6/6 append rejects, mode4 wins all three regions vs external controls. E0074 [IXB2](../schemas/IXB2.md) full native blockwise candidate (16 MiB, charged headers/raw fallback), isolated exact decode authored. Separate blockwise track; no full gain yet.

E0075 independent IXB2 framing reference 30 exact synthetic archives and 3672 malformed/truncated rejects. External Rust cross-codec pending. E0074 initial run failed the known raw-fallback fixture assumption; corrected run separate.

[E0075](../experiments/records/E0075.md) external replay passed 30/30 independent comparisons and 254 malformed rejects; corrected fixture passed. IXB2 full run pending.

M4 E0076 [rank-token context specificity](../theory/rank-token-context.md), fixed transform and maximal zero-run parse; two-token magnitude history vs exact previous rank. Nine authentic comparisons and append rejection authored; no gain presumed. IXB2 full mode4 trial unchanged.

E0077 independent rank-token context reference 30 synthetic exact frames and append rejects; mode3/4 reference regression checks unchanged. Rust replay pending.

[E0077](../experiments/records/E0077.md) independent rank-context replay passed 30/30 byte equality and both-direction cross-decodes; E0076 authentic comparison pending.

M5 E0078 [rank cost decomposition](../theory/rank-cost-decomposition.md), three fresh 4 MiB target regions, actual complete frames vs in-sample entropy diagnostics, nine exact comparisons authored; no gain presumed. Diagnostic only, no wire format changes.

[E0076](../experiments/records/E0076.md) 9/9 exact and append rejects; two-token bucket mode5 wins all, largest 4,244,143 B (0.687% below mode4), exact rank mode6 regresses. E0078 [CI 45714738239](https://github.com/sguzman/integrax/actions/runs/45714738239) running on fresh target regions; no additional full run selected yet.

[E0078](../experiments/records/E0078.md) 9/9 exact fresh target comparisons, mode5 wins all three. Rank symbols dominate the empirical comparator; mode7 rank-only hierarchical backoff E0079 authored, pending. [Theory](../theory/rank-backoff.md). No full gain assumed.

E0080 independent hierarchical rank reference 15 exact synthetic frames/append rejects; prior 30 mode5/6 observations unchanged. External Rust replay pending.

[E0079](../experiments/records/E0079.md) 6/6 exact and append rejects; mode7 wins all three reused regions, aggregate 0.658% below mode5 and 1.281% below mode4. Retain for final combined candidate consideration after E0074/E0080; no full result claimed.

[E0080](../experiments/records/E0080.md) 15/15 independent byte equality and both-direction cross-decodes, reference observations reproduced. Full mode4 pending.

E0081 mode7 block integration: tag2 with matching inner mode, independent reference exact and malformed controls, Rust replay passed [CI 45715504252](https://github.com/sguzman/integrax/actions/runs/45715504252/job/139560398820): 30/30 byte-identical archives and both-direction cross-decodes, 266 malformed rejects, 9 Rust tests. Existing tag1 wire format unchanged. Full mode7 selection awaits E0074 baseline.
