# Exponential approximation — bounded campaign conclusions

AI-assisted research, not a proof of general incompressibility or a contest submission. Branch isolated from active C20 main. All archive costs exclude executable unless expressly stated. See records/ for full measurements and source revisions.

| Campaign | Bounded finding | Evidence |
|---|---|---|
| EA01/02 | Exact single-power search; 4096 uniform controls no net wins; bounded gamma-bucket search agrees with exhaustive oracle. | EA01-E002-js.json, EA02-E001.json |
| EA03 | Certified interval pruning; million-bit biased near-power witness 131072 -> 15 B. | EA03-E001/E002 |
| EA04/05 | Separated positive and signed power controls improve; clustered sums rarely improve; wider beam adds no wins. | EA04-E001, EA05-E001 |
| EA06/07 | Products and nested trees recover constructed arithmetic witnesses. | EA06-E001, EA07-E001 |
| EA08 | Virtual billion-byte target prefix screens 2030 candidates without materializing target or powers. This is not enwik9. | EA08-E001 |
| EA09 | IEX1 standalone codec and resource bounds; synthetic comparisons reverified; no security audit. | EA09-E001, EA11-E004 |
| EA10 | Actual enwik9 whole-prefix and 18 sample benchmarks executed; all isolated decode hashes verified on retry. | EA10-E001/E002.json |
| EA11 | Factor-assisted, wide-base and hierarchical tests on authenticated E0103 objects/pages yield no improvements. Three complete pages: 2854 B original, 2875 B IEX1, 2881 B IEXH, 1672 B gzip, 1904 B xz, 1695 B zstd. | EA11-E001 through E004 |

The successful synthetic witnesses test implementation sensitivity, not expected general-corpus compression. The real page sample is tiny, selected and not representative; overlapping object counts cannot be summed as coverage. Standalone frames carry their own magic/width. Hierarchical framing shares magic and allows raw coalescing. Standard comparison uses separate frames per page, stdin and byte-equal decompression. No corpus-size extrapolation. Factor inventory is encoder evidence only and is not supplied to decoder.

## Hosted acceptance evidence

- [Rust reference run](https://github.com/sguzman/integrax/actions/runs/46068385328): six tests passed, both benchmark programs completed; 12 measured rows preserved.
- [Standalone codec run](https://github.com/sguzman/integrax/actions/runs/46069329127): 20 roundtrips, 36 malformed rejections, eight fixture comparisons. Verified synthetic archive sizes, hashes and standard compressor sizes.
- [EA10 first measurement](https://github.com/sguzman/integrax/actions/runs/46075399271): corpus hash and all 18 samples passed; isolation failed because of Bubblewrap runner permissions. Preserve the failure in EA10-E001.
- [EA10 corrected run](https://github.com/sguzman/integrax/actions/runs/46080789914): successful acquisition, corpus hash, 18 sample measurements and 18 isolated decode hashes; input and archive hashes and all codec sizes match the first measurement. Whole enwik9 prefix screen 2030/2030 candidates rejected in 11.56 ms (bases 2–64, EA08 single-power framing only). Samples at six offsets, three nested widths per offset: 31488 B summed original, 31620 IEX1, 13130 gzip, 14288 xz, 12976 zstd. Not disjoint coverage or full corpus compression. Benchmark wall time 11.97 s, peak RSS 155104 KiB. No security audit or executable-inclusive contest total.

Decision: close the approved bounded exponential research campaign EA01–EA11. These experiments do not demonstrate enwik9 compression advantage. No further blind sweep is scientifically justified. The broader IntegraX mission and C20 main remain independent and ongoing; no merge or main modification. Any new arithmetic family should have a distinct hypothesis and measurable acceptance criteria.

Operational note: GitHub fetch of the public API repository endpoint `https://api.github.com/repos/sguzman/integrax/actions/runs?head_sha=COMMIT_SHA` returns push runs. Filter by workflow path, then fetch jobs, logs and artifacts by ID. The PR-only workflow wrapper is unsuitable for push runs. Persist run IDs and actual evidence; do not ask the owner to supply routine run URLs.
