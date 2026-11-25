#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/../.."
cargo test --locked --bin ixg2
cargo build --release --locked --bin ixg2
bin=target/release/ixg2
input="$(realpath data/enwik9)"
test "$(sha256sum "$input" | cut -d' ' -f1)" = 159b85351e5f76e60cbe32e04c677847a9ecba3adc79addab6f4c6c7aa3744bc
chmod 600 "$input"
dir="$(mktemp -d)"
chmod 755 "$dir"
trap 'rm -rf "$dir"' EXIT
dd if="$input" of="$dir/train" iflag=count_bytes count=65536 status=none
test "$(sha256sum "$dir/train" | cut -d' ' -f1)" = 05fc5f44993ef0557959db76bf47e45badb2dd9c69d93ce08911935b5e52bf40
"$bin" train "$dir/train" "$dir/dict"
test "$(sha256sum "$dir/dict" | cut -d' ' -f1)" = 35fbbd99fb2e1b575fc2353f879875093691e90e360c87b6a9e32f53b349ac98
sha256sum "$dir/train" "$dir/dict"
wc -c "$bin" "$dir/dict"
cp "$bin" "$dir/codec"; chmod 755 "$dir/codec"
/usr/bin/time -f 'ENCODE seconds=%e rss_kib=%M' "$bin" huff "$input" "$dir/archive.ix" "$dir/dict"
wc -c "$dir/archive.ix"
sha256sum "$dir/archive.ix"
chmod 644 "$dir/archive.ix"
# Ensure no training data or separate dictionary is present for decoder.
rm "$dir/train" "$dir/dict"
host_net="$(readlink /proc/self/ns/net)"
mkdir -p results-local/ixg2
/usr/bin/time -f 'ISOLATED_DECODE seconds=%e rss_kib=%M' sudo -n unshare --net -- runuser -u nobody -- sh -eu -c '
 test "$(id -u)" -ne 0
 test ! -r "$1"
 test "$(readlink /proc/self/ns/net)" != "$2"
 cd "$3"
 test ! -e train
 test ! -e dict
 echo "ISOLATION CHECK PASSED uid=$(id -u)" >&2
 exec ./codec decode archive.ix -
' sh "$input" "$host_net" "$dir" > results-local/ixg2/full.out
cmp "$input" results-local/ixg2/full.out
sha256sum "$input" results-local/ixg2/full.out
echo 'IXG2 FULL ISOLATED BYTE COMPARISON PASSED'
