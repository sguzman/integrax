import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {performance} from 'node:perf_hooks';

const started=performance.now();
const sha=b=>createHash('sha256').update(b).digest('hex');
const H=s=>BigInt(`0x${s||'0'}`),hex=n=>n.toString(16),bits=n=>n===0n?0:n.toString(2).length;
const corpusPath=process.argv[2];
assert(corpusPath,'corpus path required');
const manifestBytes=readFileSync('inventory/manifest.json');
const manifest=JSON.parse(manifestBytes);
const expectedHash='159b85351e5f76e60cbe32e04c677847a9ecba3adc79addab6f4c6c7aa3744bc';
assert.equal(manifest.corpus_sha256,expectedHash);
const corpus=readFileSync(corpusPath);
assert.equal(corpus.length,1_000_000_000);
assert.equal(sha(corpus),expectedHash);

const bandOf=w=>w<=32?'1-32':w<=128?'33-128':w<=512?'129-512':w<=2048?'513-2048':'2049-262144';
const widths=['1-32','33-128','129-512','513-2048','2049-262144'];
const positions=['prefix','interior','suffix','whole'];
const quota=20,maxWidth=262144;
const rows=new Map();let loaded=0;
for(const batch of manifest.batches)for(const shard of batch.shards){
 const data=JSON.parse(readFileSync(shard.path,'utf8'));
 assert.equal(data.rows.length,shard.rows);
 for(const row of data.rows){assert(!rows.has(row.id),`duplicate row ${row.id}`);rows.set(row.id,row);loaded++}
}
assert.equal(loaded,manifest.indexed_nodes);
const pop=new Map(),heaps=new Map(),missingChildren=new Set();
for(const w of widths)for(const pos of positions){const k=`${w}|${pos}`;pop.set(k,0);heaps.set(k,[])}
function position(parent,child){
 const atStart=child.offset===parent.offset,atEnd=child.offset+child.width===parent.offset+parent.width;
 if(atStart&&atEnd)return 'whole';if(atStart)return 'prefix';if(atEnd)return 'suffix';return 'interior';
}
for(const parent of rows.values()){
 if(!parent.children?.length||parent.width>maxWidth)continue;
 for(const id of parent.children){
  const child=rows.get(id);if(!child){missingChildren.add(id);continue}
  if(child.width>maxWidth||!child.factors?.length)continue;
  const pos=position(parent,child),w=bandOf(child.width),key=`${w}|${pos}`;
  pop.set(key,pop.get(key)+1);
  const digest=sha(Buffer.from(`${parent.id}\n${child.id}`));
  const item={digest,parent_id:parent.id,child_id:child.id,parent_offset:parent.offset,parent_width:parent.width,child_offset:child.offset,child_width:child.width};
  const heap=heaps.get(key);
  if(heap.length<quota)heap.push(item);
  else {let largest=0;for(let i=1;i<heap.length;i++)if(heap[i].digest>heap[largest].digest)largest=i;if(digest<heap[largest].digest)heap[largest]=item}
 }
}
function modBytes(bytes,p){let r=0n;for(const b of bytes)r=(r*256n+BigInt(b))%p;return r}
function powMod(a,e,p){let r=1n;while(e){if(e&1)r=r*a%p;a=a*a%p;e>>=1}return r}
const summaries=new Map();let sampledEdges=0,candidateFactors=0,predictedHits=0,observedHits=0,comparisons=0,totalSampledBytes=0;
const samples=[];
for(const w of widths)for(const pos of positions){
 const key=`${w}|${pos}`,sample=heaps.get(key).sort((a,b)=>a.digest.localeCompare(b.digest));
 for(const pair of sample){
  const parent=rows.get(pair.parent_id),child=rows.get(pair.child_id);
  assert(parent&&child);assert(child.offset>=parent.offset&&child.offset+child.width<=parent.offset+parent.width);
  const parentBytes=corpus.subarray(parent.offset,parent.offset+parent.width),childBytes=corpus.subarray(child.offset,child.offset+child.width);
  assert.equal(parentBytes.length,parent.width);assert.equal(childBytes.length,child.width);
  assert.equal(sha(parentBytes),parent.byte_sha256,`parent source hash ${parent.id}`);
  assert.equal(sha(childBytes),child.byte_sha256,`child source hash ${child.id}`);
  const left=corpus.subarray(parent.offset,child.offset),right=corpus.subarray(child.offset+child.width,parent.offset+parent.width);
  const distinct=new Set();
  for(const f of child.factors){
   const p=H(f.p);assert(p>1n,`invalid child factor ${f.p}`);assert(!distinct.has(p),`duplicate child factor ${f.p}`);distinct.add(p);
   const childResidue=modBytes(childBytes,p),parentResidue=modBytes(parentBytes,p);
   const leftResidue=modBytes(left,p),rightResidue=modBytes(right,p);
   const context=(leftResidue*powMod(256n,child.width+right.length,p)+rightResidue)%p;
   assert.equal(childResidue,0n,`stored factor does not divide child ${child.id}`);
   assert.equal(parentResidue,context,`context congruence mismatch ${pair.parent_id}/${pair.child_id}`);
   const predicted=context===0n,actual=parentResidue===0n;
   assert.equal(actual,predicted,`factor reuse prediction mismatch ${pair.parent_id}/${pair.child_id}`);
   const primeBand=bits(p)<=16?'1-16':bits(p)<=64?'17-64':bits(p)<=128?'65-128':'129+';
   const group=`${w}|${pos}|${primeBand}`;
   const s=summaries.get(group)??{candidate_factors:0,hits:0,misses:0,quality:{}};
   s.candidate_factors++;s[predicted?'hits':'misses']++;s.quality[f.quality]=(s.quality[f.quality]??0)+1;summaries.set(group,s);
   candidateFactors++;comparisons++;if(predicted)predictedHits++;if(actual)observedHits++
  }
  sampledEdges++;totalSampledBytes+=parent.width+child.width;
  samples.push({parent_id:parent.id,child_id:child.id,child_width:child.width,child_position:pos,byte_sha256_parent:parent.byte_sha256,byte_sha256_child:child.byte_sha256,candidate_factor_count:distinct.size});
 }
}
const result={event:'E0165_CHILD_FACTOR_CONGRUENCE',experiment:'E0165',status:'verified',revision:process.env.GITHUB_SHA??null,run_id:Number(process.env.GITHUB_RUN_ID),corpus_sha256:expectedHash,indexed_objects:loaded,manifest_revision:manifest.batches.at(-1).id,excluded_parent_child_references:missingChildren.size,eligible_pair_population:Object.fromEntries(pop),sample_quota_per_width_position:quota,sampled_edges:sampledEdges,sampled_edges_sha256:sha(Buffer.from(samples.map(x=>`${x.parent_id}\n${x.child_id}`).join('\n'))),sampled_pairs:samples,total_sampled_bytes:totalSampledBytes,candidate_factor_comparisons:candidateFactors,exact_congruence_checks:comparisons,predicted_hits:predictedHits,observed_hits:observedHits,groups:Object.fromEntries(summaries),formula:'For parent bytes x||c||y and p dividing I(c): I(parent) mod p = (I(x)*256^(|c|+|y|)+I(y)) mod p. The stored child factor is reusable exactly when this residue is zero.',interpretation:'Congruence agreement is checked exactly on the deterministic width/position-stratified sample. Hit rates are empirical and sample-limited; no uniform-residue probability is assumed. Missing child rows and objects wider than 262144 bytes are outside this analysis.',input:{manifest_indexed_nodes:manifest.indexed_nodes,manifest_sha256:sha(manifestBytes)},index_json_bytes:manifest.index.shards.reduce((n,s)=>n+statSync(s.path).size,0),command:'nix develop --no-update-lock-file --command node --max-old-space-size=4096 experiments/xml/child-factor-congruence-e0165.mjs data/enwik9',node_version:process.version,nix_version:process.env.NIX_VERSION??null,wall_seconds:(performance.now()-started)/1000,peak_rss_kib:process.resourceUsage().maxRSS};
assert(sampledEdges>0&&candidateFactors>0,'empty parent-child factor sample');
assert.equal(candidateFactors,comparisons);assert.equal(predictedHits,observedHits);assert.equal(observedHits,Object.values(result.groups).reduce((n,g)=>n+g.hits,0));
console.log(JSON.stringify(result));
