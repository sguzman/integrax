# C20 — XML-guided hierarchical arithmetic synthesis

Active; owner explicitly approved 2026-11-26 UTC. Goal: reconstruct the exact whole enwik9 integer bottom-up by composing number-theoretic descriptions of XML elements, bodies, and all interstitial lexical bytes. No requirement that leaf factors divide the parent integer. C19 mode8 is independently verified and preserved as a deferred competitive candidate; no full-corpus integration until resumed.

## Model
For a byte span s of length l, I(s) is its big-endian integer with length retained. I(a||b)=I(a)*256^len(b)+I(b). A parent is a partition into literal opening/closing tag bytes, child spans and interstitial lexical bytes, not an overlapping concatenation of both a parent and its children. Exact whitespace, attributes, entities, comments, CDATA, XML prefixes, and incomplete final markup are preserved. Do not use a semantic parser that normalizes text and then reserializes. A raw fallback must cover unparsed bytes. Optimize tree cost with min(raw, arithmetic leaf, ordered child expressions plus all framing), not local factor count. Prime factors are components of leaf expressions, not necessarily factors of the root. Factor storage includes primes, exponents, operand widths, tags, dictionary and references; only actual smaller serialized archives count as compression.

## Milestones
- M1 E0095: full corpus lexical span census, exact byte replay, path and size distributions, truncated-tail accounting; first bounded <=8-byte factor probe and actual prime/exponent payload costs. Not an archive result.
- M2: independently verify span extraction, expand bounded factorization to larger objects according to observed distribution (e.g. 16/32-byte and small full elements), preserve discovered factors and censored outcomes. Compare prime-power vs quotient+residual and nonfactor controls.
- M3: repeated factor and whole-value dictionaries conditioned by path; account for dictionary and selection costs. Separate duplicate-value benefit from factors.
- M4: exact hierarchical arithmetic wire grammar and bottom-up minimum-cost selection; preserve all lexical bytes.
- M5: independent decoder, matched XML-aware nonfactor baseline, gzip and existing Integrax candidate, fresh held-out regions.
- M6: full corpus only if measured evidence justifies; strict isolated decode and exact cmp, archive and contest accounting separate.

Prior art: Liefke and Suciu, XMill: an Efficient Compressor for XML Data (SIGMOD 2000), https://www.en.pms.ifi.lmu.de/publications/projektarbeiten/Felix.Weigel/xmlindex/material/liefke00xmill.pdf (tag-driven content grouping and specialized codecs). XML-aware compression and arithmetic concatenation are established; no claim of novelty for their combination without deeper literature review.

M1 E0095 passed complete lexical replay, 2,686,411 elements, 243,425 pages, 907,627,913 bytes in complete article bodies. 142/144 fully factored, zero payload wins. [Evidence](../experiments/records/E0095.json). M2 E0096 independent census and 9–32-byte partial/complete factor probe authored; CI pending. Keep unresolved cofactors and distinguish probable primes from proved primes.

M2 E0096 passed independent census and exact factors, 201 objects, 195 nontrivial decompositions, zero individual payload wins. [Record](../experiments/records/E0096.json). M3 E0097 shared whole-value versus divisor dictionaries, exact quotient control and complete charged collection archives authored. Hosted CI pending; nonzero residual control deferred until justified.
