# C04 — Mixed-radix digit ranks and enumerative descriptions

Active. Question: can the whole integer's nonuniform base-256 digit distribution give a compact arithmetic representation at full enwik9 scale, without relying on powers or a single periodic template?

M1: [digit-rank framework](../theory/digit-rank.md), [exact rank cost/type-class bound](../theory/digit-rank-cost.md), [E0006](../experiments/records/E0006.md), 3,280 exhaustive cases and 20 controls. IXR1 cap 4096; external replay pending. IX04 full streaming codec tested.
M2: [E0005](../experiments/records/E0005.md) full enwik9 644,708,597 B, exact byte equality and hash. Formal frontier awaits stricter isolated replay.
M3: [conditional digit interval theory](../theory/conditional-digit-intervals.md) and IX05 implemented. Full corpus workflow repeats IX04 and tests IX05 in a non-root network namespace without readable original. Results pending. Quantify gain and cost relative to gzip and ideal empirical entropy before closure.

Established prior art: alphabet packing, enumerative coding, arithmetic coding and entropy coding. No novelty claim. Whole-stream interval coding is not literal exact multinomial rank. Blockwise/hybrid separately tracked.
