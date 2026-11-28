import assert from 'node:assert/strict';
import {readFileSync, writeFileSync, openSync, closeSync, writeSync, statSync, createReadStream} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {performance} from 'node:perf_hooks';

const corpusPath = process.argv[2], archivePath = process.argv[3], restoredPath = process.argv[4];
assert(corpusPath && archivePath && restoredPath, 'usage: node factorized-root-archive-e0163.mjs CORPUS ARCHIVE RESTORED');
const started = performance.now();
const sha = b => createHash('sha256').update(b).digest('hex');
const hashFile = path => new Promise((resolve, reject) => { const h = createHash('sha256'); const stream = createReadStream(path); stream.on('data', b => h.update(b)); stream.on('error', reject); stream.on('end', () => resolve(h.digest('hex'))); });
const bytesOf = h => { const s = h.toLowerCase().replace(/^0+/, ''); return s ? Buffer.from(s.length % 2 ? `0${s}` : s, 'hex') : Buffer.alloc(0); };
const product = fs => fs.reduce((n, f) => n * BigInt(`0x${f.p}`) ** BigInt(f.e), 1n);
const corpus = readFileSync(corpusPath);
assert.equal(corpus.length, 1_000_000_000);
const corpusSha = sha(corpus);
assert.equal(corpusSha, '159b85351e5f76e60cbe32e04c677847a9ecba3adc79addab6f4c6c7aa3744bc');

const manifest = JSON.parse(readFileSync('inventory/manifest.json', 'utf8'));
const pages = [];
for (const id of ['E0149', 'E0152', 'E0156', 'E0160']) {
  const record = JSON.parse(readFileSync(`experiments/records/${id}.json`, 'utf8'));
  assert.equal(record.status, 'verified');
  const batch = manifest.batches.find(x => x.id === id); assert(batch, `missing ${id} inventory batch`);
  for (const page of record.pages) pages.push({...page, experiment: id});
}
pages.sort((a, b) => a.offset - b.offset);
assert.equal(pages.length, 12);
for (let i = 1; i < pages.length; i++) assert(pages[i - 1].offset + pages[i - 1].width <= pages[i].offset, 'sample page spans overlap');
const targets = new Map(pages.map(p => [p.root_id, {...p, factors: [], residual: null}]));
for (const id of ['E0149', 'E0152', 'E0156', 'E0160']) {
  const batch = manifest.batches.find(x => x.id === id);
  for (const shard of batch.shards) {
    const data = JSON.parse(readFileSync(shard.path, 'utf8'));
    for (const row of data.rows) if (targets.has(row.id)) {
      const p = targets.get(row.id);
      assert.equal(row.offset, p.offset); assert.equal(row.width, p.width); assert.equal(row.byte_sha256, p.sha256);
      p.factors = row.factors.map(f => ({p: f.p.toLowerCase(), e: f.e, quality: f.quality})); p.residual = BigInt(`0x${row.cofactor || '0'}`);
    }
  }
}
for (const ref of manifest.refinements ?? []) {
  const data = JSON.parse(readFileSync(ref.path, 'utf8'));
  for (const row of data.rows) if (targets.has(row.id)) {
    const p = targets.get(row.id); assert.equal(p.residual, BigInt(`0x${row.old_cofactor || '0'}`));
    assert.equal(product(row.factors) * BigInt(`0x${row.remaining || '0'}`), p.residual);
    for (const f of row.factors) {
      const key = f.p.toLowerCase(), old = p.factors.find(x => x.p === key);
      if (old) { old.e += f.e; assert.equal(old.quality, f.quality, `factor quality changed for ${key}`); }
      else p.factors.push({p: key, e: f.e, quality: f.quality});
    }
    p.residual = BigInt(`0x${row.remaining || '0'}`);
  }
}
for (const p of pages) {
  const row = targets.get(p.root_id); assert(row.residual !== null, `missing page-root factor row ${p.root_id}`);
  assert.equal(product(row.factors) * row.residual, BigInt(`0x${corpus.subarray(p.offset, p.offset + p.width).toString('hex')}`), `factor product mismatch ${p.root_id}`);
  p.factors = row.factors; p.residual = row.residual;
}

// Score all 4,096 page subsets including dictionary, references, residuals, framing, and raw complement.
const choices = [];
for (let mask = 0; mask < 1 << pages.length; mask++) {
  const selected = pages.filter((_, i) => mask & (1 << i));
  const primes = [...new Set(selected.flatMap(p => p.factors.map(f => f.p)))].sort((a, b) => BigInt(`0x${a}`) < BigInt(`0x${b}`) ? -1 : 1);
  const dictBytes = primes.reduce((n, p) => n + 4 + bytesOf(p).length, 0);
  const recordBytes = selected.reduce((n, p) => n + 16 + p.factors.length * 8 + 4 + bytesOf(p.residual.toString(16)).length, 0);
  const rawBytes = corpus.length - selected.reduce((n, p) => n + p.width, 0);
  choices.push({mask, selected: selected.length, dictBytes, recordBytes, rawBytes, archiveBytes: 24 + dictBytes + recordBytes + rawBytes});
}
choices.sort((a, b) => a.archiveBytes - b.archiveBytes || a.selected - b.selected || a.mask - b.mask);
const best = choices[0], selected = pages.filter((_, i) => best.mask & (1 << i));
const primeSet = [...new Set(selected.flatMap(p => p.factors.map(f => f.p)))].sort((a, b) => BigInt(`0x${a}`) < BigInt(`0x${b}`) ? -1 : 1);
const primeId = new Map(primeSet.map((p, i) => [p, i]));
const fd = openSync(archivePath, 'w'); let fileAt = 0;
function emit(b) { let done = 0; while (done < b.length) done += writeSync(fd, b, done, b.length - done, fileAt + done); fileAt += b.length; }
function u32(n) { const b = Buffer.alloc(4); b.writeUInt32BE(n); emit(b); }
function u64(n) { const b = Buffer.alloc(8); b.writeBigUInt64BE(BigInt(n)); emit(b); }
try {
  emit(Buffer.from('IXE0163\0', 'binary')); u64(corpus.length); u32(selected.length); u32(primeSet.length);
  for (const p of primeSet) { const b = bytesOf(p); u32(b.length); emit(b); }
  let corpusAt = 0;
  for (const p of selected) {
    u64(p.offset); u32(p.width); u32(p.factors.length);
    for (const f of p.factors) { u32(primeId.get(f.p)); u32(f.e); }
    const residual = bytesOf(p.residual.toString(16)); u32(residual.length); emit(residual);
    emit(corpus.subarray(corpusAt, p.offset)); corpusAt = p.offset + p.width;
  }
  emit(corpus.subarray(corpusAt));
} finally { closeSync(fd); }
assert.equal(statSync(archivePath).size, best.archiveBytes, 'encoded size differs from exhaustive subset cost model');
const decode = spawnSync(process.execPath, ['experiments/xml/decode-e0163.mjs', archivePath, restoredPath], {encoding: 'utf8'});
assert.equal(decode.status, 0, `standalone decoder failed: ${decode.stderr}`);
const comparison = spawnSync('cmp', [corpusPath, restoredPath]); assert.equal(comparison.status, 0, 'standalone decode differs bytewise from input');
const restoredSha = await hashFile(restoredPath); assert.equal(restoredSha, corpusSha);
const archiveBytes = statSync(archivePath).size;
const record = {experiment:'E0163',status:'verified',corpus_sha256:corpusSha,corpus_bytes:corpus.length,input_pages:pages.map(p=>({experiment:p.experiment,offset:p.offset,width:p.width,sha256:p.sha256,root_id:p.root_id,root_factor_count:p.factors.length,root_factor_exponent_sum:p.factors.reduce((n,f)=>n+f.e,0),root_factors:p.factors,residual_bytes:bytesOf(p.residual.toString(16)).length,residual_bits:p.residual===0n?0:p.residual.toString(2).length,root_record_bytes:20+p.factors.length*8+bytesOf(p.residual.toString(16)).length})),subset_count:choices.length,all_subset_costs:choices,selected_pages:selected.map(p=>p.root_id),dictionary_factor_count:primeSet.length,dictionary_factors:primeSet,factor_references:selected.reduce((n,p)=>n+p.factors.length,0),archive_bytes:archiveBytes,archive_sha256:await hashFile(archivePath),raw_complement_bytes:best.rawBytes,root_records_and_dictionary_bytes:best.dictBytes+best.recordBytes+24,raw_input_bytes:corpus.length,net_bytes_saved:corpus.length-archiveBytes,net_percent_saved:100*(corpus.length-archiveBytes)/corpus.length,decoder:'experiments/xml/decode-e0163.mjs',decoder_source_bytes:statSync('experiments/xml/decode-e0163.mjs').size,round_trip:'standalone decoder consumed only the archive; cmp matched every byte and decoded SHA-256 matched the input',subset_cost_model:'exhaustively scored all 4096 combinations, charging exact raw complement, unique prime dictionary, IDs, exponents, residual magnitudes, span headers, and archive header',archive_upload:false,command:'nix develop --no-update-lock-file --command node --max-old-space-size=4096 experiments/xml/factorized-root-archive-e0163.mjs data/enwik9 /tmp/E0163.ix /tmp/E0163.restored',nix_version:process.env.NIX_VERSION??null,node_version:process.version,revision:process.env.GITHUB_SHA??null,run_id:Number(process.env.GITHUB_RUN_ID),wall_seconds:(performance.now()-started)/1000,peak_rss_kib:process.resourceUsage().maxRSS,interpretation:'A negative net_bytes_saved means the factorized XML page-root representation did not compress this corpus under the explicit format and selected sample. Decoder source and runtime are reported separately; no contest-total claim.'};
writeFileSync('experiments/records/E0163.json', JSON.stringify(record, null, 2)+'\n');
console.log(JSON.stringify({event:'E0163_VERIFIED',archive_bytes:record.archive_bytes,net_bytes_saved:record.net_bytes_saved,selected_pages:selected.length,round_trip:true}));
