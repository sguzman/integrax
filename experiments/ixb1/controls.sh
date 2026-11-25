#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/../.."
cargo test --locked --release --bin ixb1
cargo build --locked --release --bin ixb1
node experiments/oracle/bwt-cross.mjs target/release/ixb1
bin=target/release/ixb1
d=results-local/ixb1
mkdir -p "$d"
for spec in '1000000 1048576' '50000000 1048576' '10000000 16777216'; do
 read -r off len <<< "$spec"
 dd if=data/enwik8 of="$d/input" iflag=skip_bytes,count_bytes skip="$off" count="$len" status=none
 echo "CASE offset=$off bytes=$len"
 sha256sum "$d/input"
 for mode in raw 0 1 2; do
  echo "TRANSFORM $mode"
  if [ "$mode" = raw ]; then cp "$d/input" "$d/frame"; else
   /usr/bin/time -f 'TRANSFORM_TIME seconds=%e rss_kib=%M' "$bin" encode "$mode" "$d/input" "$d/frame"
  fi
  wc -c "$d/frame"; sha256sum "$d/frame"
  for codec in gzip xz bzip2; do
   echo "BACKEND $codec"
   case "$codec" in
    gzip) gzip -n -9 -c "$d/frame" > "$d/archive"; gzip -dc "$d/archive" > "$d/unwrapped";;
    xz) xz -6 --threads=1 -c "$d/frame" > "$d/archive"; xz -dc "$d/archive" > "$d/unwrapped";;
    bzip2) bzip2 -9 -c "$d/frame" > "$d/archive"; bzip2 -dc "$d/archive" > "$d/unwrapped";;
   esac
   wc -c "$d/archive"; sha256sum "$d/archive"
   cmp "$d/frame" "$d/unwrapped"
   if [ "$mode" = raw ]; then cp "$d/unwrapped" "$d/restored"; else "$bin" decode "$d/unwrapped" "$d/restored"; fi
   cmp "$d/input" "$d/restored"; sha256sum "$d/restored"
   echo "PASS $mode $codec"
  done
 done
done
