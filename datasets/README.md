# Datasets

Target: official enwik9, 1,000,000,000 bytes. Obtain distribution via https://prize.hutter1.net/; do not substitute another Wikipedia dump. Record source, acquisition date, extraction, exact size, SHA-256 and independent reference checksum when available. Not acquired or verified yet.

Controls: seeded pseudorandom bytes (algorithm and seed), exact/near-power integers, repetitive data, labeled natural-text prefixes with offset, length and digest. Use matched inputs for all baselines. Keep corpus in ignored data/ and binaries in results-local/. Decoder cannot access original data.
