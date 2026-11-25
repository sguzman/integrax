# C02 — Geometric sums and sparse arithmetic corrections

Active. Question: can integer periodicity and sparse deviations yield a useful compact exact description where near powers fail?

For byte length L and block width p, a template repeated to L bytes (including a truncated final block) represents an integer built from a geometric sum of powers of 256. Signed digit corrections at arbitrary positions exactly restore nonperiodic bytes. Unlike IX02, discovery may operate on byte digits of the same whole integer; it does not independently compress blocks.

M1: derive exact formula and accounting; implement IX03 reference Rust codec using a periodic template and sparse correction list. Search p=1..256 bounded by input size; mode falls back to framed raw. Evaluate exact repeats, sparse mutations, seeded random and authentic slices, with actual sizes, hashes and independent cmp.
M2: evaluate how candidate selection scales, derive density/coverage bounds; investigate general sparse sums beyond periodicity only if justified.
Exit: reproduce positive/negative findings on matched data, document cost limits and select next bounded investigation. No mandatory gain. Separate full enwik9 baseline task from whole-integer claims.
