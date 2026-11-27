# Exponential approximation — continuation checkpoint

Owner-approved 2026-11-27. Branch: research/exponential-approximation. Read this and AGENTS.md first; root STATE.md is inherited C20 history, not this campaign's state. Never write main or trigger C20 workflows intentionally. No paid compute, no external submissions. Preserve license and use pinned Nix.

Mission: explore top-down arithmetic approximations of the exact big-endian enwik9 integer, with complete reversible bit accounting. Compare to raw and standard codecs; no claim of compression from numerical closeness alone. For N = b^e + r, encode base, exponent, signed residual, mode, input byte length/framing. A relative residual epsilon saves roughly -log2(epsilon) raw magnitude bits before overhead. Full enwik9 is ~8 billion bits; avoid materializing every candidate at scale.

Campaign registry (EA01–EA11 bounded campaign executed; hosted verification recovered):
- EA01 fixed-base floor/ceiling powers; exact oracle, measured net cost and random controls.
- EA02 joint bounded base/exponent search, near roots and logs; compare exhaustive oracle.
- EA03 arbitrary precision and certified high-prefix bounds; exact finalist verification.
- EA04 recursive residual decomposition; cost-aware stopping.
- EA05 signed sums; EA06 products; EA07 nested expressions.
- EA08 optimize candidate search/time/memory; EA09 standalone byte decoder and fair codec comparison.
- EA10 scale synthetic and corpus prefixes through whole enwik9; EA11 hybrid with C20 only after independent evidence and coordination.

Acceptance per campaign: reproducible seed/input hashes, exact reconstruction, actual encoded size including overhead, raw fallback, runtime and memory where available, comparable controls, preserve failures. For selected arithmetic expressions, never hide model/side information or original bytes in decoder. No novelty claim without prior art review.

Current: APPROVED BOUNDED CAMPAIGN CLOSED; broader IntegraX/C20 mission not concluded. See FINDINGS.md (2d0f827a) and immutable records under research/exponential/records/. EA01–EA09 synthetic investigations executed, exact oracle comparisons and positive controls preserved. HOSTED-VERIFICATION.json (819f4711): Rust reference run 46068385328/job140739357976 six tests pass, 12 benchmark rows; standalone codec run 46069329127/job140742213747 20 roundtrips, 36 malformed rejections, 8 fixtures verified. IEX1 encoder cap8192 B, decoder cap1MiB, experimental not audited, no checksum.
EA10/E001 (39a30134), run 46075399271: actual corpus 1GB SHA256 159b85351e5f76e60cbe32e04c677847a9ecba3adc79addab6f4c6c7aa3744bc verified, all samples measured; isolated decode failed on Bubblewrap permission. EA10/E002 (c9b8b6c4), successful run 46080789914/job140779030813/artifact15237162641, workflow revision 3db6b348: 18 isolated decode hashes pass; all 18 input/archive hashes and codec sizes match previous measurement. Sample totals overlap: 31488 raw -> 31620 IEX1, gzip13130, xz14288, zstd12976. Whole actual enwik9 prefix screen 2030/2030 pruned, 11.56ms, EA08 one-bit framing bases2..64 ONLY. Benchmark 11.97s peak RSS155104KiB. No full corpus compression or executable-inclusive claim.
EA11/E001 (1fd3cbe9): 92 authenticated C20 E0103 objects, 270 decode checks, no hybrid wins. E002 (337d5375): wide bases65..65536, 12 real spans, 101868 candidates rejected, no gains. E003 (15d6e5e2): three disjoint pages, 794 authenticated span hashes, 777 unique intervals no competitive arithmetic. E004 (cda12f10): 2854 raw, 2875 IEX1, 2881 IEXH, gzip1672, xz1904, zstd1695; nine conventional roundtrips. Small nonrepresentative sample; no corpus extrapolation. All 11 bounded campaigns investigated; no further blind parameter sweep justified. No main writes, no paid compute.
Operational: GitHub fetch https://api.github.com/repos/sguzman/integrax/actions/runs?head_sha=COMMIT_SHA (replace literal placeholder) returns push-triggered runs; filter by path, then fetch jobs/logs/artifacts by ID. Do not use PR-only workflow wrapper or require owner run URLs. Next: only resume if owner requests distinct new hypothesis/campaign. Human action none.

Paper requested after closure: [LaTeX technical report](paper/integrax-exponential.tex), source commit 97f5203e, blob 44a10d4ca152b7736b4cfc20c60c096684a2822e; identical local source compiled twice to six-page PDF, rendered pages inspected. [Build notes](paper/README.md) (d7651b03); pinned Nix build recipe not executed. AI-assisted draft pending human author review; not submitted. No new research campaign opened.
