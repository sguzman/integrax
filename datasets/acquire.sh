#!/bin/sh
set -eu
umask 077
cd "$(dirname "$0")/.."
case "$#:$*" in
  0:|1:enwik8) name=enwik8; size=100000000; md5=a1fa5ffddb56f4953e226637dabbb36a; sha1=57b8363b814821dc9d47aa4d41f58733519076b2;;
  1:enwik9) name=enwik9; size=1000000000; md5=e206c3450ac99950df65bf70ef61a12d; sha1=2996e86fb978f93cca8f566cc56998923e7fe581;;
  *) echo "usage: sh datasets/acquire.sh enwik8|enwik9" >&2; exit 2;;
esac
data_dir="${INTEGRAX_DATA_DIR:-data}"
mkdir -p "$data_dir"
verify(){
  test "$(wc -c < "$1")" -eq "$size" &&
  printf '%s  %s\n' "$md5" "$1" | md5sum -c - &&
  printf '%s  %s\n' "$sha1" "$1" | sha1sum -c -
}
final="$data_dir/$name"
zip="$data_dir/$name.zip.tmp"
raw="$data_dir/$name.tmp"
if [ -f "$final" ]; then
  echo "Reusing cached $name"
  verify "$final"
  sha256sum "$final"
  exit 0
fi

# Preserve the compressed partial across every failure, including signals.
# Only the transient extracted file is cleaned up.
trap 'rm -f -- "$raw"' EXIT
trap 'exit 130' INT
trap 'exit 143' HUP TERM
attempt=1
while :; do
  # A transfer can finish writing all bytes even if the HTTP response ends
  # with an error. Check before requesting another range (avoids HTTP 416).
  if [ -s "$zip" ] && unzip -tq "$zip" >/dev/null 2>&1; then
    echo "Cached ZIP complete; verifying extracted corpus."
    break
  fi
  offset=0
  if [ -f "$zip" ]; then offset=$(wc -c < "$zip"); fi
  printf 'Download attempt %s/5: %s; resuming at byte %s\n' "$attempt" "$name" "$offset"
  # HTTP/1.1 avoids the observed invalid HTTP/2 frame. A fresh curl process
  # derives its Range from the actual current file size on every retry.
  # No wall-clock transfer timeout: slow progress is not a failure.
  if curl --proto '=https' --http1.1 --fail --location \
      --connect-timeout 30 --max-time 0 --speed-limit 1 --speed-time 120 \
      --continue-at - --output "$zip" \
      "https://www.mattmahoney.net/dc/$name.zip"; then
    if unzip -tq "$zip" >/dev/null 2>&1; then break; fi
    echo 'Transfer returned success but ZIP is incomplete or corrupt; preserving it.' >&2
  else
    rc=$?
    printf 'Transfer failed (curl exit %s); partial retained at %s\n' "$rc" "$zip" >&2
    # Never silently discard a partial when the server refuses a range.
    if [ "$rc" -eq 33 ] || [ "$rc" -eq 36 ]; then
      echo 'Server refused resume; no restart attempted. Partial retained for inspection.' >&2
      exit "$rc"
    fi
  fi
  if [ "$attempt" -ge 5 ]; then
    echo 'Retry budget exhausted. Rerun the same command to resume; partial retained.' >&2
    exit 1
  fi
  attempt=$((attempt + 1))
  sleep 5
done
unzip -p "$zip" "$name" > "$raw"
verify "$raw"
mv -- "$raw" "$final"
# Remove ZIP only after atomic publication of the fully verified corpus.
rm -f -- "$zip"
sha256sum "$final"
