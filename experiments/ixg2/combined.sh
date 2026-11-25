#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/../.."
cargo test --locked --release --bin ixg2
cargo build --release --locked --bin ixg2
bin=target/release/ixg2
d=results-local/ixg2combined
mkdir -p "$d"
: > "$d/train-small"
for off in 0 30000000 40000000 80000000; do
 dd if=data/enwik9 iflag=skip_bytes,count_bytes skip="$off" count=65536 status=none >> "$d/train-small"
done
cp "$d/train-small" "$d/train-large"
for off in 33000000 60000000 70000000 90000000; do
 dd if=data/enwik9 iflag=skip_bytes,count_bytes skip="$off" count=65536 status=none >> "$d/train-large"
done
sha256sum "$d/train-small" "$d/train-large"
for spec in 'small 8192' 'large 8192' 'large 16384'; do
 read -r sample rules <<< "$spec"
 name="$sample-$rules"
 echo "DICTIONARY $name"
 /usr/bin/time -f 'TRAIN_TIME seconds=%e rss_kib=%M' "$bin" train "$d/train-$sample" "$d/$name.dict" "$rules"
 wc -c "$d/$name.dict"
 sha256sum "$d/$name.dict"
done
test "$(sha256sum "$d/small-8192.dict" | cut -d' ' -f1)" = 5eaab64fde0847e5b645aca4740a5596adcdd2ae7eb4dcf8d934e83f5eab3518
# The same training trajectory must produce identical first 8192 rules.
cmp <(tail -c +3 "$d/large-8192.dict") <(tail -c +3 "$d/large-16384.dict" | head -c 32768)
for spec in '200000000 16777216' '600000000 16777216'; do
 read -r offset len <<< "$spec"
 dd if=data/enwik9 of="$d/input" iflag=skip_bytes,count_bytes skip="$offset" count="$len" status=none
 printf 'CASE offset=%s bytes=%s\n' "$offset" "$len"
 sha256sum "$d/input"
 for candidate in "small-8192 lexorder3" "large-8192 lexorder3" "large-16384 lexorder3" "large-8192 mediantree" "large-16384 mediantree"; do
  read -r name mode <<< "$candidate"
  echo "DICT_MODE $name $mode"
  /usr/bin/time -f 'ENCODE seconds=%e rss_kib=%M' "$bin" "$mode" "$d/input" "$d/archive.ix" "$d/$name.dict"
  wc -c "$d/archive.ix"
  sha256sum "$d/archive.ix"
  /usr/bin/time -f 'DECODE seconds=%e rss_kib=%M' "$bin" decode-strict "$d/archive.ix" "$d/restored"
  cmp "$d/input" "$d/restored"
  sha256sum "$d/restored"
  echo "PASS $name $mode"
 done
done
