import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const sha=b=>createHash('sha256').update(b).digest('hex'), H=s=>BigInt('0x'+s), h=n=>n.toString(16), bits=n=>n===0n?0:n.toString(2).length;
function gcd(a,b){while(b)[a,b]=[b,a%b];return a}
function tree(xs){if(!xs.length)return null;if(xs.length===1)return {product:xs[0].n,leaf:xs[0],minWidth:xs[0].width??0};const m=Math.floor(xs.length/2),l=tree(xs.slice(0,m)),r=tree(xs.slice(m));return {product:l.product*r.product,l,r,minWidth:Math.min(l.minWidth,r.minWidth)}}
function hits(n,t,out){if(!t||n<=1n)return;const d=gcd(n,t.product%n);if(d===1n)return;if(t.leaf){if(n%t.leaf.n===0n)out.push(t.leaf);return}hits(d,t.l,out);hits(d,t.r,out)}
// Find a proper shared divisor against a distinct residual value. Exact duplicates
// are grouped, and a leaf equal to the queried value is never evidence.
function proper(n,t,exclude,stats,maxWidth=Infinity){
 if(!t||n<=1n||t.minWidth>=maxWidth)return null;
 stats.gcd_calls++;const d=gcd(n,t.product%n);if(d===1n)return null;
 if(t.leaf){if(t.leaf.n===exclude||d===n||t.minWidth>=maxWidth)return null;return {d,witness:t.leaf.id,witness_residual:h(t.leaf.n)}}
 return proper(n,t.l,exclude,stats,maxWidth)??proper(n,t.r,exclude,stats,maxWidth)
}
function modpow(a,e,n){let r=1n;while(e){if(e&1n)r=r*a%n;a=a*a%n;e>>=1n}return r}
function quality(n){
 if(n<2n)return 'composite';
 for(const p of [2n,3n,5n,7n,11n,13n,17n,19n,23n,29n,31n,37n])if(n%p===0n)return n===p?'prime64':'composite';
 let d=n-1n,s=0;while(!(d&1n)){d>>=1n;s++}
 const bs=n<(1n<<64n)?[2n,325n,9375n,28178n,450775n,9780504n,1795265022n]:[2n,3n,5n,7n,11n,13n,17n,19n,23n,29n,31n,37n];
 outer:for(const a0 of bs){const a=a0%n;if(!a)continue;let x=modpow(a,d,n);if(x===1n||x===n-1n)continue;for(let i=1;i<s;i++){x=x*x%n;if(x===n-1n)continue outer}return 'composite'}
 return n<(1n<<64n)?'prime64':'probable-prime'
}
function rho(n,b){for(let c=1n;c<=4n&&b.left;c++){let x=2n,y=2n;const f=z=>(z*z+c)%n;for(let i=0;i<1024&&b.left;i++){b.left--;x=f(x);y=f(f(y));const d=gcd(x>y?x-y:y-x,n);if(d===n)break;if(d>1n)return d}}return null}
function split(n,b,fs,us){if(n===1n)return;if(bits(n)>256){us.push(n);return}const q=quality(n);if(q!=='composite'){fs.push({n,quality:q,source:'residual-search'});return}const d=rho(n,b);if(d){split(d,b,fs,us);split(n/d,b,fs,us)}else us.push(n)}
const fixture=tree([{n:101n*103n,id:'a'},{n:101n*107n,id:'b'},{n:109n*113n,id:'c'}]);assert.equal(proper(101n*103n,fixture,101n*103n,{gcd_calls:0}).d,101n);
const manifest=JSON.parse(readFileSync('inventory/manifest.json','utf8')),full=readFileSync(process.argv[2]);
assert.equal(full.length,1000000000);assert.equal(sha(full),manifest.corpus_sha256);
const known=new Map();
for(const s of manifest.index.shards){const data=JSON.parse(readFileSync(s.path,'utf8'));assert.equal(data.factors.length,s.count);for(const f of data.factors){const p=H(f.p),old=known.get(p);if(old)assert.equal(old.quality,f.quality);else known.set(p,{n:p,id:f.occurrences[0].id,quality:f.quality})}}
assert.equal(known.size,manifest.index.distinct_factors);const pt=tree([...known.values()]);
const prior=[],seen=new Set(),objects=new Map(),overlays=new Map(),consumed=new Set();let loaded=0;
for(const ref of manifest.refinements??[]){
 const data=JSON.parse(readFileSync(ref.path,'utf8'));assert.equal(data.rows.length,ref.rows);
 for(const x of data.rows){const list=overlays.get(x.id)??[];list.push(x);overlays.set(x.id,list)}
}
for(const batch of manifest.batches)for(const s of batch.shards){const data=JSON.parse(readFileSync(s.path,'utf8'));assert.equal(data.rows.length,s.rows);for(const row of data.rows){
 assert(!seen.has(row.id));seen.add(row.id);loaded++;
 const bytes=full.subarray(row.offset,row.offset+row.width),n=BigInt('0x'+bytes.toString('hex'));assert.equal(sha(bytes),row.byte_sha256);
 let q=H(row.cofactor);assert.equal(row.factors.reduce((x,f)=>x*H(f.p)**BigInt(f.e),q),n);
 for(const ref of overlays.get(row.id)??[]){
  assert.equal(H(ref.old_cofactor),q);
  assert.equal(ref.factors.reduce((x,f)=>x*H(f.p)**BigInt(f.e),H(ref.remaining)),q);
  assert.equal(ref.unresolved_parts.reduce((x,p)=>x*H(p),1n),H(ref.remaining));
  for(const f of ref.factors){assert(known.has(H(f.p)));assert.equal(quality(H(f.p)),f.quality)}
  q=H(ref.remaining);consumed.add(row.id);
 }
 objects.set(row.id,{row,n,q});
 for(const f of row.factors)assert(known.has(H(f.p)));
 if(q>1n)prior.push(objects.get(row.id))
}}
assert.equal(loaded,manifest.indexed_nodes);assert.equal(consumed.size,overlays.size);
for(const o of objects.values()){
 if(!o.row.children.length)continue;
 let n=0n,at=o.row.offset;
 for(const id of o.row.children){const c=objects.get(id);assert(c);assert.equal(c.row.parent,o.row.id);assert.equal(c.row.offset,at);at+=c.row.width;n=(n<<BigInt(8*c.row.width))+c.n}
 assert.equal(at,o.row.offset+o.row.width);assert.equal(n,o.n);
}
// Freeze the complete inventory; measure exact incremental reductions without new factoring.
const recentIds=new Set();for(const batch of manifest.batches.slice(-1))for(const sh of batch.shards)for(const row of JSON.parse(readFileSync(sh.path,'utf8')).rows)recentIds.add(row.id);
const stats={loaded,partial:prior.length,known_factors:known.size,improved:0,completed:0,parent_improved:0,bits_removed:0,by_kind:{},by_width:{},by_cohort:{},unique_improved_values:0};
const unique=new Set(),uniqueByKind=new Map(),uniqueByWidth=new Map(),uniqueByCohort=new Map();
function measure(table,sets,key,o,q){const a=table[key]??={objects:0,improved:0,before_bits:0,after_bits:0,bits_removed:0,unique_improved_values:0};a.objects++;a.before_bits+=bits(o.q);a.after_bits+=bits(q);if(q<o.q){a.improved++;a.bits_removed+=bits(o.q)-bits(q);const set=sets.get(key)??new Set();set.add(o.n);sets.set(key,set);a.unique_improved_values=set.size}}
for(const o of prior){
 let q=o.q;const matched=[];hits(q,pt,matched);const fs=[];
 for(const t of matched){let e=0;while(q%t.n===0n){q/=t.n;e++}if(e)fs.push({p:h(t.n),e,quality:t.quality,source:'inventory-gcd',witness:t.id})}
 assert.equal(fs.reduce((n,f)=>n*H(f.p)**BigInt(f.e),q),o.q);
 const w=o.row.width,band=w<=8?'1-8':w<=32?'9-32':w<=128?'33-128':w<=512?'129-512':w<=2048?'513-2048':'2049+';
 measure(stats.by_kind,uniqueByKind,o.row.kind,o,q);measure(stats.by_width,uniqueByWidth,band,o,q);measure(stats.by_cohort,uniqueByCohort,recentIds.has(o.row.id)?'E0112':'historical',o,q);
 if(q<o.q){stats.improved++;stats.bits_removed+=bits(o.q)-bits(q);unique.add(o.n);if(o.row.children.length)stats.parent_improved++;if(q===1n)stats.completed++;
 console.log(JSON.stringify({event:'COFACTOR_REFINEMENT',id:o.row.id,kind:o.row.kind,parent:o.row.children.length>0,old_cofactor:h(o.q),after_inventory:h(q),factors:fs,remaining:h(q),unresolved_parts:q===1n?[]:[h(q)],shared_divisor:null,old_bits:bits(o.q),remaining_bits:bits(q),rho_steps:0}));}
}
stats.unique_improved_values=unique.size;
console.log(JSON.stringify({event:'COFACTOR_SUMMARY',...stats}));
