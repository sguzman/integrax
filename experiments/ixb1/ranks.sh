#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/../.."
cargo test --locked --release --bin ixb1
cargo build --locked --release --bin ixb1
bin=target/release/ixb1
d=results-local/ixb1rank
mkdir -p "$d"
for spec in '1000000 1048576' '50000000 1048576' '10000000 16777216'; do
 read -r off len <<< "$spec"
 dd if=data/enwik8 of="$d/input" iflag=skip_bytes,count_bytes skip="$off" count="$len" status=none
 echo "CASE offset=$off bytes=$len"
 sha256sum "$d/input"
 for mode in 3 4; do
  echo "MODE $mode"
  /usr/bin/time -f 'ENCODE seconds=%e rss_kib=%M' "$bin" encode "$mode" "$d/input" "$d/archive"
  wc -c "$d/archive"; sha256sum "$d/archive"
  /usr/bin/time -f 'DECODE seconds=%e rss_kib=%M' "$bin" decode "$d/archive" "$d/restored"
  cmp "$d/input" "$d/restored"; sha256sum "$d/restored"
  cp "$d/archive" "$d/bad"; printf '\0' >> "$d/bad"
  if "$bin" decode "$d/bad" "$d/restored"; then echo "APPEND ACCEPTED"; exit 1; fi
  echo "PASS $mode"
 done
done
