#!/bin/bash
set -euo pipefail
umask 077
host=$1
transfer=$2
cd "$(dirname "$0")/../.."
uid=$(id -u); gid=$(id -g)
test "$uid" -ne 0
host_net=$(readlink /proc/self/ns/net)
bash_bin=$(realpath "$(command -v bash)")
utils=$(dirname "$(realpath "$(command -v readlink)")")
case "$bash_bin:$utils" in /nix/store/*:/nix/store/*) ;; *) echo 'Nix shell tools required' >&2; exit 1;; esac
scratch=$(mktemp -d)
trap 'rm -rf -- "$scratch"' EXIT
mkdir "$scratch/visible"
printf 'host-only\n' > "$scratch/hidden"
sandbox(){
 local command=$1; shift
 bwrap --unshare-user --uid "$uid" --gid "$gid" --unshare-net --unshare-pid --unshare-ipc --unshare-uts \
  --die-with-parent --new-session --cap-drop ALL --clearenv --ro-bind /nix/store /nix/store \
  --ro-bind "$scratch/visible" /work --proc /proc --dev /dev --tmpfs /tmp --chdir /work \
  --setenv PATH "$utils" -- "$bash_bin" -eu -c "$command" sandbox "$@"
}
probe='test "$(id -u)" -ne 0; test ! -e "$1"; test "$(readlink /proc/self/ns/net)" != "$2"; test ! -e /work/train; test ! -e /work/dict; test ! -e /work/enwik9'
sandbox "$probe" "$scratch/hidden" "$host_net"
echo 'ISOLATION PREFLIGHT PASSED'
echo "Checking persistent corpus cache..."
cache="$host/.git/local-ci/cache"
mkdir -p "$cache"
if test -f "$host/data/enwik9"; then
 input=$(realpath "$host/data/enwik9")
else
 INTEGRAX_DATA_DIR="$cache" INTEGRAX_DOWNLOAD_ATTEMPTS="${INTEGRAX_DOWNLOAD_ATTEMPTS:-0}" sh datasets/acquire.sh enwik9
 input=$(realpath "$cache/enwik9")
fi
case "$input" in /nix/store/*) echo 'Corpus must be outside the mounted Nix store' >&2; exit 1;; esac
corpus_hash=$(sha256sum "$input" | cut -d' ' -f1)
test "$corpus_hash" = 159b85351e5f76e60cbe32e04c677847a9ecba3adc79addab6f4c6c7aa3744bc
test "$(wc -c < "$input")" -eq 1000000000
sandbox "$probe" "$input" "$host_net"
echo "Corpus verified; testing and building codec..."
rustc --version; cargo --version
cargo test --release --locked --bin ixg2
cargo build --release --locked --bin ixg2
bin=target/release/ixg2
: > "$scratch/train"
for off in 0 30000000 40000000 80000000 33000000 60000000 70000000 90000000; do
 dd if="$input" iflag=skip_bytes,count_bytes skip="$off" count=65536 status=none >> "$scratch/train"
done
training_hash=$(sha256sum "$scratch/train" | cut -d' ' -f1)
test "$training_hash" = 65dd770568be321494dcc88019e75ee92fc67fbcf75adc1abd8a35a9504a1895
echo "Training dictionary..."
"$bin" train "$scratch/train" "$scratch/dict" 16384
dictionary_hash=$(sha256sum "$scratch/dict" | cut -d' ' -f1)
test "$dictionary_hash" = 3651e9523e3ddc5db5e2d112832aca59794b9bc12dc433467cd14dc205c3cf9d
dictionary_bytes=$(wc -c < "$scratch/dict")
cp "$bin" "$scratch/visible/codec"
codec_bytes=$(wc -c < "$scratch/visible/codec")
# A separate read-only observer reports actual output bytes, not estimated completion.
# Preserve the codec's exit code and the existing GNU time measurement.
run_with_progress(){
 local stage=$1 path=$2; shift 2
 local started child watcher rc=0
 started=$(date +%s)
 echo "$stage started" >&2
 "$@" &
 child=$!
 (
  while kill -0 "$child" 2>/dev/null; do
   local bytes=0
   if test -f "$path"; then bytes=$(stat -c %s "$path" 2>/dev/null || echo 0); fi
   printf '%s: %s seconds elapsed, %s bytes written\n' "$stage" "$(( $(date +%s) - started ))" "$bytes" >&2
   sleep 10
  done
 ) &
 watcher=$!
 wait "$child" || rc=$?
 kill "$watcher" 2>/dev/null || true
 wait "$watcher" 2>/dev/null || true
 printf '%s finished: exit %s, %s seconds elapsed\n' "$stage" "$rc" "$(( $(date +%s) - started ))" >&2
 return "$rc"
}
time_bin=$(realpath "$(type -P time)")
run_with_progress ENCODE "$scratch/visible/archive.ix" "$time_bin" -o "$scratch/encode.time" -f '%e %M' "$bin" rootmix16 "$input" "$scratch/visible/archive.ix" "$scratch/dict"
read -r enc_seconds enc_rss < "$scratch/encode.time"
archive_bytes=$(wc -c < "$scratch/visible/archive.ix")
archive_hash=$(sha256sum "$scratch/visible/archive.ix" | cut -d' ' -f1)
rm "$scratch/train" "$scratch/dict"
# time wraps the Bubblewrap process; RSS is the decoder pipeline peak.
export -f sandbox
export uid gid scratch bash_bin utils
run_with_progress DECODE "$scratch/restored" "$time_bin" -o "$scratch/decode.time" -f '%e %M' "$bash_bin" -c 'sandbox "$1" "$2" "$3"' runner "$probe; echo ISOLATION_CHECK_PASSED >&2; exec ./codec decode-strict archive.ix -" "$input" "$host_net" > "$scratch/restored"
read -r dec_seconds dec_rss < "$scratch/decode.time"
echo "Comparing all original and reconstructed bytes..."
cmp "$input" "$scratch/restored"
decoded_hash=$(sha256sum "$scratch/restored" | cut -d' ' -f1)
test "$decoded_hash" = "$corpus_hash"
echo 'FULL ISOLATED BYTE COMPARISON PASSED'
echo "Retaining verified archive and preparing evidence..."
mkdir -p "$cache/archives"
cp "$scratch/visible/archive.ix" "$cache/archives/E0085-$GITHUB_SHA.ix.tmp"
test "$(sha256sum "$cache/archives/E0085-$GITHUB_SHA.ix.tmp" | cut -d' ' -f1)" = "$archive_hash"
mv "$cache/archives/E0085-$GITHUB_SHA.ix.tmp" "$cache/archives/E0085-$GITHUB_SHA.ix"
jq -nc --argjson archive_bytes "$archive_bytes" --arg archive_sha256 "$archive_hash" \
 --argjson codec_bytes "$codec_bytes" --argjson decode_rss_kib "$dec_rss" --argjson decode_seconds "$dec_seconds" \
 --arg decoded_sha256 "$decoded_hash" --argjson dictionary_bytes "$dictionary_bytes" --arg dictionary_sha256 "$dictionary_hash" \
 --argjson encode_rss_kib "$enc_rss" --argjson encode_seconds "$enc_seconds" --arg input_sha256 "$corpus_hash" \
 --argjson sandbox_uid "$uid" --arg training_sha256 "$training_hash" \
 '{$archive_bytes,$archive_sha256,byte_equal:true,$codec_bytes,$decode_rss_kib,$decode_seconds,$decoded_sha256,$dictionary_bytes,$dictionary_sha256,$encode_rss_kib,$encode_seconds,input_bytes:1000000000,$input_sha256,isolated:true,mode:20,$sandbox_uid,$training_sha256}' \
 | sed 's/^/INTEGRAX_RESULT /' > "$transfer/evidence.log"
