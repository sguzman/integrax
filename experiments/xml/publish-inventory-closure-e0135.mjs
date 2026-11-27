import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,statSync,writeFileSync} from 'node:fs';

const ID='E0135',REF_PATH='inventory/refinements/E0135.json',RECORD='experiments/records/E0135.json';
const hash=b=>createHash('sha256').update(b).digest('hex');
const N=s=>BigInt('0x'+(s||'0'));
const bitlen=n=>n===0n?0:n.toString(2).length;
const corpus=readFileSync('data/enwik9'),corpusHash=hash(corpus);
assert.equal(corpus.length,1_000_000_000);
assert.equal(corpusHash,'159b85351e5f76e60cbe32e04c677847a9ecba3adc79addab6f4c6c7aa3744bc');
const disk=JSON.parse(readFileSync('inventory/manifest.json','utf8'));
assert(!disk.refinements.some(x=>x.id===ID));
const manifest=structuredClone(disk),objects=new Map(),factorWitnesses=new Map(),factorQuality=new Map();
for(const batch of manifest.batches)for(const shard of batch.shards){
 const doc=JSON.parse(readFileSync(shard.path,'utf8'));assert.equal(doc.rows.length,shard.rows);
 for(const row of doc.rows){assert(!objects.has(row.id));objects.set(row.id,row)}
}
assert.equal(objects.size,manifest.indexed_nodes);
for(const shard of manifest.index.shards){
 const doc=JSON.parse(readFileSync(shard.path,'utf8'));assert.equal(doc.factors.length,shard.count);
 for(const f of doc.factors){
  const p=N(f.p),old=factorQuality.get(p);if(old)assert.equal(old,f.quality);else factorQuality.set(p,f.quality);
  const set=factorWitnesses.get(p)??new Set();for(const item of f.occurrences??[])set.add(item.id);factorWitnesses.set(p,set);
 }
}
assert.equal(factorQuality.size,manifest.index.distinct_factors);
const residual=new Map([...objects].map(([id,row])=>[id,N(row.cofactor)]));
for(const item of manifest.refinements){
 const doc=JSON.parse(readFileSync(item.path,'utf8'));assert.equal(doc.rows.length,item.rows);
 for(const ref of doc.rows){
  const current=residual.get(ref.id);assert.notEqual(current,undefined);assert.equal(N(ref.old_cofactor),current);
  const next=N(ref.remaining);
  assert.equal(ref.factors.reduce((v,f)=>v*N(f.p)**BigInt(f.e),next),current);
  assert.equal(ref.unresolved_parts.reduce((v,x)=>v*N(x),1n),next);
  residual.set(ref.id,next);
 }
}
const events=readFileSync('data/E0135.jsonl','utf8').split('\n').filter(Boolean).map(x=>JSON.parse(x));
const refinements=events.filter(x=>x.event==='COFACTOR_REFINEMENT'),summary=events.findLast(x=>x.event==='COFACTOR_SUMMARY');
assert(summary);assert.equal(summary.loaded,manifest.indexed_nodes);assert.equal(summary.known_factors,manifest.index.distinct_factors);
assert.equal(summary.improved,refinements.length);
let bitsRemoved=0,parents=0,completed=0;const unique=new Set();
for(const ref of refinements){
 const row=objects.get(ref.id);assert(row);
 const current=residual.get(ref.id);assert.equal(N(ref.old_cofactor),current);
 assert.equal(ref.kind,row.kind);assert.equal(ref.parent,row.children.length>0);
 const bytes=corpus.subarray(row.offset,row.offset+row.width);assert.equal(hash(bytes),row.byte_sha256);
 const n=bytes.length?N(bytes.toString('hex')):0n;
 assert.equal(row.factors.reduce((v,f)=>v*N(f.p)**BigInt(f.e),N(row.cofactor)),n);
 const next=N(ref.remaining);assert(ref.factors.length>0);
 for(const f of ref.factors){
  const p=N(f.p);assert.equal(f.quality,factorQuality.get(p));
  assert(factorWitnesses.get(p)?.has(f.witness));
  assert.equal(f.source,'inventory-gcd');
 }
 assert.equal(ref.factors.reduce((v,f)=>v*N(f.p)**BigInt(f.e),next),current);
 assert.equal(ref.unresolved_parts.reduce((v,x)=>v*N(x),1n),next);
 assert.equal(ref.old_bits,bitlen(current));assert.equal(ref.remaining_bits,bitlen(next));
 if(row.children.length){
  let at=row.offset,value=0n;
  for(const childId of row.children){
   const child=objects.get(childId);assert(child);assert.equal(child.parent,row.id);assert.equal(child.offset,at);
   const b=corpus.subarray(child.offset,child.offset+child.width);assert.equal(hash(b),child.byte_sha256);
   at+=child.width;value=(value<<BigInt(8*child.width))+(b.length?N(b.toString('hex')):0n);
  }
  assert.equal(at,row.offset+row.width);assert.equal(value,n);
 }
 bitsRemoved+=ref.old_bits-ref.remaining_bits;parents+=Number(ref.parent);if(next===1n)completed++;
 unique.add(n.toString(16));residual.set(ref.id,next);
}
assert.equal(bitsRemoved,summary.bits_removed);assert.equal(parents,summary.parent_improved);
assert.equal(completed,summary.completed);assert.equal(unique.size,summary.unique_improved_values);
writeFileSync(REF_PATH,JSON.stringify({batch:ID,rows:refinements},null,2)+'\n');
manifest.refinements.push({id:ID,path:REF_PATH,rows:refinements.length,record:RECORD});
writeFileSync('inventory/manifest.json',JSON.stringify(manifest,null,2)+'\n');
const time=readFileSync('data/E0135.time','utf8'),elapsed=/Elapsed \(wall clock\) time .*?: (.+)/.exec(time)?.[1]??'';
const wallSeconds=elapsed?elapsed.split(':').reduce((a,x)=>a*60+Number(x),0):null;
const peakRssKiB=Number(/Maximum resident set size \(kbytes\): (\d+)/.exec(time)?.[1]??0)||null;
const artifactPaths=[...manifest.batches.flatMap(b=>[...b.shards.map(s=>s.path),b.snapshots].filter(Boolean)),...manifest.index.shards.map(s=>s.path),...manifest.refinements.map(x=>x.path)];
const researchBytes=[...new Set(artifactPaths)].reduce((n,p)=>n+statSync(p).size,0);
const record={
 experiment:ID,revision:process.env.E0135_HEAD_SHA??null,run_id:Number(process.env.E0135_RUN_ID??0)||null,
 corpus_sha256:corpusHash,indexed_objects:manifest.indexed_nodes,known_factors:manifest.index.distinct_factors,
 command:'timeout --kill-after=10s 1500s nix develop --no-update-lock-file --command node --max-old-space-size=3072 experiments/xml/inventory-scale-closure.mjs data/enwik9',
 nix_version:readFileSync('data/E0135.nix-version','utf8').trim(),node_version:readFileSync('data/E0135.node-version','utf8').trim(),
 wall_seconds:wallSeconds,peak_rss_kib:peakRssKiB,summary,refinement_rows:refinements.length,
 parent_refinements:parents,unique_improved_values:unique.size,completed,bits_removed:bitsRemoved,
 storage:{new_refinement_json_bytes:statSync(REF_PATH).size,cumulative_inventory_json_bytes:researchBytes,corpus_bytes:corpus.length,accounting:'Research JSON side information, not an archive. Includes object shards, factor-index shards, snapshots, and refinement overlays; excludes experiment reports and seed records.'},
 verification:'Hosted replay checked all persisted object hashes, parent synthesis and prior overlays. Independent publication verified the authentic corpus digest, each changed object byte hash, exact original and refined factor/cofactor products, indexed factor qualities and occurrence witnesses, bit lengths, unresolved partitions, parent child spans and radix-256 reconstruction.'
};
writeFileSync(RECORD,JSON.stringify(record,null,2)+'\n');
console.log(JSON.stringify({event:'E0135_PUBLICATION',refinement_rows:refinements.length,parent_refinements:parents,unique_values:unique.size,completed,bits_removed:bitsRemoved,new_refinement_json_bytes:statSync(REF_PATH).size,cumulative_inventory_json_bytes:researchBytes,outputs:[RECORD,REF_PATH,'inventory/manifest.json']},null,2));
