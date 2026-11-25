# C07 — Arithmetic straight-line descriptions

Active. Can the whole integer be expressed as a compact DAG of exact concatenations with shared subexpressions, paying for every node, reference and root?

M1: IXG1 bounded pair substitution, exact bit width and framing, [theory](../theory/arithmetic-dag.md), E0020 9841 exhaustive round trips, 47667 count checks, 30 synthetic fixtures; external replay passed.
M2: E0021 authentic 15/15 exact, 12 net reductions. [E0022](../experiments/records/E0022.md) best-prefix lookahead improved 10/15 authentic slices, independent Rust decoder reconstructed both archives for 35 fixtures (70 comparisons); 3 Rust tests passed. Best 16 KiB authentic archive 7880 B, still behind gzip; synthetic periodic/dictionary/fibonacci gains substantial. No full-target gain.
M3: [global shared DAG streaming design](../notes/C07-streaming-design.md); implement and measure held-out slices, complete charged grammar and root stream. Consider full enwik9 only after scaling checks. Grammar compression established prior art, no novelty claim.
