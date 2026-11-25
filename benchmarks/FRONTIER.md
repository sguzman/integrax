# Compression frontier

Target: enwik9, 1,000,000,000 bytes. External reference threshold: 100,424,672 bytes (checked 2026-11-25, [official site](https://prize.hutter1.net/)). Contest score counts compressor plus self-extracting archive.

| Track | Best verified Integrax result |
|---|---|
| Whole integer (archive) | 644,708,597 B roundtrip-verified; isolation replay pending |
| Blockwise (archive) | Not established |
| Hybrid (archive) | Not established |
| Contest-comparable total | Not established |

[E0005](../experiments/records/E0005.md) is the first full-target Integrax archive measurement (35.53% reduction). The canonical verified frontier awaits the stricter isolation gate. Binary size 321,608 B, not contest-comparable.

## Verified external archive baseline

| Method | Archive bytes | Reduction |
|---|---:|---:|
| gzip 1.14 -n -9 | 322,591,988 | 67.74% |

[Full-corpus evidence E0004](../experiments/records/E0004.md). Target SHA-256: `159b85351e5f76e60cbe32e04c677847a9ecba3adc79addab6f4c6c7aa3744bc`. External baseline not an Integrax result.

Canonical history: [frontier.json](../docs/frontier.json). Only append verified full-target improvements within matched track and metric. Include framing and side data. Prefix results belong in experiment records, not the full-target frontier. Preserve history; invalidate erroneous entries explicitly.
