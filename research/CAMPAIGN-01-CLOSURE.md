# C01 closure — 2026-11-25

Disposition: closed as a bounded primitive investigation, not a proof that arithmetic compression is impossible.

Evidence: [E0001](../experiments/records/E0001.md) and [V0001](../experiments/records/E0001-verification.md): 20/20 synthetic round trips independently reproduced in Rust; constructed fourth powers approach 1/4 archive ratio. Random and repeated text controls select raw. [E0002](../experiments/records/E0002.md): all 12 authentic Wikipedia slices choose raw; gzip wins all. [Density bound](../theory/IX02-density.md) explains scarcity under uniform inputs, not Wikipedia. Root search limited to exponents 2..32 and adjacent roots; exhaustive expression search not attempted. BigUint codec capped at 16 MiB, so no full-corpus claim. Locked rerun [45681105681](https://github.com/sguzman/integrax/actions/runs/45681105681) succeeded.

M1 measurement setup and authentic enwik8 identity verified; full enwik9 acquisition and Nix pin remain shared infrastructure tasks, carried forward. M2 complete for bounded near-power question. M3 measured scaling and limitations at 64–16,384 bytes; no justification to run this expensive direct search at one GB. Reopen only with evidence of useful structure or a substantially different algorithm.

Next: C02 explores arithmetic geometric sums and sparse corrections. Repetition is a counterexample to treating proximity to a single perfect power as the only useful numerical structure.
