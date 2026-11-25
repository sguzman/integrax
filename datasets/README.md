# Datasets

Canonical enwik9: first 1,000,000,000 bytes of the March 3, 2006 English Wikipedia dump. The publisher's [test data page](https://www.mattmahoney.net/dc/textdata.html) lists these reference hashes (checked 2026-11-25):

| File | Bytes | MD5 | SHA-1 |
|---|---:|---|---|
| enwik9 | 1000000000 | e206c3450ac99950df65bf70ef61a12d | 2996e86fb978f93cca8f566cc56998923e7fe581 |
| enwik8 | 100000000 | a1fa5ffddb56f4953e226637dabbb36a | 57b8363b814821dc9d47aa4d41f58733519076b2 |

enwik8 is the first 100 MB of enwik9. Start with enwik8 (36,445,475-byte ZIP), verify published digests and record SHA-256, then evaluate several small authentic slices. Full enwik9 ZIP is 322,592,222 bytes; not acquired yet. Do not substitute newer dumps or claim a prefix result is a full-corpus result.

Run sh datasets/acquire.sh enwik8 (or enwik9) from repository root. Download is bounded, HTTPS only, no corpus committed; existing data is reverified. Record source, exact size, hashes and offsets. Keep data/ and results-local/ ignored. Decoder cannot access input. Controls include seeded pseudorandom bytes, exact/near-power integers and repeated text. Use matched input across baselines.
