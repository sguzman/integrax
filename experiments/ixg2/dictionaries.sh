#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/../.."
cargo test --locked --bin ixg2
cargo build --release --locked --bin ixg2
bin=target/release/ixg2
d=results-local/ixg2dict
mkdir -p "$d"
dd if=data/enwik8 of="$d/prefix" iflag=count_bytes count=65536 status=none
dd if=data/enwik8 of="$d/prefix256" iflag=count_bytes count=262144 status=none
: > "$d/diverse"
for off in 0 30000000 40000000 80000000; do
 dd if=data/enwik8 iflag=skip_bytes,count_bytes skip="$off" count=65536 status=none >> "$d/diverse"
done
sha256sum "$d/prefix" "$d/prefix256" "$d/diverse"
for spec in 'prefix 1024' 'prefix256 1024' 'diverse 1024' 'prefix256 4096' 'diverse 4096' 'diverse 8192'; do
 read -r sample rules <<< "$spec"
 name="$sample-$rules"
 echo "DICTIONARY $name"
 /usr/bin/time -f 'TRAIN_TIME seconds=%e rss_kib=%M' "$bin" train "$d/$sample" "$d/$name.dict" "$rules"
 wc -c "$d/$name.dict"
 sha256sum "$d/$name.dict"
done
for spec in '1000000 1048576' '50000000 1048576' '10000000 16777216'; do
 read -r offset len <<< "$spec"
 dd if=data/enwik8 of="$d/input" iflag=skip_bytes,count_bytes skip="$offset" count="$len" status=none
 printf 'CASE offset=%s bytes=%s\n' "$offset" "$len"
 sha256sum "$d/input"
 gzip -n -9 -c "$d/input" > "$d/gzip"
 wc -c "$d/gzip"
 for name in prefix-1024 prefix256-1024 diverse-1024 prefix256-4096 diverse-4096 diverse-8192; do
  echo "DICT_MODE $name"
  /usr/bin/time -f 'ENCODE seconds=%e rss_kib=%M' "$bin" huff "$d/input" "$d/archive.ix" "$d/$name.dict"
  wc -c "$d/archive.ix"
  sha256sum "$d/archive.ix"
  /usr/bin/time -f 'DECODE seconds=%e rss_kib=%M' "$bin" decode "$d/archive.ix" "$d/restored"
  cmp "$d/input" "$d/restored"
  sha256sum "$d/restored"
  echo "PASS $name"
 done
done
