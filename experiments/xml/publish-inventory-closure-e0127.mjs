import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdirSync,readFileSync,statSync,writeFileSync} from 'node:fs';

const ID='E0127',REF_PATH='inventory/refinements/E0127.json',RECORD='experiments/records/E0127.json';
const hex=b=>createHash('sha256').update(b).digest('hex');
const N=s=>BigInt('0x'+(s||'0'));
const bitlen=n=>n===0n?0:n.toString(2).length;
const corpus=readFileSync('data/enwik9'),corpusHash=hex(corpus);
assert.equal(corpus.length,1_000_000_000);
assert.equal(corpusHash,'159b85351e5f76e60cbe32e04c677847a9ecba3adc79addab6f4c6c7aa3744bc');
const diskManifest=JSON.parse(readFileSync('inventory/manifest.json','utf8'));
assert.equal(diskManifest.indexed_nodes,80082);assert.equal(diskManifest.index.distinct_factors,18778);
assert(!diskManifest.refinements.some(x=>x.id===ID));
const manifest=structuredClone(diskManifest),objects=new Map(),factorWitnesses=new Map(),factorQuality=new Map();
for(const batch of manifest.batches)for(const shard of batch.shards){
 const doc=JSON.parse(readFileSync(shard.path,'utf8'));assert.equal(doc.rows.length,shard.rows);
 for(const row of doc.rows){assert(!objects.has(row.id));objects.set(row.id,row)}
}
assert.equal(objects.size,manifest.indexed_nodes);
for(const shard of manifest.index.shards){
 const doc=JSON.parse(readFileSync(shard.path,'utf8'));assert.equal(doc.factors.length,shard.count);
 for(const f of doc.factors){
  const p=N(f.p),quality=factorQuality.get(p);if(quality)assert.equal(quality,f.quality);else factorQuality.set(p,f.quality);
  const set=factorWitnesses.get(p)??new Set();for(const o of f.occurrences??[])set.add(o.id);factorWitnesses.set(p,set);
 }
}
assert.equal(factorQuality.size,manifest.index.distinct_factors);
const residual=new Map();
for(const [id,row] of objects)residual.set(id,N(row.cofactor));
for(const item of manifest.refinements){
 const data=JSON.parse(readFileSync(item.path,'utf8'));assert.equal(data.rows.length,item.rows);
 for(const ref of data.rows){
  const row=objects.get(ref.id);assert(row);
  const current=residual.get(ref.id);assert.equal(N(ref.old_cofactor),current);
  const next=N(ref.remaining);
  assert.equal(ref.factors.reduce((v,f)=>v*N(f.p)**BigInt(f.e),next),current);
  assert.equal(ref.unresolved_parts.reduce((v,x)=>v*N(x),1n),next);
  residual.set(ref.id,next);
 }
}
const events=readFileSync('data/E0127.jsonl','utf8').split('\n').filter(Boolean).map(x=>JSON.parse(x));
const refinements=events.filter(x=>x.event==='COFACTOR_REFINEMENT'),summary=events.findLast(x=>x.event==='COFACTOR_SUMMARY');
assert(summary);assert.equal(summary.loaded,manifest.indexed_nodes);assert.equal(summary.known_factors,manifest.index.distinct_factors);
assert.equal(summary.improved,refinements.length);
let bitsRemoved=0,parents=0,completed=0;const uniqueValues=new Set();
for(const ref of refinements){
 const row=objects.get(ref.id);assert(row);
 const current=residual.get(ref.id);assert.equal(N(ref.old_cofactor),current);
 assert.equal(ref.kind,row.kind);assert.equal(ref.parent,row.children.length>0);
 const nBytes=corpus.subarray(row.offset,row.offset+row.width);
 assert.equal(hex(nBytes),row.byte_sha256);
 const n=nBytes.length?N(nBytes.toString('hex')):0n;
 assert.equal(row.factors.reduce((v,f)=>v*N(f.p)**BigInt(f.e),N(row.cofactor)),n);
 const next=N(ref.remaining);assert.equal(ref.factors.length>0,true);
 for(const f of ref.factors){
  const p=N(f.p);assert.equal(f.quality,factorQuality.get(p));
  assert(factorWitnesses.get(p)?.has(f.witness),'factor witness must occur in the indexed inventory');
  assert.equal(f.source,'inventory-gcd');
 }
 assert.equal(ref.factors.reduce((v,f)=>v*N(f.p)**BigInt(f.e),next),current);
 assert.equal(ref.unresolved_parts.reduce((v,x)=>v*N(x),1n),next);
 assert.equal(ref.old_bits,bitlen(current));assert.equal(ref.remaining_bits,bitlen(next));
 if(row.children.length){
  let cursor=row.offset,value=0n;
  for(const childId of row.children){
   const c=objects.get(childId);assert(c);assert.equal(c.parent,row.id);assert.equal(c.offset,cursor);
   const b=corpus.subarray(c.offset,c.offset+c.width);assert.equal(hex(b),c.byte_sha256);
   cursor+=c.width;value=(value<<BigInt(8*c.width))+(b.length?N(b.toString('hex')):0n);
  }
  assert.equal(cursor,row.offset+row.width);assert.equal(value,n);
 }
 bitsRemoved+=ref.old_bits-ref.remaining_bits;parents+=Number(ref.parent);
 if(next===1n)completed++;
 uniqueValues.add(n.toString(16));
 residual.set(ref.id,next);
}
assert.equal(bitsRemoved,summary.bits_removed);assert.equal(parents,summary.parent_improved);
assert.equal(completed,summary.completed);assert.equal(uniqueValues.size,summary.unique_improved_values);
const overlay={batch:ID,rows:refinements};writeFileSync(REF_PATH,JSON.stringify(overlay,null,2)+'\n');
manifest.refinements.push({id:ID,path:REF_PATH,rows:refinements.length,record:RECORD});
writeFileSync('inventory/manifest.json',JSON.stringify(manifest,null,2)+'\n');
const time=readFileSync('data/E0127.time','utf8'),elapsed=/Elapsed \(wall clock\) time .*?: (.+)/.exec(time)?.[1]??'';
const wallSeconds=elapsed?elapsed.split(':').reduce((a,x)=>a*60+Number(x),0):null;
const peakRssKiB=Number(/Maximum resident set size \(kbytes\): (\d+)/.exec(time)?.[1]??0)||null;
const refinementBytes=statSync(REF_PATH).size;
const inventoryPaths=[...manifest.batches.flatMap(b=>[...b.shards.map(s=>s.path),b.snapshots].filter(Boolean)),...manifest.index.shards.map(s=>s.path),...manifest.refinements.map(x=>x.path)];
const researchJsonBytes=[...new Set(inventoryPaths)].reduce((n,p)=>n+statSync(p).size,0);
const record={
 experiment:ID,revision:process.env.E0127_HEAD_SHA??null,run_id:Number(process.env.E0127_RUN_ID??0)||null,
 corpus_sha256:corpusHash,indexed_objects:manifest.indexed_nodes,known_factors:manifest.index.distinct_factors,
 command:'timeout --kill-after=10s 900s nix develop --no-update-lock-file --command node --max-old-space-size=3072 experiments/xml/inventory-scale-closure.mjs data/enwik9',
 nix_version:readFileSync('data/E0127.nix-version','utf8').trim(),node_version:readFileSync('data/E0127.node-version','utf8').trim(),
 wall_seconds:wallSeconds,peak_rss_kib:peakRssKiB,summary,refinement_rows:refinements.length,
 parent_refinements:parents,unique_improved_values:uniqueValues.size,completed,bits_removed:bitsRemoved,
 storage:{new_refinement_json_bytes:refinementBytes,cumulative_inventory_json_bytes:researchJsonBytes,corpus_bytes:corpus.length,accounting:'Research JSON side information, not an archive. Includes object shards, factor-index shards, snapshots, and refinement overlays; excludes experiment reports and seed records.'},
 verification:'Hosted measurement replayed all previous overlays and exact parents. Independent publication verified the authentic corpus digest, each changed object byte hash, original and refined exact cofactor products, indexed factor qualities and occurrence witnesses, bit lengths, unresolved partitions, parent child spans and radix-256 reconstruction.'
};
writeFileSync(RECORD,JSON.stringify(record,null,2)+'\n');
console.log(JSON.stringify({event:'E0127_PUBLICATION',refinement_rows:refinements.length,parent_refinements:parents,unique_values:uniqueValues.size,completed,bits_removed:bitsRemoved,new_refinement_json_bytes:refinementBytes,cumulative_inventory_json_bytes:researchJsonBytes,outputs:[RECORD,REF_PATH,'inventory/manifest.json']},null,2));
