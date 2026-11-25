#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/../.."
mkdir -p results-local/ix04
cargo test --locked --bin ix04
cargo build --release --locked --bin ix04
bin=target/release/ix04
wc -c "$bin"
for offset in 0 1000000 50000000; do
  for len in 4096 65536; do
    f=results-local/ix04/sample
    dd if=data/enwik9 of="$f" iflag=skip_bytes,count_bytes skip="$offset" count="$len" status=none
    "$bin" encode "$f" "$f.ix"
    "$bin" decode "$f.ix" "$f.out"
    cmp "$f" "$f.out"
    printf 'SLICE offset=%s bytes=%s archive=%s\n' "$offset" "$len" "$(wc -c < "$f.ix")"
    sha256sum "$f" "$f.ix" "$f.out"
  done
done
f=results-local/ix04/full.ix
/usr/bin/time -f 'ENCODE seconds=%e rss_kib=%M' "$bin" encode data/enwik9 "$f"
wc -c "$f"
sha256sum "$f"
/usr/bin/time -f 'DECODE seconds=%e rss_kib=%M' "$bin" decode "$f" results-local/ix04/full.out
cmp data/enwik9 results-local/ix04/full.out
sha256sum data/enwik9 results-local/ix04/full.out
echo 'IX04 FULL BYTE COMPARISON PASSED'
