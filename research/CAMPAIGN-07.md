# C07 — Arithmetic straight-line descriptions

Active. Can the whole integer be expressed as a compact DAG of exact concatenations with shared subexpressions, paying for every node, reference and root?

M1: IXG1 bounded pair substitution, exact bit width and framing, [theory](../theory/arithmetic-dag.md), E0020 9841 exhaustive round trips, 47667 count checks, 30 synthetic fixtures; external replay passed.
M2: [E0021](../experiments/records/E0021.md), 15/15 authentic exact reconstructions, 12 net reductions, none of the selected arithmetic frames beat gzip. Best 16 KiB archive 9639 B at 50M offset. Independent Rust decoder and width-barrier search E0022 CI running, [run 45701303041](https://github.com/sguzman/integrax/actions/runs/45701303041).
M3: evaluate actual E0022 evidence; scale promising grammar or consider more expressive arithmetic nodes. No novelty claim, grammar compression established prior art. No full-target gain claimed.
