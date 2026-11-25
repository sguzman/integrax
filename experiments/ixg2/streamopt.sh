#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/../.."
cargo test --locked --bin ixg2
cargo build --release --locked --bin ixg2
bin=target/release/ixg2
d=results-local/ixg2stream
mkdir -p "$d"
dd if=data/enwik8 of="$d/train" iflag=count_bytes count=65536 status=none
"$bin" train "$d/train" "$d/dict"
sha256sum "$d/train" "$d/dict"
for spec in '1000000 16384' '50000000 1048576' '10000000 16777216'; do
 read -r offset len <<< "$spec"
 dd if=data/enwik8 of="$d/input" iflag=skip_bytes,count_bytes skip="$offset" count="$len" status=none
 printf 'CASE offset=%s bytes=%s\n' "$offset" "$len"
 sha256sum "$d/input"
 for mode in optfixed opthuff streamoptfixed streamopthuff; do
  echo "MODE $mode"
  /usr/bin/time -f 'ENCODE seconds=%e rss_kib=%M' "$bin" "$mode" "$d/input" "$d/$mode.ix" "$d/dict"
  wc -c "$d/$mode.ix"
  sha256sum "$d/$mode.ix"
  "$bin" decode "$d/$mode.ix" "$d/restored"
  cmp "$d/input" "$d/restored"
  sha256sum "$d/restored"
  echo "PASS $mode"
 done
 cmp "$d/optfixed.ix" "$d/streamoptfixed.ix"
 cmp "$d/opthuff.ix" "$d/streamopthuff.ix"
 echo 'IDENTICAL OPTIMAL ARCHIVES PASSED'
done
