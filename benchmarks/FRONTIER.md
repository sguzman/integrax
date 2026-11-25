# Compression frontier

Target: enwik9, 1,000,000,000 bytes. Official competition reference: 100,424,672 bytes (checked 2026-11-25). Competition score includes compressor and self-extracting archive; research archives do not.

| Track | Best accepted result |
|---|---:|
| Whole-stream arithmetic archive (IXG2) | **236,272,025 B** |
| Blockwise | **220,113,320 B** |
| Hybrid | Not established |
| Contest-comparable total | Not established |

| Entry | Codec | Archive bytes | Reduction |
|---|---|---:|---:|
| F0001 | IX04 | 644,708,597 | 35.53% |
| F0002 | IX05 | 487,166,368 | 51.28% |
| F0003 | IXG2 | 472,797,366 | 52.72% |
| F0004 | IXG2, 8192 rules | 394,507,869 | 60.55% |
| F0005 | IXG2, weighted 8192 rules | 383,314,419 | 61.67% |
| F0006 | IXG2, contextual roots | 319,996,416 | 68.00% |
| F0007 | IXG2, lexicographic second-order roots | 280,380,483 | 71.96% |
| F0008 | IXG2, lexicographic third-order roots | 256,538,753 | 74.35% |
| F0009 | IXG2, median roots + decoder-derived recurrences | 243,589,465 | 75.64% |
| F0010 | IXG2, expanded dictionary + dual recurrences | 236,272,025 | 76.37% |
| F0011 | IXB2, 16 MiB blocks + mode4 rank intervals | 220,113,320 | 77.99% |
| External | gzip -n -9 | 322,591,988 | 67.74% |

IX04 and IX05 passed isolated full-byte comparison and SHA-256 in [run 45685540601](https://github.com/sguzman/integrax/actions/runs/45685540601). [E0005](../experiments/records/E0005.md), [E0007](../experiments/records/E0007.md), [external E0004](../experiments/records/E0004.md). Corpus SHA-256 `159b85351e5f76e60cbe32e04c677847a9ecba3adc79addab6f4c6c7aa3744bc`. Whole-stream interval coding is not literal algebraic compression or exact multinomial rank; track indicates the uninterrupted digit stream. Canonical [ledger](../docs/frontier.json). Prefix measurements never enter full-target frontier; preserve history.

IXG2 [E0025/V0005](../experiments/records/E0025.md) passed isolated full reconstruction in [run 45702295001](https://github.com/sguzman/integrax/actions/runs/45702295001). Single global arithmetic dictionary, full rule and root model overhead included.

Expanded dictionary [E0029/V0006](../experiments/records/E0029.md) passed isolated full reconstruction in [job 139518095288](https://github.com/sguzman/integrax/actions/runs/45703123838/job/139518095288). Weighted companion [E0030/V0007](../experiments/records/E0030.md) accepted F0005 after isolated verification in [job 139518094677](https://github.com/sguzman/integrax/actions/runs/45703123838/job/139518094677).

Native context [E0040/V0008](../experiments/records/E0040.md) passed isolated full reconstruction in [CI 45704723420](https://github.com/sguzman/integrax/actions/runs/45704723420). First accepted native archive below recorded gzip baseline by 2,595,572 B (0.80% relative). This is not a contest-comparable score.

Second-order context [E0043/V0009](../experiments/records/E0043.md) passed isolated full reconstruction in [CI 45705343900](https://github.com/sguzman/integrax/actions/runs/45705343900). Saves 39,615,933 B vs F0006 and 42,211,505 B vs recorded gzip. Archive-only.

Third-order context [E0045/V0010](../experiments/records/E0045.md) passed isolated full reconstruction in [CI 45707004827](https://github.com/sguzman/integrax/actions/runs/45707004827). Saves 23,841,730 B vs F0007 and 66,053,235 B vs gzip. Archive-only.

Recurrence hybrid [E0055/V0011](../experiments/records/E0055.md) passed strict isolated full reconstruction in [CI 45709267554](https://github.com/sguzman/integrax/actions/runs/45709267554). Saves 12,949,288 B vs F0008 and 79,002,523 B vs gzip. Archive-only.

Verified nonfrontier static control [E0058/V0012](../experiments/records/E0058.md): 249,849,857 B, 75.02% reduction. Completed after F0009 and is 6,260,392 B larger, so not a frontier entry. [CI](https://github.com/sguzman/integrax/actions/runs/45709706242).

Combined recurrence [E0065/V0013](../experiments/records/E0065.md) passed strict isolated full reconstruction in [CI 45711961257](https://github.com/sguzman/integrax/actions/runs/45711961257). Saves 7,317,440 B vs F0009 and 86,319,963 B vs gzip. Archive-only.

Native blockwise [E0074/V0014](../experiments/records/E0074.md) passed isolated full reconstruction in [CI 45713883869](https://github.com/sguzman/integrax/actions/runs/45713883869/job/139554905468). F0011 saves 16,158,705 B relative to whole-stream F0010 and 102,478,668 B relative to gzip. Separate blockwise track; archive only.
