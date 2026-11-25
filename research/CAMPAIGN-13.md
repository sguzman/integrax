# C13 — Radix context permutations and rank descriptions

Active alongside pending C11/C12 results. Test reversible context sorting (BWT), move-to-front ranks and zero-run descriptions as an alternative to streaming recurrence grammar. M1 E0070 [reference](../experiments/records/E0070.md), 9841 ternary strings, 29523 frames. IXB1 Rust implementation and cross-codec CI authored. M2 E0071 authentic three-region backend ablation, 36 complete archive comparisons, same raw controls, no hidden primary index or length. Decide whether native context-permutation entropy coding or blockwise scaling is justified by actual results. No novelty claim; BWT/MTF are established algorithms. No full-corpus run until measured advantage.

E0070/E0071 [CI 45712990055](https://github.com/sguzman/integrax/actions/runs/45712990055) running at checkpoint; Rust and authentic results pending.

M3 E0072 [native rank intervals](../theory/context-permutation-rank-coding.md), modes3/4, rank buckets and adaptive zero runs, six authentic comparisons and append rejection authored. Compare against E0071 and IXG2 controls; no full scaling until evidence.

E0073 independent BigInt rank reference 30 exact frames and append rejects, 12 zero-run bounds; prior 29523 frames reproduced. External replay pending.

[E0070](../experiments/records/E0070.md) 45/45 independent byte equality and cross-decodes; [E0071](../experiments/records/E0071.md) 36/36 authentic exact, largest BWT+xz 4,378,540 B (3.35% below raw xz, 7.17% below IXG2 dual16); small raw bzip2 controls still win. E0072 native rank and E0073 independent replay pending. No full gain assumed.

[E0073](../experiments/records/E0073.md) 30/30 independent byte-identical frames and cross-decodes passed in [CI 45713436133](https://github.com/sguzman/integrax/actions/runs/45713436133); 75 IXB1 cross-codecs total. Native authentic E0072 pending.
