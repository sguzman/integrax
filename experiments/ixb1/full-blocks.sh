#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/../.."
cargo test --locked --release --bin ixb1
cargo build --locked --release --bin ixb1
bin=target/release/ixb1
input="$(realpath data/enwik9)"
test "$(sha256sum "$input" | cut -d' ' -f1)" = 159b85351e5f76e60cbe32e04c677847a9ecba3adc79addab6f4c6c7aa3744bc
chmod 600 "$input"
dir="$(mktemp -d)"
chmod 755 "$dir"
trap 'rm -rf "$dir"' EXIT
cp "$bin" "$dir/codec"; chmod 755 "$dir/codec"
wc -c "$bin"
/usr/bin/time -f 'ENCODE seconds=%e rss_kib=%M' "$bin" encode-blocks "$input" "$dir/archive.ix"
wc -c "$dir/archive.ix"; sha256sum "$dir/archive.ix"
chmod 644 "$dir/archive.ix"
host_net="$(readlink /proc/self/ns/net)"
mkdir -p results-local/ixb1
/usr/bin/time -f 'ISOLATED_DECODE seconds=%e rss_kib=%M' sudo -n unshare --net -- runuser -u nobody -- sh -eu -c '
 test "$(id -u)" -ne 0
 test ! -r "$1"
 test "$(readlink /proc/self/ns/net)" != "$2"
 cd "$3"
 echo "ISOLATION CHECK PASSED uid=$(id -u)" >&2
 exec ./codec decode-blocks archive.ix -
' sh "$input" "$host_net" "$dir" > results-local/ixb1/full.out
cmp "$input" results-local/ixb1/full.out
sha256sum "$input" results-local/ixb1/full.out
echo "IXB2 FULL ISOLATED BYTE COMPARISON PASSED"
