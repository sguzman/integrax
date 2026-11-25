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
mode="${1:-context}"
case "$mode" in context|backoff) ;; *) exit 2;; esac
: > "$dir/train"
for off in 0 30000000 40000000 80000000; do
 dd if="$input" iflag=skip_bytes,count_bytes skip="$off" count=65536 status=none >> "$dir/train"
done
test "$(sha256sum "$dir/train" | cut -d' ' -f1)" = ba1d4361a56d6e6a688ee4f125465e51b47b361194fbe64349f098860a8fc6fc
"$bin" train "$dir/train" "$dir/dict" 8192
test "$(sha256sum "$dir/dict" | cut -d' ' -f1)" = 5eaab64fde0847e5b645aca4740a5596adcdd2ae7eb4dcf8d934e83f5eab3518
sha256sum "$dir/train" "$dir/dict"
wc -c "$bin" "$dir/dict"
cp "$bin" "$dir/codec"; chmod 755 "$dir/codec"
/usr/bin/time -f 'ENCODE seconds=%e rss_kib=%M' "$bin" "$mode" "$input" "$dir/archive.ix" "$dir/dict"
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
echo "IXG2 ADAPTIVE ROOT FULL ISOLATED BYTE COMPARISON PASSED $mode"
