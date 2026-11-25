# Experiment protocol

Allocate ID; fix corpus, track, codec, grammar, seeds and search bounds. Record commands, revision, compiler/platform, wall time and peak RSS. Encode and decode in isolation, compare original and reconstructed bytes and hashes. Preserve logs including negative results. Store records under experiments/records/ using schemas/experiment.schema.json.

Smoke-test commands (not benchmark results; create data/ and results-local/ first):

    cargo test --locked
    cargo run --release -- encode data/sample.bin results-local/sample.ix
    cargo run --release -- decode results-local/sample.ix results-local/restored.bin
    cmp data/sample.bin results-local/restored.bin
    sha256sum data/sample.bin results-local/restored.bin
    wc -c data/sample.bin results-local/sample.ix
