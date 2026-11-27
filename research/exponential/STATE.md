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

Current: branch established at acfd9058498527c0cf17e60c184ff4d9212d6fba. Next: EA01 exact bounded Rust prototype and deterministic synthetic controls, then branch-scoped hosted verification. No empirical result yet. Keep this checkpoint compact and update it after each verified milestone. IDs EA01-E001 etc. Record evidence under research/exponential/records/. Human action: none.
