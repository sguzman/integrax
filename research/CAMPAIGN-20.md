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

E0105 verified 2676 new nodes (5649 total), 4145 factors (+859); 157 previously unseen parent integers benefit from full inventory, 162 parent hits with distinct-value witness. [Record](../experiments/records/E0105.json). E0106 revisits earlier unresolved cofactors using all current factors and proper cross-residual GCDs, retaining exact supplemental discoveries. No compression claim.

E0106 passed: 36 improved objects (35 parents), 2 completed, 648 residual bits removed across overlapping nodes, one new prime (2969), 6.07 s; all 36 exact supplemental products persisted, index now 4146. Next E0107: expand to fresh 3073–4096-byte pages, loading and checking E0106 overlay and unioned occurrence index. No compression frontier change.

E0107 passed, 3446 new nodes (9095 total), 5144 distinct factors (+998), 207 previously unseen parent values with full-inventory hits. 15.42 s. Scale-normalized evidence shows strong word/phrase reductions but nearly unchanged article/page cofactors. Next E0108 controlled fixed-object inventory growth comparison; no compression claim.

E0108 passed: 5871 new nodes (14966 total), 6504 factors (+1360), 335 unseen parent full-inventory hits. Frozen 3286/4145/4146/5144-factor screens on identical objects: 915278/912006/912006/908682 residual bits; 274 objects improved including 57 parents, no article improvements and one page improvement. 42.26 s. Next E0109: strict descendant residual GCD after screening latest inventory, compare exact composite splits beyond known primes. No compression claim.

E0109 passed: 14,966 indexed objects, 2,487 partial, 1,866 distinct post-screen residuals; 20 parent improvements solely from the existing 6,504-factor inventory, 248 residual bits removed (overlapping objects), no completions or new primes. 2,113 parents screened and 14,849 strict descendant checks yielded zero proper shared divisors. 10.90 s. All 20 exact overlays persisted. No compression claim.

E0110: global strictly smaller residual GCD control after replaying E0109 overlays, compare descendant and unrelated smaller-value matches using the same residual snapshot. Preserve proper splits and factor provenance; hosted CI pending.

E0110 passed: 2,113 parents, 14,849 descendant checks with zero local hits, 4 global-only parent hits (3 distinct new prime values; one sentence/paragraph alias pair), 54 residual bits removed across overlapping nodes, 48.91 s. Exact products and GCD witnesses rechecked, all 4 overlays and 3 prime values persisted; index now 6507. No compression claim.

E0111: replay E0110 overlays and measure closure of its three new primes across all previously unresolved objects, then extend strictly smaller global residual search to non-parent nodes as well as parents. Record inventory-only gains separately and retain exact splits. Hosted CI pending.

E0111 passed: 2,487 unresolved objects screened, 4 additional parent records benefited from the three E0110 primes (3 distinct values), 54 residual bits removed across overlapping nodes. No further proper GCD hits or new primes. 34.31 s. All four exact overlays persisted; 6,507 factors retained. No compression claim.

E0112: expand cumulative inventory to three fresh 6,145–8,192-byte XML pages, replay every historical overlay in order, compare frozen inventories on identical objects, then adaptively learn new factors. Hosted CI pending.

E0112 passed: 8114 new nodes (23080 total), 8376 distinct factors (+1869), 569 previously unseen parent records with full-inventory hits. Frozen 3286/4145/4146/5144/6504/6507-factor inventories on identical targets left 1400891/1396421/1396387/1392093/1388992/1388981 residual bits. 66.84 s. Exact parent synthesis independently checked from CI factor products. No compression claim.

Next: E0113 re-screen the expanded inventory across historical unresolved objects and test whether reuse improves article/page-scale cofactors; compare by level and unique value.

E0113: frozen inventory re-screen of all 23,080 indexed objects, stratified by object kind, width, unique integer and historical versus E0112 cohort. Exact overlay replay and product checks; no new residual GCD search. Hosted CI pending.

E0113 passed: 23,080 indexed objects, 3,759 partial, 8,376 known factors; 26 improved records (21 distinct integers), 25 parents, one completed word, 406 residual bits removed. Historical cohort 20 improvements, E0112 cohort 6; zero article/page/revision improvements. 12.17 s. All 26 exact products and emitted prime values independently rechecked and overlays persisted. No compression claim. Next: compare strict smaller global residual GCD on the enlarged post-overlay inventory (E0114).

E0114: replay E0113 overlays and repeat E0111 strictly smaller global residual GCD control on the enlarged 23,080-object inventory (8,376 known factors). Separate known-factor closure from proper new GCD splits, retain atomic/parent and descendant/global-only distinctions; exact products and witnesses required. Compare against E0111 on 14,966 objects, with no compression claim. Hosted CI pending.

E0114 passed: 3,758 partial objects, 2,874 distinct residuals, 3 global-only proper GCD matches (2 distinct integer values; sentence/paragraph alias), 2 new primes (0x38d5, 0x2ba3), 40 overlapping residual bits removed, zero descendant matches across 22,897 checks. 94.48 s. Exact products, GCD witnesses and prime values independently rechecked. Persisted 3 overlays and 2 index entries; 8,378 factors. No article/page improvement or compression claim. Next E0115: propagate new primes across all indexed objects before further expansion.

E0115: frozen-inventory closure after E0114, now 8,378 factors and 23,080 objects. Propagate the two new primes into any remaining cofactors, retain scale and distinct-value metrics, require exact overlay replay and product verification. Reuse E0113 implementation unchanged. No additional residual GCD search; hosted CI pending.

E0115 passed: 2 historical objects (sentence and username, 2 distinct integers) improved solely from E0114 primes; 28 overlapping residual bits removed, 3,758 partial objects, no completions, 11.11 s. Both exact products independently checked and overlays persisted. 8,378 known factors unchanged. No article/page improvement or compression claim. Next E0116: expand inventory with fresh larger pages; compare frozen historical inventories against identical unseen objects.

E0116: expand to three fresh 8,193–10,240-byte pages. Replay all persisted refinements, compare eight frozen inventory stages through E0114 (8,378 factors) on identical held-out values before adaptive learning. Preserve exact parent synthesis and factor records; compare scaling against E0112 without claiming compression. Hosted CI pending.

E0116 passed: 10,596 new objects (33,676 total), 2,410 new distinct factors (10,788 total), 772 previously unseen parent values with full-inventory hits, 146.57 s. All 1,940 parent products independently synthesized from children; all object bit widths and index union checked. Frozen inventory residual bits on identical new targets: E0104 1,799,524; E0112 and E0114 1,774,845. Article/page residuals unchanged across all eight stages. Persisted 107 object shards, 18 index shards and snapshots; probable-prime labels retained. No compression claim.
E0117: re-screen the full 33,676-object inventory with 10,788 known factors, compare recent E0116 and historical cohorts by object kind, width and unique improved integer, with exact overlay replay and product verification. No residual GCD search. Derive recent cohort label from the manifest rather than hard-coding E0112. Hosted CI pending.

E0117 passed: 33,676 indexed objects, 5,243 partial, 10,788 known factors; 32 improved records (23 distinct integers), all parents, one completed phrase, 599 overlapping residual bits removed. Historical cohort 29 improvements, E0116 cohort 3. Two revisions improved (25 bits total), zero article/page improvements. 23.28 s, 1,290,708 KiB peak RSS. All 32 exact products, residual decompositions, bit counts and cohort counts independently rechecked; full inventory replay and parent synthesis passed in CI. Verified corpus cache saved. No compression claim. Next: E0118 strict smaller global residual GCD on enlarged post-overlay inventory, compare against E0114.
