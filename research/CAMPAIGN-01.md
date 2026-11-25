# C01 — Measurement and near-power primitives

Active. No empirical claims yet.

Question: can N=a^b+r, with signed r, give genuine serialized savings on structured inputs and natural-text integers? Hypothesis: synthetic near powers should compress under favorable cost conditions; natural text may not. Negative evidence is valuable.

M1: implement/test reference codec and record target identity, build environment, controls.
M2: implement scalable arbitrary-precision near-power search with explicit budgets; compare raw, deterministic random, synthetic, natural-text prefixes and conventional compressors. Measure all serialized fields.
M3: derive residual-width and cost bounds, scale across input sizes, record time/memory, independently verify, close with evidence and select the next campaign.

Exit: reproducible positive or negative evidence and scaling assessment, not a mandatory gain. Small u128 mode is bootstrap only.
