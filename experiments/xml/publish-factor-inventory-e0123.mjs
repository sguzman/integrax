import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const id='E0123', root='inventory/batches/E0123', recordPath='experiments/records/E0123.json';
const hash=x=>createHash('sha256').update(x).digest('hex');
const fromHex=s=>BigInt(`0x${s}`);
const hex=n=>n.toString(16);
const onDiskManifest=JSON.parse(readFileSync('inventory/manifest.json','utf8'));
const published=onDiskManifest.batches.some(x=>x.id===id);
const checkMode=process.argv.includes('--check')||published;
if(process.argv.includes('--check'))assert(published,'E0123 must be published before check mode');
const manifest=structuredClone(onDiskManifest);
if(checkMode){
 manifest.batches=manifest.batches.filter(x=>x.id!==id);
 manifest.index.shards=manifest.index.shards.filter(x=>!x.path.startsWith('inventory/index/E0123/'));
 manifest.indexed_nodes=46547;manifest.index.distinct_factors=13633;manifest.index.batch='E0121';
}
assert.equal(manifest.corpus_sha256,'159b85351e5f76e60cbe32e04c677847a9ecba3adc79addab6f4c6c7aa3744bc');
assert.equal(manifest.indexed_nodes,46547);assert.equal(manifest.index.distinct_factors,13633);
const files=readdirSync(root).filter(x=>x.endsWith('.json')&&x!=='snapshots.json').sort();
assert.equal(files.length,164);
const pages=new Map();
for(const file of files){
 const d=JSON.parse(readFileSync(join(root,file),'utf8'));
 assert.equal(d.batch,id);assert(d.rows.length>0);
 const p=pages.get(d.page)??{rows:[],files:[]};p.rows.push(...d.rows);p.files.push(file);pages.set(d.page,p);
}
const expected=[
 {offset:100726936,width:13485,sha256:'22ac6663b31d4f8cfe6a825e11a5e3f2c1724c7266fd12a54b544b05a4c0e6fd',nodes:5178,parents:899},
 {offset:400509751,width:12902,sha256:'d568bbccf04d3e003fc197b59dcaf1ff81b935a4083de40c2dd631ab5fa69ad4',nodes:4927,parents:928},
 {offset:800004795,width:13751,sha256:'62fcbdce155f94be9909f4c84f7ccf1542de23cdcfa5bc926e06aee8e23c30b7',nodes:6171,parents:1262},
];
assert.equal(pages.size,expected.length);
const prior=new Map();
for(const s of manifest.index.shards){
 const d=JSON.parse(readFileSync(s.path,'utf8'));assert.equal(d.factors.length,s.count);
 for(const f of d.factors){const p=fromHex(f.p);const q=prior.get(p);if(q)assert.equal(q,f.quality);else prior.set(p,f.quality)}
}
assert.equal(prior.size,manifest.index.distinct_factors);
const preexistingFactors=new Set(prior.keys());
const newIndex=new Map(),snapshotRows=[];
const metricNames=['nodes','leaves','parents','new_values','parent_new_values','full_hit_new_value','full_hit_seen_value','parent_full_hit_new_value','parent_full_hit_seen_value','parent_full_hit_distinct_witness','full_inventory_hits','parent_full_inventory_hits','full_bits_removed','parent_full_bits_removed','complete','partial','trivial','child_hits','global_hits','parent_child_hits','parent_global_hits','parent_better_than_cold','parent_worse_than_cold','parent_equal_cold','child_bits_removed','global_bits_removed'];
const aggregate=Object.fromEntries(metricNames.map(k=>[k,0]));
const levels=new Map(),frozen=Object.fromEntries(['E0104','E0105','E0106','E0107','E0108','E0110','E0112','E0114','E0116','E0119','E0121'].map(x=>[x,0]));
const batchShards=[];let rowsSeen=0;
for(const [pageNo,ex] of expected.entries()){
 const page=pages.get(ex.offset);assert(page);assert.equal(page.rows.length,ex.nodes);
 const rootRow=page.rows.find(r=>r.id===`enwik9:${ex.offset}:0`);assert(rootRow);
 assert.equal(rootRow.width,ex.width);assert.equal(rootRow.byte_sha256,ex.sha256);
 const rows=new Set();
 for(const row of page.rows){
  assert.equal(row.event,'FACTOR_OBJECT');assert(!rows.has(row.id));rows.add(row.id);
  assert.equal(row.offset>=ex.offset,true);assert(row.offset+row.width<=ex.offset+ex.width);
  assert.equal(row.n_bits,Math.max(0,(fromHex(row.cofactor)*row.factors.reduce((n,f)=>n*fromHex(f.p)**BigInt(f.e),1n)).toString(2).length));
  let last=Infinity;
  for(const x of row.fixed_inventory){assert.equal(x.bits<=last,true);last=x.bits;frozen[x.stage]+=x.bits}
  assert.deepEqual(row.fixed_inventory.map(x=>x.stage),Object.keys(frozen));
 }
 // Recreate the exact pre-page immutable snapshot from the accumulated factor set.
 const values=[...prior.keys()].filter(p=>p>97n).sort((a,b)=>a<b?-1:a>b?1:0).map(hex);
 const snapshotId=hash(Buffer.from(values.join(',')));
 assert(page.rows.every(r=>r.snapshot===snapshotId));
 snapshotRows.push({event:'FACTOR_SNAPSHOT',id:snapshotId,values});
 const stats=Object.fromEntries(metricNames.map(k=>[k,0]));
 const levelStats=new Map();
 for(const row of page.rows){
  rowsSeen++;
  const parent=row.children.length>0, sources=row.factors.flatMap(f=>f.sources);
  const full=sources.some(x=>x==='inventory-gcd'||x==='inventory-delta');
  const child=sources.includes('child'),global=sources.includes('global');
  const newValue=!row.value_seen;
  const add=(k,v=1)=>{stats[k]+=v;aggregate[k]+=v};
  add('nodes');add(parent?'parents':'leaves');add(newValue?'new_values':'nodes',newValue?1:0);
  if(parent&&newValue)add('parent_new_values');
  if(full){add('full_inventory_hits');add(newValue?'full_hit_new_value':'full_hit_seen_value');
   if(parent){add('parent_full_inventory_hits');add(newValue?'parent_full_hit_new_value':'parent_full_hit_seen_value');
    if(row.factors.some(f=>f.prior_distinct_witness&&f.sources.some(s=>s==='inventory-gcd'||s==='inventory-delta')))add('parent_full_hit_distinct_witness');}}
  add('full_bits_removed',row.reuse_bits-row.full_bits);if(parent)add('parent_full_bits_removed',row.reuse_bits-row.full_bits);
  add(row.status);if(child)add('child_hits');if(global)add('global_hits');
  if(parent){if(child)add('parent_child_hits');if(global)add('parent_global_hits');
   add(row.reuse_bits<row.cold_bits?'parent_better_than_cold':row.reuse_bits>row.cold_bits?'parent_worse_than_cold':'parent_equal_cold');}
  add('child_bits_removed',row.base_bits-row.child_bits);add('global_bits_removed',row.child_bits-row.reuse_bits);
  const l=levelStats.get(row.kind)??{nodes:0,parents:0,baseline_bits:0,cofactor_bits:0,full_bits_removed:0,frozen:Object.fromEntries(Object.keys(frozen).map(s=>[s,0]))};
  l.nodes++;l.parents+=Number(parent);l.baseline_bits+=row.base_bits;l.cofactor_bits+=row.cofactor_bits;l.full_bits_removed+=row.reuse_bits-row.full_bits;
  for(const x of row.fixed_inventory)l.frozen[x.stage]+=x.bits;levelStats.set(row.kind,l);
  for(const f of row.factors){
   const p=fromHex(f.p),quality=f.quality;assert(quality==='prime64'||quality==='probable-prime');
   const known=prior.get(p);if(known)assert.equal(known,quality);else prior.set(p,quality);
   if(!preexistingFactors.has(p)){const ix=newIndex.get(p)??{p:hex(p),quality,occurrences:[]};assert.equal(ix.quality,quality);ix.occurrences.push({id:row.id,e:f.e,source:id});newIndex.set(p,ix)}
  }
 }
 assert.equal(stats.nodes,ex.nodes);assert.equal(stats.parents,ex.parents);
 for(const file of page.files){const d=JSON.parse(readFileSync(join(root,file),'utf8'));batchShards.push({path:join(root,file),offset:ex.offset,rows:d.rows.length,width:ex.width,sha256:ex.sha256,root_id:`enwik9:${ex.offset}:0`})}
 ex.stats=stats;ex.root_id=`enwik9:${ex.offset}:0`;
}
assert.equal(rowsSeen,16276);assert.equal(aggregate.parents,3089);assert.equal(prior.size,16081);assert.equal(newIndex.size,2448);
assert.deepEqual([...pages.keys()].sort((a,b)=>a-b),expected.map(x=>x.offset));

const indexFiles=[];mkdirSync('inventory/index/E0123',{recursive:true});
const sorted=[...newIndex.values()].sort((a,b)=>{const x=fromHex(a.p),y=fromHex(b.p);return x<y?-1:x>y?1:0});
for(let i=0;i<sorted.length;i+=256){const chunk=sorted.slice(i,i+256),path=`inventory/index/E0123/${String(indexFiles.length).padStart(3,'0')}.json`;
 const generated={factors:chunk};
 if(checkMode)assert.deepEqual(JSON.parse(readFileSync(path,'utf8')),generated);else writeFileSync(path,JSON.stringify(generated,null,2)+'\n');
 indexFiles.push({path,count:chunk.length})}
const snapshotPath='inventory/batches/E0123/snapshots.json';
const snapshotDoc={batch:id,snapshots:snapshotRows};
if(checkMode)assert.deepEqual(JSON.parse(readFileSync(snapshotPath,'utf8')),snapshotDoc);else writeFileSync(snapshotPath,JSON.stringify(snapshotDoc,null,2)+'\n');
const pageRows=expected.map(({offset,width,sha256,stats,root_id})=>({offset,width,sha256,root_id,stats}));
const record={id,campaign:'C20',status:'verified',revision:'1db5c0a975079263ebe5ba044225b2c5d4b65ca1',run:45868290145,job:140076760728,
 corpus_sha256:manifest.corpus_sha256,shards:batchShards,index_delta_shards:indexFiles,snapshots:snapshotPath,pages:pageRows,aggregate,
 levels:Object.fromEntries(levels),frozen,summary:{event:'FACTOR_INVENTORY_SUMMARY',pages:pageRows.map(({offset,width,root_id})=>({offset,width,root_id})),distinct_factors:prior.size,nodes:rowsSeen,
  seeded_sources:['E0095','E0096','E0099','E0103','E0104','E0105','E0106','E0107','E0108','E0109','E0110','E0111','E0112','E0113','E0114','E0115','E0116','E0117','E0119','E0120','E0121','E0122']},
 wall_seconds:371.36,peak_rss_kib:1328748,product_recheck:'Hosted E0123 replay verified all 16,276 exact factor/cofactor products, 3,089 parent products, object bit widths, eleven frozen inventory controls, index union, and corpus SHA-256. Independent page checks: 5,178 rows / 899 parents; 4,927 / 928; 6,171 / 1,262. All 164 persisted object shards re-read and their snapshot IDs and counts checked during publication.',
 limitations:'Overlapping object records; inventory is research side information, not a compressed representation. Probable-prime labels retained.'};
for(const [kind,l]of levelStats)levels.set(kind,l);
record.levels=Object.fromEntries([...levels].sort(([a],[b])=>a.localeCompare(b)));
manifest.batches.push({id,record:recordPath,shards:batchShards,snapshots:snapshotPath});
manifest.indexed_nodes+=rowsSeen;manifest.index.batch=id;manifest.index.distinct_factors=prior.size;manifest.index.shards.push(...indexFiles);
if(checkMode){
 assert.deepEqual(JSON.parse(readFileSync(recordPath,'utf8')),record);
 assert.deepEqual(onDiskManifest,manifest);
}else{
 writeFileSync(recordPath,JSON.stringify(record,null,2)+'\n');
 writeFileSync('inventory/manifest.json',JSON.stringify(manifest,null,2)+'\n');
}
console.log(JSON.stringify({event:'E0123_PUBLICATION',nodes:rowsSeen,shards:batchShards.length,new_factors:newIndex.size,distinct_factors:prior.size,index_shards:indexFiles.length,snapshots:snapshotRows.map(x=>x.id),aggregate,outputs:[recordPath,snapshotPath,'inventory/manifest.json']},null,2));
