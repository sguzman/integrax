# Exponential approximation — interim synthesis

AI-assisted research, not a proof of general incompressibility or a contest submission. Branch isolated from active C20 main. All archive costs exclude executable unless expressly stated. See records/ for full measurements and source revisions.

| Campaign | Bounded finding | Evidence |
|---|---|---|
| EA01/02 | Exact single-power search; 4096 uniform controls no net wins; bounded gamma-bucket search agrees with exhaustive oracle. | EA01-E002-js.json, EA02-E001.json |
| EA03 | Certified interval pruning; million-bit biased near-power witness 131072 -> 15 B. | EA03-E001/E002 |
| EA04/05 | Separated positive and signed power controls improve; clustered sums rarely improve; wider beam adds no wins. | EA04-E001, EA05-E001 |
| EA06/07 | Products and nested trees recover constructed arithmetic witnesses. | EA06-E001, EA07-E001 |
| EA08 | Virtual billion-byte target prefix screens 2030 candidates without materializing target or powers. This is not enwik9. | EA08-E001 |
| EA09 | IEX1 standalone codec and resource bounds; synthetic comparisons reverified; no security audit. | EA09-E001, EA11-E004 |
| EA10 | Actual enwik9 whole-prefix and block workflow authored; hosted result not accessible. | ea10-corpus.mjs, .github/workflows/ea10-corpus.yml |
| EA11 | Factor-assisted, wide-base and hierarchical tests on authenticated E0103 objects/pages yield no improvements. Three complete pages: 2854 B original, 2875 B IEX1, 2881 B IEXH, 1672 B gzip, 1904 B xz, 1695 B zstd. | EA11-E001 through E004 |

The successful synthetic witnesses test implementation sensitivity, not expected general-corpus compression. The real page sample is tiny, selected and not representative; overlapping object counts cannot be summed as coverage. Standalone frames carry their own magic/width. Hierarchical framing shares magic and allows raw coalescing. Standard comparison uses separate frames per page, stdin and byte-equal decompression. No corpus-size extrapolation. Factor inventory is encoder evidence only and is not supplied to decoder.

Decision: conclude bounded EA11 pilots with negative findings; no further blind parameter sweep. EA10 evidence remains the next acceptance gate. Do not merge main or start a new campaign merely to prolong execution. Hosted action push run IDs unavailable through current connector (PR-triggered run query only); public API unavailable in this session. EA09 and Rust hosted evidence also remains unobserved. If no evidence can be recovered, request the owner provide the workflow results artifact/logs; do not infer status from empty queries.
