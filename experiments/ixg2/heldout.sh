#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/../.."
mkdir -p results-local/ixg2
cargo test --locked --bin ixg2
cargo build --release --locked --bin ixg2
bin=target/release/ixg2
d=results-local/ixg2
dd if=data/enwik8 of="$d/train" iflag=count_bytes count=65536 status=none
sha256sum "$d/train"
"$bin" train "$d/train" "$d/dict"
wc -c "$d/dict" "$bin"
sha256sum "$d/dict"
for spec in '0 65536' '1000000 16384' '50000000 16384' '1000000 1048576' '50000000 1048576' '10000000 16777216'; do
 read -r offset len <<< "$spec"
 dd if=data/enwik8 of="$d/input" iflag=skip_bytes,count_bytes skip="$offset" count="$len" status=none
 printf 'CASE offset=%s bytes=%s\n' "$offset" "$len"
 sha256sum "$d/input"
 gzip -n -9 -c "$d/input" > "$d/gzip"
 wc -c "$d/gzip"
 for mode in fixed huff; do
  /usr/bin/time -f 'ENCODE seconds=%e rss_kib=%M' "$bin" "$mode" "$d/input" "$d/$mode.ix" "$d/dict"
  wc -c "$d/$mode.ix"
  sha256sum "$d/$mode.ix"
  /usr/bin/time -f 'DECODE seconds=%e rss_kib=%M' "$bin" decode "$d/$mode.ix" "$d/restored"
  cmp "$d/input" "$d/restored"
  sha256sum "$d/restored"
  echo "PASS $mode"
 done
done
