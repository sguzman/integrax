#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/../.."
cargo test --locked --release --bin ixg2
cargo build --locked --release --bin ixg2
bin=target/release/ixg2
d=results-local/ixg2-rootmix
mkdir -p "$d"
: > "$d/train"
for off in 0 30000000 40000000 80000000 33000000 60000000 70000000 90000000; do
 dd if=data/enwik9 iflag=skip_bytes,count_bytes skip="$off" count=65536 status=none >> "$d/train"
done
sha256sum "$d/train"
"$bin" train "$d/train" "$d/dict" 16384
test "$(sha256sum "$d/dict" | cut -d' ' -f1)" = 3651e9523e3ddc5db5e2d112832aca59794b9bc12dc433467cd14dc205c3cf9d
for spec in '200000000 16777216' '600000000 16777216' '812345678 4194304'; do
 read -r offset len <<< "$spec"
 dd if=data/enwik9 of="$d/input" iflag=skip_bytes,count_bytes skip="$offset" count="$len" status=none
 printf 'CASE offset=%s bytes=%s\n' "$offset" "$len"
 sha256sum "$d/input"
 for mode in dual16 rootmix16; do
  echo "MODE $mode"
  archive="$d/$mode.ix"
  /usr/bin/time -f 'ENCODE seconds=%e rss_kib=%M' "$bin" "$mode" "$d/input" "$archive" "$d/dict"
  wc -c "$archive"; sha256sum "$archive"
  /usr/bin/time -f 'DECODE seconds=%e rss_kib=%M' "$bin" decode-strict "$archive" "$d/restored"
  cmp "$d/input" "$d/restored"; sha256sum "$d/restored"
  cp "$archive" "$d/appended.ix"; printf '\0' >> "$d/appended.ix"
  if "$bin" decode-strict "$d/appended.ix" /dev/null; then echo "unexpected append acceptance"; exit 1; fi
  echo "PASS $mode"
 done
done
