# Factor inventory — C20 primary research artifact

The corpus integer is big-endian base 256, and every indexed object's byte width is retained. Object identity is corpus digest plus absolute byte offset, width, hierarchy path and stable traversal ID. An object can share bytes with its parent and other hierarchy levels; totals across nested nodes are not a corpus partition. Each parent uses ordered disjoint child spans; exact value is obtained by repeated radix concatenation. Never presume child primes divide the parent.

## Durable layout

- Existing evidence seeds: E0095, E0096, E0099 (all exact products retained; probable primes separately labeled).
- New batch manifests and object records under inventory/batches/; append verified shards, never overwrite earlier evidence.
- Each object stores stable ID, parent ID, ordered child IDs, offset, width, byte hash, node kind, integer bit length, discovered factors (hex, exponent, quality, provenance), exact residual cofactor (hex), tested candidates by source and search cost. The original integer is reproducible from authenticated corpus span or factor product and cofactor. Zero and one explicitly handled.
- Factor index is derived from these records: factor value -> object IDs, exponents, quality, source. Preserve factorization failures and partial cofactors. New batches must be able to ingest prior verified shards and avoid repeating completed work. Batch IDs and selection bounds versioned.
- Each parent uses inherited candidates and the accumulated global inventory, checks divisibility against actual concatenated integer, extracts exact valuations and attempts further bounded factorization on remaining cofactor. Cold baseline measures same base prime screen and number of extra candidates, not equal CPU or statistical significance. Compare residual bit lengths and exact divisibility certificates. Research metadata may be larger than original corpus; do not reject expensive factorizations. If inventory becomes decoder side information it must be charged to archive.
- Initial batch E0103: three complete bounded pages, every node at all lexical levels. Full XML object index and larger pages/regions are follow-on scaling milestones; do not claim full corpus indexed yet. Use hosted computation, persist verified rows after CI. No raw corpus committed.
