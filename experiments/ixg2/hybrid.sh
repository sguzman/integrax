#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/../.."
cargo test --locked --bin ixg2
cargo build --release --locked --bin ixg2
bin=target/release/ixg2
d=results-local/ixg2hybrid
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
 for mode in original fixed roots huff; do
  echo "MODE $mode"
  if [ "$mode" = original ]; then cp "$d/input" "$d/frame"; else "$bin" "$mode" "$d/input" "$d/frame" "$d/dict"; "$bin" decode "$d/frame" "$d/restored"; cmp "$d/input" "$d/restored"; fi
  wc -c "$d/frame"
  sha256sum "$d/frame"
  for backend in gzip xz; do
   echo "BACKEND $backend"
   if [ "$backend" = gzip ]; then
    /usr/bin/time -f 'OUTER_ENCODE seconds=%e rss_kib=%M' gzip -n -9 -c "$d/frame" > "$d/archive"
    /usr/bin/time -f 'OUTER_DECODE seconds=%e rss_kib=%M' gzip -dc "$d/archive" > "$d/unwrapped"
   else
    /usr/bin/time -f 'OUTER_ENCODE seconds=%e rss_kib=%M' xz -T1 -6 -c "$d/frame" > "$d/archive"
    /usr/bin/time -f 'OUTER_DECODE seconds=%e rss_kib=%M' xz -dc "$d/archive" > "$d/unwrapped"
   fi
   wc -c "$d/archive"
   sha256sum "$d/archive"
   cmp "$d/frame" "$d/unwrapped"
   if [ "$mode" = original ]; then cp "$d/unwrapped" "$d/restored"; else "$bin" decode "$d/unwrapped" "$d/restored"; fi
   cmp "$d/input" "$d/restored"
   sha256sum "$d/restored"
   echo "PASS $mode $backend"
  done
 done
done
