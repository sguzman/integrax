# C04 — Mixed-radix digit ranks and enumerative descriptions

Active. Question: can the whole integer's nonuniform base-256 digit distribution give a compact arithmetic representation at full enwik9 scale, without relying on powers or a single periodic template?

M1 partial: [digit-rank framework](../theory/digit-rank.md), [exact rank cost and type-class bound](../theory/digit-rank-cost.md), [E0006](../experiments/records/E0006.md) exact rank reference, 3,280 exhaustive cases and 20 controls. IXR1 charges model and rank; no raw fallback and capped 4096 bytes. IX04 streaming static intervals implemented; test and authentic slice evidence pending CI.
M2 running: [IX04 full corpus CI](https://github.com/sguzman/integrax/actions/runs/45684549210), official corpus acquired/verified; await full byte comparison, sizes, hashes, runtime and memory. No frontier promotion before evidence.
M3: quantify actual entropy gap; investigate conditional rank/interval models or reversible transforms. Compare actual data, charge model and executable costs; archive scores not contest totals.

Established prior art: alphabet packing, enumerative coding, arithmetic coding and entropy coding. No novelty claim. Whole-stream interval coding is not literal exact multinomial rank. Blockwise/hybrid separately tracked.
