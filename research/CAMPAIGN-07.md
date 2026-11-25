# C07 — Arithmetic straight-line descriptions

Active. Can the whole integer be expressed as a compact DAG with exact concatenation C(A,B)=A*256^len(B)+B and shared subexpressions, paying for every node, reference and root? A byte grammar is a restricted arithmetic circuit with known length labels. Grammar compression is established prior art (Re-Pair, straight-line programs); no novelty claim.

M1: implement a bounded pair-substitution grammar with exact accounting, topological references and raw fallback; prove expansion and cost conditions. M2: compare synthetic and authentic slices, report measured archive sizes, runtime and independent decode; inspect node reuse. M3: explore charged bit packing, repeated-power nodes or scalable construction if justified. Track whole-stream vs blockwise separately; no contest score without complete overhead.
