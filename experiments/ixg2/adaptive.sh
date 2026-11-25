#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/../.."
cargo test --locked --release --bin ixg2
cargo build --release --locked --bin ixg2
bin=target/release/ixg2
d=results-local/ixg2adapt
mkdir -p "$d"
: > "$d/train"
for off in 0 30000000 40000000 80000000; do
 dd if=data/enwik8 iflag=skip_bytes,count_bytes skip="$off" count=65536 status=none >> "$d/train"
done
"$bin" train "$d/train" "$d/dict" 8192
sha256sum "$d/train" "$d/dict"
test "$(sha256sum "$d/dict" | cut -d' ' -f1)" = 5eaab64fde0847e5b645aca4740a5596adcdd2ae7eb4dcf8d934e83f5eab3518
for spec in '1000000 1048576' '50000000 1048576' '10000000 16777216'; do
 read -r offset len <<< "$spec"
 dd if=data/enwik8 of="$d/input" iflag=skip_bytes,count_bytes skip="$offset" count="$len" status=none
 printf 'CASE offset=%s bytes=%s\n' "$offset" "$len"
 sha256sum "$d/input"
 gzip -n -9 -c "$d/input" > "$d/gzip"
 wc -c "$d/gzip"
 for mode in huff adaptive context; do
  echo "MODE $mode"
  /usr/bin/time -f 'ENCODE seconds=%e rss_kib=%M' "$bin" "$mode" "$d/input" "$d/archive.ix" "$d/dict"
  wc -c "$d/archive.ix"
  sha256sum "$d/archive.ix"
  /usr/bin/time -f 'DECODE seconds=%e rss_kib=%M' "$bin" decode "$d/archive.ix" "$d/restored"
  cmp "$d/input" "$d/restored"
  sha256sum "$d/restored"
  echo "PASS $mode"
 done
done
