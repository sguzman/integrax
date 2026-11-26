#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
case "${1:-enwik8}" in
  enwik8) name=enwik8; size=100000000; md5=a1fa5ffddb56f4953e226637dabbb36a; sha1=57b8363b814821dc9d47aa4d41f58733519076b2;;
  enwik9) name=enwik9; size=1000000000; md5=e206c3450ac99950df65bf70ef61a12d; sha1=2996e86fb978f93cca8f566cc56998923e7fe581;;
  *) echo "usage: sh datasets/acquire.sh enwik8|enwik9" >&2;exit 2;;
esac
data_dir="${INTEGRAX_DATA_DIR:-data}"
mkdir -p "$data_dir"
verify(){
  test "$(wc -c < "$1")" -eq "$size"
  printf '%s  %s\n' "$md5" "$1" | md5sum -c -
  printf '%s  %s\n' "$sha1" "$1" | sha1sum -c -
}
if [ ! -f "$data_dir/$name" ]; then
  zip="$data_dir/$name.zip.tmp"; raw="$data_dir/$name.tmp"
  trap 'rm -f "$zip" "$raw"' EXIT HUP INT TERM
  curl --proto '=https' --fail --location --retry 1 --connect-timeout 15 --max-time "${INTEGRAX_DOWNLOAD_TIMEOUT:-180}" "https://www.mattmahoney.net/dc/$name.zip" -o "$zip"
  unzip -p "$zip" "$name" > "$raw"
  verify "$raw"
  mv "$raw" "$data_dir/$name"
fi
verify "$data_dir/$name"
sha256sum "$data_dir/$name"
