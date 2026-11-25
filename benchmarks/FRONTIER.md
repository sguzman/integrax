# Compression frontier

Target: enwik9, 1,000,000,000 bytes. Official competition reference: 100,424,672 bytes (checked 2026-11-25). Competition score includes compressor and self-extracting archive; research archives do not.

| Track | Best accepted result |
|---|---:|
| Whole-stream arithmetic archive (IXG2) | **472,797,366 B** |
| Blockwise | Not established |
| Hybrid | Not established |
| Contest-comparable total | Not established |

| Entry | Codec | Archive bytes | Reduction |
|---|---|---:|---:|
| F0001 | IX04 | 644,708,597 | 35.53% |
| F0002 | IX05 | 487,166,368 | 51.28% |
| F0003 | IXG2 | 472,797,366 | 52.72% |
| External | gzip -n -9 | 322,591,988 | 67.74% |

IX04 and IX05 passed isolated full-byte comparison and SHA-256 in [run 45685540601](https://github.com/sguzman/integrax/actions/runs/45685540601). [E0005](../experiments/records/E0005.md), [E0007](../experiments/records/E0007.md), [external E0004](../experiments/records/E0004.md). Corpus SHA-256 `159b85351e5f76e60cbe32e04c677847a9ecba3adc79addab6f4c6c7aa3744bc`. Whole-stream interval coding is not literal algebraic compression or exact multinomial rank; track indicates the uninterrupted digit stream. Canonical [ledger](../docs/frontier.json). Prefix measurements never enter full-target frontier; preserve history.

IXG2 [E0025/V0005](../experiments/records/E0025.md) passed isolated full reconstruction in [run 45702295001](https://github.com/sguzman/integrax/actions/runs/45702295001). Single global arithmetic dictionary, full rule and root model overhead included.
