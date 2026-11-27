# Exponential approximation — continuation checkpoint

Owner-approved 2026-11-27. Branch: research/exponential-approximation. Read this and AGENTS.md first; root STATE.md is inherited C20 history, not this campaign's state. Never write main or trigger C20 workflows intentionally. No paid compute, no external submissions. Preserve license and use pinned Nix.

Mission: explore top-down arithmetic approximations of the exact big-endian enwik9 integer, with complete reversible bit accounting. Compare to raw and standard codecs; no claim of compression from numerical closeness alone. For N = b^e + r, encode base, exponent, signed residual, mode, input byte length/framing. A relative residual epsilon saves roughly -log2(epsilon) raw magnitude bits before overhead. Full enwik9 is ~8 billion bits; avoid materializing every candidate at scale.

Campaign registry (planned, not yet executed):
- EA01 fixed-base floor/ceiling powers; exact oracle, measured net cost and random controls.
- EA02 joint bounded base/exponent search, near roots and logs; compare exhaustive oracle.
- EA03 arbitrary precision and certified high-prefix bounds; exact finalist verification.
- EA04 recursive residual decomposition; cost-aware stopping.
- EA05 signed sums; EA06 products; EA07 nested expressions.
- EA08 optimize candidate search/time/memory; EA09 standalone byte decoder and fair codec comparison.
- EA10 scale synthetic and corpus prefixes through whole enwik9; EA11 hybrid with C20 only after independent evidence and coordination.

Acceptance per campaign: reproducible seed/input hashes, exact reconstruction, actual encoded size including overhead, raw fallback, runtime and memory where available, comparable controls, preserve failures. For selected arithmetic expressions, never hide model/side information or original bytes in decoder. No novelty claim without prior art review.

Current: EA01-E001/E002 bounded u128 oracle and packed codec in ea01.rs; Rust build/tests UNVERIFIED (hosted run not exposed by earlier status query). Independent EA01 evidence: records/EA01-E002-js.json (0355e7250fa1e4d7570d684728e43f283f98e83f); 6,112 exact roundtrips, zero net wins on 4,096 uniform objects; biased 128-bit near-power controls 8,064 -> 2,490 bytes.
EA02-E001 completed independent JS benchmark: ea02-root-search.mjs (66d3f3f96e91c7291a2a395f1f043fb13499c0da), records/EA02-E001.json (ae6e680249cb90554f18fb5739e038d0b45f4cb3). Exact gamma-bucket search theorem: for each exponent and base bit-width bucket, base encoding length is constant; residual cost is monotone in absolute difference; clipped floor/ceil roots minimize rank within bucket. All 256 targets match bounded exhaustive oracle (base <=256), 4 packed roundtrips per target; 1,018,066 exhaustive vs 95,959 bucket scored candidates (root computations excluded, not runtime speedup). Bases <=256 compress 128/128 biased new-base near-power controls vs 6/128 with <=64; <=65536 adds no gains on these controls, zero uniform wins. Adjacent-root rank misses 122/256 but no padded-size losses here. JS-only evidence, 128-bit powers, per-object frames, no executable costs or corpus results. Next: port gamma-bucket search and widened decoder limits into Rust, add exact oracle tests and hosted evidence, then EA03 arbitrary precision. Keep checkpoint under 5k chars; no main writes, human action none.
