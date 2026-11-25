# Compression frontier

Target: enwik9, 1,000,000,000 bytes. External reference threshold: 100,424,672 bytes (checked 2026-11-25, [official site](https://prize.hutter1.net/)). Contest score counts compressor plus self-extracting archive.

| Track | Best verified Integrax result |
|---|---|
| Whole integer (archive) | Not established |
| Blockwise (archive) | Not established |
| Hybrid (archive) | Not established |
| Contest-comparable total | Not established |

## Verified external archive baseline

| Method | Archive bytes | Reduction |
|---|---:|---:|
| gzip 1.14 -n -9 | 322,591,988 | 67.74% |

[Full-corpus evidence E0004](../experiments/records/E0004.md). This is not an Integrax result or contest-comparable score. Target SHA-256: `159b85351e5f76e60cbe32e04c677847a9ecba3adc79addab6f4c6c7aa3744bc`.

Canonical history: [frontier.json](../docs/frontier.json). Only append verified full-target improvements within matched track and metric. Include framing and side data. Prefix results belong in experiment records, not the full-target frontier. Preserve history; invalidate erroneous entries explicitly.
