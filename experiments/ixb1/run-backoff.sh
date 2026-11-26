#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/../.."
cargo test --locked --release --bin ixb1
cargo build --locked --release --bin ixb1
d=results-local/ixb1runbackoff
mkdir -p "$d"
for off in 123456789 456789123 900000000; do
 len=4194304
 dd if=data/enwik9 of="$d/input" iflag=skip_bytes,count_bytes skip="$off" count="$len" status=none
 test "$(wc -c < "$d/input")" = "$len"
 echo "CASE offset=$off bytes=$len"
 sha256sum "$d/input"
 # Independently run the complete archive path on each matched region.
 for mode in 7 8; do
  echo "MODE $mode"
  /usr/bin/time -f 'ENCODE seconds=%e rss_kib=%M' target/release/ixb1 encode "$mode" "$d/input" "$d/archive"
  wc -c "$d/archive"; sha256sum "$d/archive"
  /usr/bin/time -f 'DECODE seconds=%e rss_kib=%M' target/release/ixb1 decode "$d/archive" "$d/restored"
  cmp "$d/input" "$d/restored"; sha256sum "$d/restored"
  cp "$d/archive" "$d/bad"; printf '\0' >> "$d/bad"
  if target/release/ixb1 decode "$d/bad" "$d/restored"; then exit 1; fi
  echo "PASS $mode"
 done
done
