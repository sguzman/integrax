#!/bin/sh
set -eu
cd "$(dirname "$0")/../.."
out=results-local/cross
node experiments/oracle/cross-check.mjs "$out"
manifest=experiments/rust-ix02/Cargo.toml
if [ -f experiments/rust-ix02/Cargo.lock ]; then
    cargo test --locked --manifest-path "$manifest"
    cargo build --locked --release --manifest-path "$manifest"
else
    cargo generate-lockfile --manifest-path "$manifest"
    cargo test --manifest-path "$manifest"
    cargo build --release --manifest-path "$manifest"
fi
bin=experiments/rust-ix02/target/release/ix02
count=0
for f in "$out"/*.bin; do
    base=${f%.bin}
    "$bin" encode "$f" "$base.rust.ix"
    cmp "$base.ix" "$base.rust.ix"
    "$bin" decode "$base.ix" "$base.restored"
    cmp "$f" "$base.restored"
    count=$((count+1))
done
echo "Rust cross-codec: $count identical archives and independently decoded byte strings"
wc -c "$bin"
