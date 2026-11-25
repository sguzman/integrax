# Compression frontier

Target: enwik9, 1,000,000,000 bytes. Official competition reference: 100,424,672 bytes (checked 2026-11-25). Competition score includes compressor and self-extracting archive; research archives do not.

| Track | Best accepted result |
|---|---:|
| Whole-stream arithmetic archive (IXG2) | **383,314,419 B** |
| Blockwise | Not established |
| Hybrid | Not established |
| Contest-comparable total | Not established |

| Entry | Codec | Archive bytes | Reduction |
|---|---|---:|---:|
| F0001 | IX04 | 644,708,597 | 35.53% |
| F0002 | IX05 | 487,166,368 | 51.28% |
| F0003 | IXG2 | 472,797,366 | 52.72% |
| F0004 | IXG2, 8192 rules | 394,507,869 | 60.55% |
| F0005 | IXG2, weighted 8192 rules | 383,314,419 | 61.67% |
| External | gzip -n -9 | 322,591,988 | 67.74% |

IX04 and IX05 passed isolated full-byte comparison and SHA-256 in [run 45685540601](https://github.com/sguzman/integrax/actions/runs/45685540601). [E0005](../experiments/records/E0005.md), [E0007](../experiments/records/E0007.md), [external E0004](../experiments/records/E0004.md). Corpus SHA-256 `159b85351e5f76e60cbe32e04c677847a9ecba3adc79addab6f4c6c7aa3744bc`. Whole-stream interval coding is not literal algebraic compression or exact multinomial rank; track indicates the uninterrupted digit stream. Canonical [ledger](../docs/frontier.json). Prefix measurements never enter full-target frontier; preserve history.

IXG2 [E0025/V0005](../experiments/records/E0025.md) passed isolated full reconstruction in [run 45702295001](https://github.com/sguzman/integrax/actions/runs/45702295001). Single global arithmetic dictionary, full rule and root model overhead included.

Expanded dictionary [E0029/V0006](../experiments/records/E0029.md) passed isolated full reconstruction in [job 139518095288](https://github.com/sguzman/integrax/actions/runs/45703123838/job/139518095288). Weighted companion [E0030/V0007](../experiments/records/E0030.md) accepted F0005 after isolated verification in [job 139518094677](https://github.com/sguzman/integrax/actions/runs/45703123838/job/139518094677).
