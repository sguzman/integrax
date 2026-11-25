# C06 closure — Finite-field recurrence synthesis

Closed 2026-11-25. IXL1 and IXL2 exact bounded recurrence grammars passed 5327 exhaustive independent degree checks, 48 synthetic round trips, 88 malformed rejects and same-code CI replay. IXL1 no gains on 15 authentic slices; IXL2 nine net gains caused by constant top bit, one additional smaller-than-framed-raw selection that expanded versus input; no nonconstant recurrent plane selected. Both authentic suites passed exact reconstruction. E0019 SHA-256 counter stream negative controls passed all 30 reconstructions; full-byte variants found no gains and restricted alphabets only constant zero planes.

The original xorshift32 fixture was incorrectly treated as random for GF(2) recurrence testing; preserve original measurements, explicitly relabel interpretation. Its degree-32 sequences confirm recovery of linear generative laws, not generic compression. No novel theorem or full-target gain.

Pivot C07: arithmetic straight-line expressions with reusable subexpressions. Exact digit concatenation x*256^k+y gives an arithmetic DAG whose internal nodes can reuse repeated strings. Need cost-aware grammar serialization and authentic data benchmarks; avoid equating grammar compression with a new mathematical theorem. More expressive polynomial/product nodes may follow only if useful.
