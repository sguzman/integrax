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

Current: EA01-E001 bounded u128 oracle in ea01.rs; EA01-E002 adds packed MSB-first gamma-coded width/mode/base/exponent/sign/residual length+bits, zero padding, raw fallback, exact decode and malformed-frame checks (606a9eee4c4d43a49f09f06439166e5625f7a9ff). Rust build/tests remain UNVERIFIED: no Rust/Nix in assistant sandbox, prior status lookup gave no visible run; workflow .github/workflows/ea01-reference.yml is push-triggered for this branch. Independent BigInt reproduction executed via JS code-mode with actual binary packing: source ea01-independent.mjs (96cd6f9f81650884a5723fb8af8370289fa667f4); results records/EA01-E002-js.json (0355e7250fa1e4d7570d684728e43f283f98e83f). 6,112 exact roundtrips; 0/4,096 uniform objects beat input size. Near powers: 0/504, 156/504, 504/504, 504/504 at 2/4/8/16 bytes. 16-byte near powers 8,064 -> 2,490 packed bytes; controls deliberately biased and duplicate delta=0; not corpus or contest compression. Adjacent search often misses minimum bit cost on random values but no lost net wins in tested samples. Rust-only output not claimed. Next: EA02 extend joint base/exponent search via bounded integer roots, benchmark against exhaustive oracle, preserve standalone framing and independent reproduction; recover hosted verification if accessible. EA03 expands beyond u128. No changes to main. Human action: none.
