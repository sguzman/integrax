#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/../.."
cargo test --locked --release --bin ixb1
cargo build --locked --release --bin ixb1
d=results-local/ixb1diag
mkdir -p "$d"
for off in 123456789 456789123 900000000; do
 len=4194304
 dd if=data/enwik9 of="$d/input" iflag=skip_bytes,count_bytes skip="$off" count="$len" status=none
 test "$(wc -c < "$d/input")" = "$len"
 echo "CASE offset=$off bytes=$len"
 sha256sum "$d/input"
 /usr/bin/time -f 'DIAG_TIME seconds=%e rss_kib=%M' target/release/ixb1 diagnose "$d/input"
 # Independently run the complete archive path on each matched region.
 for mode in 4 5 6; do
  echo "MODE $mode"
  target/release/ixb1 encode "$mode" "$d/input" "$d/archive"
  wc -c "$d/archive"; sha256sum "$d/archive"
  target/release/ixb1 decode "$d/archive" "$d/restored"
  cmp "$d/input" "$d/restored"; sha256sum "$d/restored"
  echo "PASS $mode"
 done
done
