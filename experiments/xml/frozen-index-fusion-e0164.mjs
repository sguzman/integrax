import assert from 'node:assert/strict';
import {readFileSync, statSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {performance} from 'node:perf_hooks';

const started=performance.now();
const sha=b=>createHash('sha256').update(b).digest('hex');
const H=s=>BigInt(`0x${s||'0'}`),hex=n=>n.toString(16),bits=n=>n===0n?0:n.toString(2).length;
const gcd=(a,b)=>{while(b)[a,b]=[b,a%b];return a};
const stages=[['E0104',3286],['E0105',4145],['E0106',4146],['E0107',5144],['E0108',6504],['E0110',6507],['E0112',8376],['E0114',8378],['E0116',10788],['E0119',13631],['E0121',13633],['E0123',16081],['E0126',18778],['E0128',22124],['E0131',24808],['E0134',28721],['E0137',33701],['E0140',38074],['E0144',43328],['E0149',47547]];
const manifest=JSON.parse(readFileSync('inventory/manifest.json','utf8'));
assert.equal(manifest.corpus_sha256,'159b85351e5f76e60cbe32e04c677847a9ecba3adc79addab6f4c6c7aa3744bc');
const indexShards=manifest.index.shards;
const firstStage=new Map(),cumulative=new Set(),stageTrees=[];
const basePrimes=[];
for(let p=2;p<=97;p++)if(!basePrimes.some(q=>q*q<=p&&p%q===0))basePrimes.push(BigInt(p));
const baseSet=new Set(basePrimes);
function productTree(xs){
 if(!xs.length)return null;
 if(xs.length===1)return {product:xs[0],p:xs[0]};
 const m=xs.length>>1,l=productTree(xs.slice(0,m)),r=productTree(xs.slice(m));
 return {product:l.product*r.product,l,r};
}
function extract(n,ps){let q=n;const found=[];for(const p of ps){if(p>q)continue;let e=0;while(q%p===0n){q/=p;e++}if(e)found.push({p,e})}return {q,found}}
function treeHits(n,t,out,stats){
 if(!t||n<=1n)return;
 stats.gcd_calls++;
 const d=gcd(n,t.product%n);
 if(d===1n)return;
 if(t.p!==undefined){if(n%t.p===0n)out.push(t.p);return}
 treeHits(d,t.l,out,stats);treeHits(d,t.r,out,stats);
}
function collectTreeStats(t){let nodes=0,productBits=0;if(!t)return {nodes,productBits};const stack=[t];while(stack.length){const x=stack.pop();nodes++;productBits+=bits(x.product);if(x.l){stack.push(x.l,x.r)}}return {nodes,productBits}}

for(const [id,count] of stages){
 const shardList=indexShards.filter(s=>s.path.startsWith(`inventory/index/${id}/`));
 assert(shardList.length,`missing frozen factor shard for ${id}`);
 const added=[];
 for(const shard of shardList){
  const data=JSON.parse(readFileSync(shard.path,'utf8'));
  assert.equal(data.factors.length,shard.count);
  for(const f of data.factors){const p=H(f.p);if(!cumulative.has(p)){cumulative.add(p);if(!baseSet.has(p))firstStage.set(p,id)}added.push(p)}
 }
 assert.equal(cumulative.size,count,`frozen inventory size mismatch at ${id}`);
 const xs=[...cumulative].filter(p=>!baseSet.has(p)).sort((a,b)=>a<b?-1:a>b?1:0);
 const t0=performance.now(),tree=productTree(xs),buildMs=performance.now()-t0;
 stageTrees.push({id,count,tree,buildMs,factors:xs});
}
assert.equal(cumulative.size,stages.at(-1)[1]);
assert(cumulative.size<=manifest.index.distinct_factors);
assert.equal(stages.at(-1)[0],'E0149');assert(manifest.batches.some(b=>b.id==='E0149'));
const corpus=readFileSync(process.argv[2]);
assert.equal(corpus.length,1_000_000_000);
assert.equal(sha(corpus),manifest.corpus_sha256);

const bandOf=w=>w<=32?'1-32':w<=128?'33-128':w<=512?'129-512':w<=2048?'513-2048':'2049+';
const bands=['1-32','33-128','129-512','513-2048','2049+'];
const samplePerBand=200,heaps=new Map(bands.map(k=>[k,[]])),population=new Map(bands.map(k=>[k,0]));
function heapSwap(a,i,j){[a[i],a[j]]=[a[j],a[i]]}
function heapPush(a,x){a.push(x);let i=a.length-1;while(i){const p=(i-1)>>1;if(a[p].digest>=a[i].digest)break;heapSwap(a,p,i);i=p}}
function heapDown(a,i){for(;;){let j=i,l=2*i+1,r=l+1;if(l<a.length&&a[l].digest>a[j].digest)j=l;if(r<a.length&&a[r].digest>a[j].digest)j=r;if(j===i)return;heapSwap(a,i,j);i=j}}
let loaded=0;const allIds=new Set();
for(const batch of manifest.batches)for(const shard of batch.shards){
 const data=JSON.parse(readFileSync(shard.path,'utf8'));assert.equal(data.rows.length,shard.rows);
 for(const row of data.rows){
  loaded++;assert(!allIds.has(row.id),`duplicate object id ${row.id}`);allIds.add(row.id);
  const key=bandOf(row.width),heap=heaps.get(key),digest=sha(Buffer.from(row.id));population.set(key,population.get(key)+1);
  const item={id:row.id,digest,width:row.width,offset:row.offset,byte_sha256:row.byte_sha256,cofactor:row.cofactor,factors:row.factors};
  if(heap.length<samplePerBand)heapPush(heap,item);
  else if(digest<heap[0].digest){heap[0]=item;heapDown(heap,0)}
 }
}
assert.equal(loaded,manifest.indexed_nodes);
const sample=bands.flatMap(b=>heaps.get(b).sort((a,c)=>a.digest.localeCompare(c.digest)).map(x=>({...x,band:b})));
assert(sample.length>0);
const sampleHash=sha(Buffer.from(sample.map(x=>x.id).join('\n')));
function fromRow(row){
 let n=H(row.cofactor);
 for(const f of row.factors)n*=H(f.p)**BigInt(f.e);
 const bytes=corpus.subarray(row.offset,row.offset+row.width);
 assert.equal(bytes.length,row.width);assert.equal(sha(bytes),row.byte_sha256,`source span hash ${row.id}`);
 assert.equal(bytes.length?BigInt(`0x${bytes.toString('hex')}`):0n,n,`inventory value mismatch ${row.id}`);
 return n;
}
function stageResults(n,trees,stats){
 const results=[];
 for(const t of trees){
  const qBase=extract(n,basePrimes).q,found=[];
  treeHits(qBase,t.tree,found,stats);
  const x=extract(qBase,found);
  results.push({q:x.q,factors:x.found.map(f=>[hex(f.p),f.e])});
 }
 return results;
}
function fusedResults(n,trees,stats){
 const qBase=extract(n,basePrimes).q,all=[];
 treeHits(qBase,trees.at(-1).tree,all,stats);
 const results=[];
 for(const t of trees){
  const eligible=all.filter(p=>firstStage.get(p)<=t.id);
  const x=extract(qBase,eligible);
  results.push({q:x.q,factors:x.found.map(f=>[hex(f.p),f.e])});
 }
 return results;
}
let naiveMs=0,fusedMs=0,naiveStats={gcd_calls:0},fusedStats={gcd_calls:0},matchedFactors=0,removedBits=0,stageComparisons=0;
for(const row of sample){
 const n=fromRow(row),t0=performance.now(),a=stageResults(n,stageTrees,naiveStats);naiveMs+=performance.now()-t0;
 const t1=performance.now(),b=fusedResults(n,stageTrees,fusedStats);fusedMs+=performance.now()-t1;
 assert.equal(a.length,stages.length);assert.equal(b.length,stages.length);
 for(let i=0;i<a.length;i++){assert.equal(a[i].q,b[i].q,`residual mismatch ${row.id} at ${stages[i][0]}`);assert.deepEqual(a[i].factors,b[i].factors,`factor mismatch ${row.id} at ${stages[i][0]}`);matchedFactors+=b[i].factors.length;removedBits+=bits(n)-bits(b[i].q);stageComparisons++}
}
const naiveBuildMs=stageTrees.reduce((n,t)=>n+t.buildMs,0),naiveTreeStats=stageTrees.reduce((n,t)=>{const x=collectTreeStats(t.tree);return {nodes:n.nodes+x.nodes,product_bits:n.product_bits+x.productBits}},{nodes:0,product_bits:0});
const fusedTreeStats=collectTreeStats(stageTrees.at(-1).tree),indexBytes=indexShards.reduce((n,s)=>n+statSync(s.path).size,0);
console.log(JSON.stringify({event:'E0164_FROZEN_INDEX_FUSION',experiment:'E0164',status:'verified',manifest_revision:process.env.GITHUB_SHA??null,corpus_sha256:manifest.corpus_sha256,indexed_objects:loaded,frozen_distinct_factors:cumulative.size,manifest_distinct_factors:manifest.index.distinct_factors,total_index_json_bytes:indexBytes,stages:stages.map(([id,count])=>({id,count})),sample_size:sample.length,sample_per_band:samplePerBand,sample_by_band:Object.fromEntries(bands.map(b=>[b,{population:population.get(b),sampled:heaps.get(b).length}])),selected_sample_sha256:sampleHash,stage_comparisons:stageComparisons,equivalent_factorizations:stageComparisons,matched_stage_factor_occurrences:matchedFactors,overlapping_bits_removed:removedBits,naive_tree_build_ms:naiveBuildMs,fused_tree_build_ms:stageTrees.at(-1).buildMs,naive_query_ms:naiveMs,fused_query_ms:fusedMs,naive_gcd_calls:naiveStats.gcd_calls,fused_gcd_calls:fusedStats.gcd_calls,query_speedup:naiveMs/fusedMs,naive_product_tree_nodes:naiveTreeStats.nodes,fused_product_tree_nodes:fusedTreeStats.nodes,naive_product_tree_product_bits:naiveTreeStats.product_bits,fused_product_tree_product_bits:fusedTreeStats.productBits,temporary_index_node_reduction:1-fusedTreeStats.nodes/naiveTreeStats.nodes,wall_seconds:(performance.now()-started)/1000,peak_rss_kib:process.resourceUsage().maxRSS,nix_version:process.env.NIX_VERSION??null,node_version:process.version,command:'nix develop --no-update-lock-file --command node --max-old-space-size=4096 experiments/xml/frozen-index-fusion-e0164.mjs data/enwik9',verification:'For every sampled object and all 20 cumulative frozen inventories, the single largest-index query followed by exact first-stage projection returned the same factor exponents and residual cofactor as 20 separate product-tree queries. All sampled object values were reconstructed from persisted factor rows and checked against the original corpus byte spans and SHA-256.',interpretation:'The fused query is exact because each frozen inventory is a nested set. Runtime and storage results apply only to the deterministic stratified sample and this hosted runner; the per-stage factor projection remains charged as computation, and tree product-bit counts exclude runtime object overhead.'}));
