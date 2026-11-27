import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdirSync,readFileSync,statSync,writeFileSync} from 'node:fs';

const ID='E0137',ROOT='inventory/batches/E0137',RECORD='experiments/records/E0137.json';
const stages=['E0104','E0105','E0106','E0107','E0108','E0110','E0112','E0114','E0116','E0119','E0121','E0123','E0126','E0128','E0131','E0134'];
const hash=b=>createHash('sha256').update(b).digest('hex');
const fromHex=s=>BigInt('0x'+(s||'0'));
const hx=n=>n.toString(16);
const bits=n=>n===0n?0:n.toString(2).length;
const corpus=readFileSync('data/enwik9'),sha=hash(corpus);
assert.equal(corpus.length,1_000_000_000);
assert.equal(sha,'159b85351e5f76e60cbe32e04c677847a9ecba3adc79addab6f4c6c7aa3744bc');
const onDisk=JSON.parse(readFileSync('inventory/manifest.json','utf8'));
assert.equal(onDisk.indexed_nodes,145523);assert.equal(onDisk.index.distinct_factors,28721);assert.equal(onDisk.batches.at(-1).id,'E0134');
assert(!onDisk.batches.some(x=>x.id===ID));
const manifest=structuredClone(onDisk);
const events=readFileSync('data/E0137.jsonl','utf8').split('\n').filter(Boolean).map(x=>JSON.parse(x));
const rows=events.filter(x=>x.event==='FACTOR_OBJECT'),summary=events.findLast(x=>x.event==='FACTOR_INVENTORY_SUMMARY');
const pageEvents=events.filter(x=>x.event==='FACTOR_PAGE');
assert(summary&&rows.length===summary.nodes);
assert.equal(pageEvents.length,3);
const pages=new Map();
for(const row of rows){const offset=Number(row.id.split(':')[1]);const list=pages.get(offset)??[];list.push(row);pages.set(offset,list)}
assert.equal(pages.size,3);
const prior=new Map();
for(const shard of manifest.index.shards){
 const data=JSON.parse(readFileSync(shard.path,'utf8'));assert.equal(data.factors.length,shard.count);
 for(const f of data.factors){const p=fromHex(f.p),q=prior.get(p);if(q)assert.equal(q,f.quality);else prior.set(p,f.quality)}
}
assert.equal(prior.size,manifest.index.distinct_factors);
const preexisting=new Set(prior.keys()),newIndex=new Map(),snapshots=[],batchShards=[];
const totals={nodes:0,parents:0,leaves:0,complete:0,partial:0,trivial:0,child_hits:0,global_hits:0,full_inventory_hits:0,child_bits_removed:0,global_bits_removed:0,full_bits_removed:0,inventory_flat_tests:0,tree_gcd_calls:0,flat_snapshot_ms:0,tree_snapshot_ms:0,frozen_e0134_bits:0,flat_snapshot_bits:0,tree_snapshot_bits:0,flat_full_bits:0};
const byKind=new Map(),frozen=Object.fromEntries(stages.map(s=>[s,0]));
const pageRecords=[];
for(const [offset,pageRows] of [...pages].sort((a,b)=>a[0]-b[0])){
 assert(!manifest.batches.some(b=>b.shards.some(s=>s.offset===offset)));
 const rootId=`enwik9:${offset}:0`,root=pageRows.find(x=>x.id===rootId);assert(root);
 const width=root.width,bytes=corpus.subarray(offset,offset+width);
 assert.equal(bytes.length,width);
 const snapValues=[...prior.keys()].filter(p=>p>97n).sort((a,b)=>a<b?-1:a>b?1:0).map(hx);
 const snapId=hash(Buffer.from(snapValues.join(',')));
 assert(pageRows.every(r=>r.snapshot===snapId));
 snapshots.push({event:'FACTOR_SNAPSHOT',id:snapId,values:snapValues});
 const byId=new Map(pageRows.map(r=>[r.id,r]));assert.equal(byId.size,pageRows.length);
 let parents=0,fullHits=0,childHits=0,globalHits=0,bitsRemoved=0;
 for(const row of pageRows){
  const raw=corpus.subarray(row.offset,row.offset+row.width);assert.equal(hash(raw),row.byte_sha256);
  const n=raw.length?fromHex(raw.toString('hex')):0n;
  const product=row.factors.reduce((x,f)=>x*fromHex(f.p)**BigInt(f.e),fromHex(row.cofactor));
  assert.equal(product,n);assert.equal(bits(n),row.n_bits);
  const parent=row.children.length>0;if(parent)parents++;
  if(parent){
   let cursor=row.offset,assembled=0n;
   for(const id of row.children){const c=byId.get(id);assert(c);assert.equal(c.parent,row.id);assert.equal(c.offset,cursor);cursor+=c.width;assembled=(assembled<<BigInt(8*c.width))+fromHex(c.factors.reduce((x,f)=>x*fromHex(f.p)**BigInt(f.e),fromHex(c.cofactor)).toString(16))}
   assert.equal(cursor,row.offset+row.width);assert.equal(assembled,n)
  }
  assert.deepEqual(row.fixed_inventory.map(x=>x.stage),stages);
  let last=Infinity;for(const x of row.fixed_inventory){assert(x.bits<=last);last=x.bits;frozen[x.stage]+=x.bits}
  const baseline=row.fixed_inventory.find(x=>x.stage==='E0134');assert(baseline);assert.equal(row.flat_snapshot_bits,row.tree_snapshot_bits,`flat/tree snapshot mismatch for ${row.id}`);assert.equal(row.snapshot_bits,row.flat_snapshot_bits);assert(row.full_bits<=baseline.bits,`flat inventory exceeded frozen E0134 residual for ${row.id}`);
  totals.frozen_e0134_bits+=baseline.bits;totals.flat_snapshot_bits+=row.flat_snapshot_bits;totals.tree_snapshot_bits+=row.tree_snapshot_bits;totals.flat_full_bits+=row.full_bits;
  const fs=row.factors.flatMap(f=>f.sources),full=fs.some(s=>s==='inventory-flat'||s==='inventory-delta'),child=fs.includes('child'),global=fs.includes('global');
  if(full){fullHits++;totals.full_inventory_hits++}if(child){childHits++;totals.child_hits++}if(global){globalHits++;totals.global_hits++}
  bitsRemoved+=row.reuse_bits-row.full_bits;
  totals.inventory_flat_tests+=row.inventory_flat_tests??0;
  totals.tree_gcd_calls+=row.tree_gcd_calls??0;totals.flat_snapshot_ms+=row.flat_snapshot_ms??0;totals.tree_snapshot_ms+=row.tree_snapshot_ms??0;
  totals.nodes++;totals[row.children.length?'parents':'leaves']++;totals[row.status]++;
  totals.child_bits_removed+=row.base_bits-row.child_bits;totals.global_bits_removed+=row.child_bits-row.reuse_bits;totals.full_bits_removed+=row.reuse_bits-row.full_bits;
  const k=byKind.get(row.kind)??{nodes:0,parents:0,bits:0,remaining_bits:0,full_bits_removed:0,full_hits:0};
  k.nodes++;k.parents+=Number(parent);k.bits+=row.n_bits;k.remaining_bits+=row.cofactor_bits;k.full_bits_removed+=row.reuse_bits-row.full_bits;k.full_hits+=Number(full);byKind.set(row.kind,k);
  for(const f of row.factors){
   const p=fromHex(f.p);assert(f.quality==='prime64'||f.quality==='probable-prime');
   const q=prior.get(p);if(q)assert.equal(q,f.quality);else prior.set(p,f.quality);
   if(!preexisting.has(p)){const ix=newIndex.get(p)??{p:hx(p),quality:f.quality,occurrences:[]};assert.equal(ix.quality,f.quality);ix.occurrences.push({id:row.id,e:f.e,source:ID});newIndex.set(p,ix)}
  }
 }
 const shardFiles=[];mkdirSync(ROOT,{recursive:true});
 for(let i=0;i<pageRows.length;i+=100){
  const part=pageRows.slice(i,i+100),path=`${ROOT}/${offset}-${String(shardFiles.length).padStart(3,'0')}.json`;
  writeFileSync(path,JSON.stringify({batch:ID,page:offset,rows:part})+'\n');
  shardFiles.push(path);batchShards.push({path,offset,rows:part.length,width,sha256:hash(bytes),root_id:rootId});
 }
 pageRecords.push({offset,width,sha256:hash(bytes),root_id:rootId,nodes:pageRows.length,parents,full_inventory_hits:fullHits,child_hits:childHits,global_hits:globalHits,full_bits_removed:bitsRemoved,shards:shardFiles.length});
}
assert.equal(totals.nodes,summary.nodes);
assert.equal(totals.flat_snapshot_bits,totals.tree_snapshot_bits);
totals.flat_stage_extra_bits_removed=totals.frozen_e0134_bits-totals.flat_full_bits;assert(totals.flat_stage_extra_bits_removed>=0);
assert.equal(totals.parents,pageEvents.reduce((n,x)=>n+x.stats.parents,0));
assert.deepEqual(pageRecords.map(({offset,width,root_id})=>({offset,width,root_id})),summary.pages);
for(const p of pageRecords){const e=pageEvents.find(x=>x.offset===p.offset);assert(e);assert.equal(e.width,p.width);assert.equal(e.sha256,p.sha256);assert.equal(p.nodes,e.stats.nodes);assert.equal(p.parents,e.stats.parents)}
assert.equal(prior.size,summary.distinct_factors);assert.equal(newIndex.size,prior.size-preexisting.size);
const indexDir='inventory/index/E0137';mkdirSync(indexDir,{recursive:true});
const sorted=[...newIndex.values()].sort((a,b)=>{const x=fromHex(a.p),y=fromHex(b.p);return x<y?-1:x>y?1:0});
const indexFiles=[];
for(let i=0;i<sorted.length;i+=256){const path=`${indexDir}/${String(indexFiles.length).padStart(3,'0')}.json`,chunk=sorted.slice(i,i+256);writeFileSync(path,JSON.stringify({factors:chunk},null,2)+'\n');indexFiles.push({path,count:chunk.length})}
const snapshotPath=`${ROOT}/snapshots.json`;writeFileSync(snapshotPath,JSON.stringify({batch:ID,snapshots},null,2)+'\n');
const time=readFileSync('data/E0137.time','utf8');
const sec=/Elapsed \(wall clock\) time .*?: (.+)/.exec(time)?.[1]??null;
const wallSeconds=sec?sec.split(':').reduce((a,x)=>a*60+Number(x),0):null;
const peakRss=Number(/Maximum resident set size \(kbytes\): (\d+)/.exec(time)?.[1]??0)||null;
const runId=Number(process.env.E0137_RUN_ID??0)||null;
const revision=process.env.E0137_HEAD_SHA??null;
manifest.batches.push({id:ID,record:RECORD,shards:batchShards,snapshots:snapshotPath});
manifest.indexed_nodes+=totals.nodes;manifest.index.batch=ID;manifest.index.distinct_factors=prior.size;manifest.index.shards.push(...indexFiles);
const unique=(xs)=>[...new Set(xs)];
const objectPaths=unique(manifest.batches.flatMap(b=>b.shards.map(s=>s.path)));
const snapshotPaths=unique(manifest.batches.map(b=>b.snapshots).filter(Boolean));
const indexPaths=unique(manifest.index.shards.map(s=>s.path));
const refinementPaths=unique((manifest.refinements??[]).map(x=>x.path));
const byteSum=paths=>paths.reduce((n,p)=>n+statSync(p).size,0);
const storage={corpus_bytes:corpus.length,new_object_json_bytes:byteSum(batchShards.map(s=>s.path)),new_index_json_bytes:byteSum(indexFiles.map(s=>s.path)),cumulative_object_json_bytes:byteSum(objectPaths),cumulative_factor_index_json_bytes:byteSum(indexPaths),cumulative_snapshot_json_bytes:byteSum(snapshotPaths),cumulative_refinement_json_bytes:byteSum(refinementPaths),cumulative_inventory_json_bytes:byteSum(unique([...objectPaths,...indexPaths,...snapshotPaths,...refinementPaths])),accounting:'Repository JSON research side information only; this is not an encoded archive or a corpus partition. Seed records and experiment reports are excluded.'};
const record={id:ID,campaign:'C20',status:'verified',revision,run_id:runId,corpus_sha256:sha,shards:batchShards,index_delta_shards:indexFiles,snapshots:snapshotPath,pages:pageRecords,aggregate:totals,levels:Object.fromEntries([...byKind].sort(([a],[b])=>a.localeCompare(b))),frozen,summary:{...summary},storage,wall_seconds:wallSeconds,peak_rss_kib:peakRss,candidate_algorithm:'flat-scan for accumulated inventory and in-page delta; balanced product trees retained for frozen controls',product_recheck:'Publication re-read all hosted rows, matched each byte span and SHA-256 against enwik9, checked each exact factor/cofactor product, verified every ordered child partition by radix-256 concatenation, checked all sixteen nested frozen inventory controls through E0134 and all page snapshots, then reconstructed the cumulative factor index.'};
writeFileSync(RECORD,JSON.stringify(record,null,2)+'\n');
writeFileSync('inventory/manifest.json',JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({event:'E0137_PUBLICATION',nodes:totals.nodes,parents:totals.parents,new_factors:newIndex.size,distinct_factors:prior.size,object_shards:batchShards.length,index_shards:indexFiles.length,pages:pageRecords,inventory_flat_tests:totals.inventory_flat_tests,outputs:[RECORD,snapshotPath,'inventory/manifest.json']},null,2));
