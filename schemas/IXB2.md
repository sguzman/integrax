# IXB2 bounded blockwise container

Header magic IXB2, total original length u64 BE (<=1,000,000,000), block size u32 BE (1..16 MiB). Encoder uses fixed 16 MiB blocks except final remainder, no external dictionary. Number and decoded sizes derived from total length and block size. Each block has tag u8 and payload length u32 BE, then exactly that many bytes. Tag 0 raw requires payload length equal to original block length. Tag 1 IXB1 mode4 requires 17<=payload length<original block length; inner length must match derived block size. Encoder chooses tag1 only when complete inner frame is smaller than raw. Mode4 strict rank replay verifies arithmetic payload; BWT canonicality and raw-vs-compressed choice not rechecked. Reject malformed descriptors before allocation, invalid inner mode/length, truncation and trailing bytes. Output is provisional until successful return; not cryptographic authentication. All outer and inner headers charged. 60 blocks for enwik9, outer overhead 316 B (16+5*60), plus each selected inner 17-byte header. Blockwise track, not uninterrupted whole-integer track or contest-comparable total.

The encoder CLI accepts an optional explicit block size for controlled tests; default remains 16 MiB. The stored size is authoritative for decoding.

## Hierarchical rank extension

Tag 2 carries IXB1 mode7, with identical length constraints to tag 1. Tag and inner mode must agree; tag1 remains strictly mode4. Older decoders reject tag2. CLI `encode-blocks7` selects mode7 for every compressed block, otherwise raw fallback; no other metadata changes. `encode-blocks` preserves original byte stream. Mixed tags are decodable but the encoder never selects between compressed modes within one run. No full BWT canonicality claim.
