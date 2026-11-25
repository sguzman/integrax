#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/../.."
mkdir -p results-local/ix05
cargo test --locked --bin ix04 --bin ix05
cargo build --release --locked --bin ix04 --bin ix05
input="$(realpath data/enwik9)"
test "$(sha256sum "$input" | cut -d' ' -f1)" = 159b85351e5f76e60cbe32e04c677847a9ecba3adc79addab6f4c6c7aa3744bc
# Original stays private to runner; decoder executes as nobody with no network namespace access to host.
chmod 600 "$input"
dir="$(mktemp -d)"
chmod 755 "$dir"
trap 'rm -rf "$dir"' EXIT
host_net="$(readlink /proc/self/ns/net)"
for codec in ix04 ix05; do
    echo "CODEC $codec"
    bin="target/release/$codec"
    wc -c "$bin"
    cp "$bin" "$dir/codec"; chmod 755 "$dir/codec"
    /usr/bin/time -f 'ENCODE seconds=%e rss_kib=%M' "$bin" encode "$input" "$dir/archive.ix"
    chmod 644 "$dir/archive.ix"
    wc -c "$dir/archive.ix"
    sha256sum "$dir/archive.ix"
    if [ "$codec" = ix04 ]; then
        test "$(sha256sum "$dir/archive.ix" | cut -d' ' -f1)" = 61c2e1c3d1bc96a3691a9af918922ed0b5828b63501be4fb7373a32be2225537
    fi
    /usr/bin/time -f 'ISOLATED_DECODE seconds=%e rss_kib=%M' sudo -n unshare --net -- runuser -u nobody -- sh -eu -c '
      test "$(id -u)" -ne 0
      test ! -r "$1"
      test "$(readlink /proc/self/ns/net)" != "$2"
      echo "ISOLATION CHECK PASSED uid=$(id -u)" >&2
      cd "$3"
      exec ./codec decode archive.ix -
    ' sh "$input" "$host_net" "$dir" > results-local/ix05/restored
    cmp "$input" results-local/ix05/restored
    sha256sum "$input" results-local/ix05/restored
    echo "FULL ISOLATED BYTE COMPARISON PASSED $codec"
    rm "$dir/archive.ix" results-local/ix05/restored
done
