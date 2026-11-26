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

M3 E0097 passed 45 cohorts, 5030 held-out objects; whole-value dictionary saves 25995 B vs framed literals, no arithmetic selections. [Evidence](../experiments/records/E0097.json). M4 E0098 recursive exact byte tree and bottom-up cost selection authored, including matched structural/DEFLATE/arithmetic modes. Hosted CI pending. Article-body treatment is conventional DEFLATE fallback for now; arithmetic subdivision remains open.

M4 E0098 passed exact recursive synthesis (nine authentic frames); arithmetic 1255395 B vs hybrid 1258542 B, gzip 1051275 B, 1486 decimal selections, no factor selections. [Evidence](../experiments/records/E0098.json). Owner explicitly requested article subdivision, so M4 E0099 extends text into paragraphs, sentences, phrases, words and fragments, bounded actual factoring and radix ranks, matched arithmetic-only and hybrid ablations. CI pending; M5 independent decoder follows evidence.

M4 E0099 article subdivisions passed 15 exact archives. 2176 factor cases, 2147 nontrivial products, no explicit factor wins; 3460 selected radix nodes in arithmetic-only archives. All factor evidence retained. [Record](../experiments/records/E0099.json). E0100 lexical rank integers and adaptive interval coding inside XML article streams authored, matched fixed/global/context modes without DEFLATE; CI pending. Factorization alone not sufficient for compression; continue seeking compact arithmetic representations.

E0100 passed nine exact lexical rank archives, context 627154 B vs adaptive 654196 B, gzip 301343 B. Escapes alone 349761 B. [Evidence](../experiments/records/E0100.json). E0101 holds ranks fixed and compares exact-repeat versus prefix/residual integer decomposition of unfamiliar tokens; hosted CI pending. No frontier claim.

E0101 passed nine exact archives, prefix 507117 B vs context 627154 B and exact reuse 524771 B; 120037 B gain, still behind gzip 301343 B. [Evidence](../experiments/records/E0101.json). E0102 tests exact alphabet ranks and two-sided prefix/middle/suffix decomposition, matched baseline. Hosted CI pending; no frontier claim.

## Owner clarification — cumulative factor inventory

E0102 passed, affix 497734 B vs prefix 507117 B. [Evidence](../experiments/records/E0102.json). This branch is secondary. Primary objective is a persistent object/factor inventory, propagating known factors into parent factor searches, independent of atomic encoding costs. [Inventory design](../inventory/README.md). E0103 seeds prior exact products, indexes three complete pages at every nested level, checks actual inherited/global divisibility against exact synthesized parent values, stores residual cofactors and tests a cold control. Hosted CI pending; no full inventory or compression claim. Next persist verified shards, build factor-to-object index and resumable batches, scale XML coverage. Do not pivot away from factorization solely because atomic descriptions grow.

E0103 passed: 794 nodes, 642 complete, 152 partial; 2774 distinct known factors (+351). Eight parents benefited from child candidates; 19 from global candidates. Capped reuse versus cold: 10 wins, 6 losses, 146 ties. All records and inverted index persisted under inventory/; exact nested products rechecked. E0104 resumes prior evidence, tests entire inventory via product-tree GCD, and indexes new larger pages. No compression claim. [Evidence](../experiments/records/E0103.json).

E0104 verified resume, 2179 new nodes (2973 total), 3286 factors (+512), full-inventory hits 798 objects including 161 parents. [Record](../experiments/records/E0104.json). All products and parent synthesis rechecked, shards/index/snapshots persisted. E0105 tests larger pages and distinguishes prior identical integers from cross-value factor reuse; CI pending. No compression or full-corpus claim.
