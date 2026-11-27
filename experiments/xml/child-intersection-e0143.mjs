import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {performance} from 'node:perf_hooks';

const H=s=>BigInt('0x'+s),hx=n=>n.toString(16),bits=n=>n===0n?0:n.toString(2).length;
const sha=b=>createHash('sha256').update(b).digest('hex');
const manifest=JSON.parse(readFileSync('inventory/manifest.json','utf8'));
const corpus=readFileSync(process.argv[2]);
assert.equal(corpus.length,1_000_000_000);
assert.equal(sha(corpus),manifest.corpus_sha256);
const started=performance.now(),overlays=new Map(),objects=new Map();
for(const ref of manifest.refinements??[]){
 const d=JSON.parse(readFileSync(ref.path,'utf8'));assert.equal(d.rows.length,ref.rows);
 for(const x of d.rows){const a=overlays.get(x.id)??[];a.push(x);overlays.set(x.id,a)}
}
for(const batch of manifest.batches)for(const shard of batch.shards){
 const d=JSON.parse(readFileSync(shard.path,'utf8'));assert.equal(d.rows.length,shard.rows);
 for(const row of d.rows){
  let q=H(row.cofactor);const fs=new Map();
  for(const f of row.factors)fs.set(H(f.p),(fs.get(H(f.p))??0)+f.e);
  const original=row.factors.reduce((n,f)=>n*H(f.p)**BigInt(f.e),q);
  for(const ref of overlays.get(row.id)??[]){
   assert.equal(H(ref.old_cofactor),q);
   assert.equal(ref.factors.reduce((n,f)=>n*H(f.p)**BigInt(f.e),H(ref.remaining)),q);
   for(const f of ref.factors)fs.set(H(f.p),(fs.get(H(f.p))??0)+f.e);
   q=H(ref.remaining);
  }
  const n=[...fs].reduce((v,[p,e])=>v*p**BigInt(e),q);
  assert.equal(n,original);
  objects.set(row.id,{row,n,q,fs});
 }
}
assert.equal(objects.size,manifest.indexed_nodes);
const primeList=[2n,3n,5n,7n,11n,13n,17n,19n,23n,29n,31n,37n,41n,43n,47n,53n,59n,61n,67n,71n,73n,79n,83n,89n,97n];
const baseSet=new Set(primeList),bands=new Map([['1-32',[]],['33-128',[]],['129-512',[]],['513-2048',[]],['2049+',[]]]);
let parentCount=0;
for(const o of objects.values()){
 const ch=o.row.children??[];if(!ch.length)continue;parentCount++;
 const w=o.row.width,k=w<=32?'1-32':w<=128?'33-128':w<=512?'129-512':w<=2048?'513-2048':'2049+';
 bands.get(k).push(o);
}
const sample=[];for(const [band,rows] of bands){rows.sort((a,b)=>sha(Buffer.from(a.row.id)).localeCompare(sha(Buffer.from(b.row.id))));sample.push(...rows.slice(0,500).map(o=>({o,band})))}
assert(sample.length>0);
function extract(q,candidates,out,stats){for(const p of candidates){if(p>q)continue;stats.tests++;let e=0;while(q%p===0n){q/=p;e++;stats.successful_divisions++}if(e)out.set(p,(out.get(p)??0)+e)}return q}
function product(fs,q){return [...fs].reduce((n,[p,e])=>n*p**BigInt(e),q)}
const agg={sample_size:sample.length,baseline_parent_mod_tests:0,certified_parent_mod_tests:0,avoided_parent_mod_tests:0,theorem_verification_mod_tests:0,guaranteed_prime_values:0,guaranteed_exponent_sum:0,baseline_hits:0,certified_hits:0,baseline_removed_bits:0,certified_removed_bits:0,baseline_ms:0,certified_ms:0,verified_byte_objects:0,by_band:{}};
const perBand=agg.by_band;for(const [band] of bands)perBand[band]={sampled:0,parents_with_common:0,common_prime_values:0,baseline_mod_tests:0,certified_mod_tests:0,avoided_mod_tests:0,baseline_removed_bits:0,certified_removed_bits:0};
const sampleIds=new Set();
for(const {o,band} of sample){
 const {row,n}=o,children=(row.children??[]).map(id=>objects.get(id));
 assert(children.every(Boolean));let reconstructed=0n,at=row.offset;
 for(const c of children){assert.equal(c.row.offset,at);at+=c.row.width;reconstructed=(reconstructed<<BigInt(8*c.row.width))+c.n}
 assert.equal(at,row.offset+row.width);assert.equal(reconstructed,n);
 for(const x of [o,...children])if(!sampleIds.has(x.row.id)){
  const bytes=corpus.subarray(x.row.offset,x.row.offset+x.row.width);
  assert.equal(sha(bytes),x.row.byte_sha256);assert.equal(H(bytes.toString('hex')),x.n);sampleIds.add(x.row.id)
 }
 const childCounts=new Map(),childMins=new Map();
 for(const c of children)for(const [p,e] of c.fs){
  childCounts.set(p,(childCounts.get(p)??0)+1);
  childMins.set(p,Math.min(childMins.get(p)??Infinity,e));
 }
 const tc=performance.now(),common=[...childMins].filter(([p])=>childCounts.get(p)===children.length&&!baseSet.has(p));
 const candidates=[...childCounts].filter(([p])=>!baseSet.has(p)).map(([p,count])=>({p,count})).sort((a,b)=>b.count-a.count||(a.p<b.p?-1:a.p>b.p?1:0));
 const bstats={tests:0,successful_divisions:0},cstats={tests:0,successful_divisions:0};
 const bfound=new Map(),cFound=new Map();let bq=extract(n,primeList,bfound,bstats),cq=extract(n,primeList,cFound,cstats);
 const chosen=candidates.slice(0,64).map(x=>x.p);
 const t0=performance.now();bq=extract(bq,chosen,bfound,bstats);const bms=performance.now()-t0;
 const commonSet=new Set(),theoremPowers=[];let commonAdds=0;
 for(const [p,minE] of common){
  const baseE=cfoundExponent(cFound,p),e=Math.max(0,minE-baseE);
  if(e){const pe=p**BigInt(e);cq/=pe;cFound.set(p,(cFound.get(p)??0)+e);commonSet.add(p);commonAdds+=e;theoremPowers.push([p,pe])}
 }
 const remaining=candidates.filter(x=>!commonSet.has(x.p)).slice(0,64).map(x=>x.p);
 cq=extract(cq,remaining,cFound,cstats);const cms=performance.now()-tc;
 for(const [p,pe] of theoremPowers){assert.equal(n%pe,0n);agg.theorem_verification_mod_tests++}
 assert.equal(product(bfound,bq),n);assert.equal(product(cFound,cq),n);
 assert.equal([...bfound.keys()].every(p=>p>1n),true);assert.equal([...cFound.keys()].every(p=>p>1n),true);
 const bp=perBand[band];bp.sampled++;if(common.length)bp.parents_with_common++;bp.common_prime_values+=common.length;
 bp.baseline_mod_tests+=bstats.tests;bp.certified_mod_tests+=cstats.tests;bp.avoided_mod_tests+=bstats.tests-cstats.tests;
 bp.baseline_removed_bits+=bits(n)-bits(bq);bp.certified_removed_bits+=bits(n)-bits(cq);
 agg.baseline_parent_mod_tests+=bstats.tests;agg.certified_parent_mod_tests+=cstats.tests;agg.avoided_parent_mod_tests+=bstats.tests-cstats.tests;
 agg.guaranteed_prime_values+=common.length;agg.guaranteed_exponent_sum+=commonAdds;
 agg.baseline_hits+=bfound.size;agg.certified_hits+=cFound.size;
 agg.baseline_removed_bits+=bits(n)-bits(bq);agg.certified_removed_bits+=bits(n)-bits(cq);
 agg.baseline_ms+=bms;agg.certified_ms+=cms;
}
agg.verified_byte_objects=sampleIds.size;
function cfoundExponent(m,p){return m.get(p)??0}
console.log(JSON.stringify({event:'E0143_CHILD_INTERSECTION',experiment:'E0143',run_id:process.env.GITHUB_RUN_ID??null,manifest_revision:process.env.GITHUB_SHA??null,corpus_sha256:manifest.corpus_sha256,nix_version:process.env.NIX_VERSION??null,node_version:process.version,objects:objects.size,parents:parentCount,known_factors:manifest.index.distinct_factors,index_json_bytes:manifest.index.shards.reduce((n,s)=>n+statSync(s.path).size,0),sampling:'first 500 parent objects per byte-width band after SHA256(id) sorting',baseline:'base primes then top 64 immediate-child factors ordered by child occurrence count; exact divisibility checks',certified:'base primes, theorem-guaranteed minimum prime valuations shared by every immediate child, then top 64 remaining child candidates',measurement_correction:'Retimed after removing the parent divisibility assertion from the certified algorithm interval; theorem divisibility and exact-product checks run outside both timed intervals.',...agg,wall_seconds:(performance.now()-started)/1000,peak_rss_kib:process.resourceUsage().maxRSS,verification:'Verified corpus SHA-256, sampled object byte hashes, exact child-span concatenation, persisted factor and overlay products, theorem divisibility checks outside timing, and exact baseline/certified products against each parent integer. The theorem path uses common prime valuations as certified exponents; it still performs quotient divisions to construct residuals. Timings exclude inventory loading, byte-hash checks and proof assertions.'}));
