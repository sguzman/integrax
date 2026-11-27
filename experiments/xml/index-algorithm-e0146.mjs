import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {performance} from 'node:perf_hooks';

const H=s=>BigInt('0x'+s),hx=n=>n.toString(16),bits=n=>n===0n?0:n.toString(2).length;
const runStart=performance.now();
const gcd=(a,b)=>{while(b)[a,b]=[b,a%b];return a};
function tree(xs){
 if(!xs.length)return null;
 if(xs.length===1)return {product:xs[0].p,leaf:xs[0]};
 const m=xs.length>>1,l=tree(xs.slice(0,m)),r=tree(xs.slice(m));
 return {product:l.product*r.product,l,r};
}
function treeFactors(n,t,out,stats){
 if(!t||n<=1n)return;
 stats.gcd_calls++;
 const d=gcd(n,t.product%n);
 if(d===1n)return;
 if(t.leaf){if(n%t.leaf.p===0n)out.push(t.leaf);return}
 treeFactors(d,t.l,out,stats);treeFactors(d,t.r,out,stats);
}
function extract(n,fs){const found=[];for(const f of fs){let e=0;while(n%f.p===0n){n/=f.p;e++}if(e)found.push({p:hx(f.p),e})}return {q:n,found}}
const manifest=JSON.parse(readFileSync('inventory/manifest.json','utf8'));
assert.equal(manifest.corpus_sha256,'159b85351e5f76e60cbe32e04c677847a9ecba3adc79addab6f4c6c7aa3744bc');
const factorMap=new Map();let indexBytes=0;
for(const s of manifest.index.shards){const data=JSON.parse(readFileSync(s.path,'utf8'));assert.equal(data.factors.length,s.count);indexBytes+=statSync(s.path).size;for(const f of data.factors){const p=H(f.p),old=factorMap.get(p);if(old)assert.equal(old.quality,f.quality);else factorMap.set(p,{p,quality:f.quality})}}
const factors=[...factorMap.values()];
factors.sort((a,b)=>a.p<b.p?-1:a.p>b.p?1:0);
assert.equal(factors.length,manifest.index.distinct_factors);
const overlays=new Map();
for(const ref of manifest.refinements??[]){const data=JSON.parse(readFileSync(ref.path,'utf8'));assert.equal(data.rows.length,ref.rows);for(const x of data.rows){const xs=overlays.get(x.id)??[];xs.push(x);overlays.set(x.id,xs)}}
const bands=new Map([['1-32',[]],['33-128',[]],['129-512',[]],['513-2048',[]],['2049+',[]]]);
let loaded=0,partial=0;const objectIds=new Set();
for(const batch of manifest.batches)for(const shard of batch.shards){
 const data=JSON.parse(readFileSync(shard.path,'utf8'));assert.equal(data.rows.length,shard.rows);
 for(const row of data.rows){loaded++;objectIds.add(row.id);let q=H(row.cofactor);
  for(const ref of overlays.get(row.id)??[]){assert.equal(H(ref.old_cofactor),q);assert.equal(ref.factors.reduce((a,f)=>a*H(f.p)**BigInt(f.e),H(ref.remaining)),q);q=H(ref.remaining)}
  if(q<=1n)continue;partial++;const w=row.width,key=w<=32?'1-32':w<=128?'33-128':w<=512?'129-512':w<=2048?'513-2048':'2049+';
  const digest=createHash('sha256').update(row.id).digest('hex');bands.get(key).push({id:row.id,width:w,q,digest});
 }
}
assert.equal(loaded,manifest.indexed_nodes);for(const id of overlays.keys())assert(objectIds.has(id),`orphan refinement ${id}`);
const sample=[];for(const [band,rows] of bands){rows.sort((a,b)=>a.digest.localeCompare(b.digest));sample.push(...rows.slice(0,400).map(x=>({...x,band})))}
assert(sample.length>0);
const builtAt=performance.now(),pt=tree(factors),buildMs=performance.now()-builtAt;
const treeStats={gcd_calls:0},flatStats={divisibility_tests:0},results=[];
let treeMs=0,flatMs=0;
for(const row of sample){
 const a=[],t0=performance.now();treeFactors(row.q,pt,a,treeStats);const x=extract(row.q,a);treeMs+=performance.now()-t0;
 const y=[],t1=performance.now();let q=row.q;
 for(const f of factors){if(f.p>q)continue;flatStats.divisibility_tests++;let e=0;while(q%f.p===0n){q/=f.p;e++}if(e)y.push({p:hx(f.p),e})}
 flatMs+=performance.now()-t1;
 assert.equal(x.q,q,`residual mismatch ${row.id}`);assert.deepEqual(x.found,y,`factor mismatch ${row.id}`);
 results.push({id:row.id,band:row.band,width:row.width,cofactor_bits:bits(row.q),factor_values:x.found.length,removed_bits:bits(row.q)-bits(x.q),remaining_bits:bits(x.q)});
}
console.log(JSON.stringify({event:'E0146_INDEX_ALGORITHM_COMPARISON',manifest_revision:process.env.GITHUB_SHA??null,corpus_sha256:manifest.corpus_sha256,nix_version:process.env.NIX_VERSION??null,node_version:process.version,objects:loaded,partial,sample_size:sample.length,sample_by_band:Object.fromEntries([...bands].map(([k,v])=>[k,{population:v.length,sampled:Math.min(400,v.length)}])),known_factors:factors.length,index_json_bytes:indexBytes,product_tree_build_ms:buildMs,product_tree_query_ms:treeMs,flat_scan_query_ms:flatMs,product_tree_gcd_calls:treeStats.gcd_calls,flat_divisibility_tests:flatStats.divisibility_tests,equivalent_factorizations:results.length,selected_sample_sha256:createHash('sha256').update(results.map(x=>x.id).join('\n')).digest('hex'),results,wall_seconds:(performance.now()-runStart)/1000,peak_rss_kib:process.resourceUsage().maxRSS,interpretation:'Exact factor and residual equality on a deterministic stratified sample. Query timings are one hosted-runner observation; not an archive-size or full-population result.'}));
