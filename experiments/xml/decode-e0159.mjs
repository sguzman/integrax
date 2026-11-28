import assert from 'node:assert/strict';
import {openSync, readFileSync, closeSync, writeSync, ftruncateSync} from 'node:fs';

// Standalone decoder: accepts only an E0159 archive and output path.
const [archivePath, outputPath] = process.argv.slice(2);
assert(archivePath && outputPath, 'usage: node decode-e0159.mjs ARCHIVE OUTPUT');
const input = readFileSync(archivePath);
let at = 0;
function take(n) { assert(Number.isSafeInteger(n) && n >= 0 && at + n <= input.length, 'truncated archive'); const b = input.subarray(at, at + n); at += n; return b; }
function u32() { return take(4).readUInt32BE(); }
function u64() { const n = take(8).readBigUInt64BE(); assert(n <= BigInt(Number.MAX_SAFE_INTEGER), 'unsupported output length'); return Number(n); }
function integer(b) { return b.length ? BigInt(`0x${b.toString('hex')}`) : 0n; }
function fixed(n, width) { const h = n.toString(16); const b = Buffer.from(h.length % 2 ? `0${h}` : h, 'hex'); assert(b.length <= width, 'reconstructed integer exceeds span width'); return Buffer.concat([Buffer.alloc(width - b.length), b]); }
function writeAll(fd, b, position) { let done = 0; while (done < b.length) done += writeSync(fd, b, done, b.length - done, position + done); }

assert.equal(take(8).toString('binary'), 'IXE0159\0', 'bad archive magic');
const corpusBytes = u64(), spanCount = u32(), dictionaryCount = u32();
const dictionary = [];
for (let i = 0; i < dictionaryCount; i++) { const width = u32(); assert(width > 0, 'zero-width factor'); const p = integer(take(width)); assert(p > 1n, 'invalid dictionary factor'); dictionary.push(p); }
const fd = openSync(outputPath, 'w');
ftruncateSync(fd, corpusBytes);
let outputAt = 0;
try {
  for (let i = 0; i < spanCount; i++) {
    const offset = u64(), width = u32(), factorCount = u32();
    assert(offset >= outputAt && offset + width <= corpusBytes, 'overlapping or out-of-range span');
    const terms = [];
    for (let j = 0; j < factorCount; j++) { const id = u32(), exponent = u32(); assert(id < dictionary.length && exponent > 0, 'invalid factor reference'); terms.push(dictionary[id] ** BigInt(exponent)); }
    const residualWidth = u32(), residual = integer(take(residualWidth));
    const gap = take(offset - outputAt); writeAll(fd, gap, outputAt);
    const value = terms.reduce((a, b) => a * b, residual);
    writeAll(fd, fixed(value, width), offset);
    outputAt = offset + width;
  }
  writeAll(fd, take(corpusBytes - outputAt), outputAt);
  assert.equal(at, input.length, 'trailing archive bytes');
} finally { closeSync(fd); }
