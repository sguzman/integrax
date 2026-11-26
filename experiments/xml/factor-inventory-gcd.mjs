import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {deflateRawSync,inflateRawSync,gzipSync} from 'node:zlib';
const MAX=8*1024*1024,DEPTH=32;
const sha=b=>createHash('sha256').update(b).digest('hex');
const B=(...parts)=>Buffer.concat(parts);
function u(n){assert(Number.isSafeInteger(n)&&n>=0&&n<=MAX);const a=[];do{let v=n%128;n=Math.floor(n/128);a.push(v+(n?128:0))}while(n);return Buffer.from(a)}
const t=n=>Buffer.from([n]);
const integer=b=>b.length?BigInt('0x'+b.toString('hex')):0n;
function mag(n){if(n===0n)return Buffer.alloc(0);const h=n.toString(16);return Buffer.from(h.length%2?'0'+h:h,'hex')}
function fixed(n,w){const b=mag(n);assert(b.length<=w);return B(Buffer.alloc(w-b.length),b)}
const primes=[2n,3n,5n,7n,11n,13n,17n,19n,23n,29n,31n,37n,41n,43n,47n,53n,59n,61n,67n,71n,73n,79n,83n,89n,97n];
// Byte-preserving heuristic text boundaries. The text is still the original escaped XML bytes.
function textTree(b,start,end){
 function part(s,e,kind,children=null){return {start:s,end:e,kind,children}}
 function split(s,e,re,kind,child){
  const x=b.subarray(s,e).toString('latin1'),out=[];let at=0;
  for(const m of x.matchAll(re)){const j=m.index+m[0].length;if(j>at){out.push(child(s+at,s+j));at=j}}
  if(at<x.length)out.push(child(s+at,e));return part(s,e,kind,out)
 }
 function words(s,e){
  const x=b.subarray(s,e).toString('latin1'),tokens=[];
  for(const m of x.matchAll(/[A-Za-z]+|[0-9]+|[^A-Za-z0-9]+/g)){
   const a=s+m.index,z=a+m[0].length;
   if(z-a<=32)tokens.push(part(a,z,'word'));
   else{const chunks=[];for(let p=a;p<z;p+=32)chunks.push(part(p,Math.min(z,p+32),'fragment'));tokens.push(part(a,z,'word',chunks))}
  }
  const phrases=[];
  for(let i=0;i<tokens.length;i+=6){const c=tokens.slice(i,i+6);phrases.push(part(c[0].start,c.at(-1).end,'phrase',c))}
  return part(s,e,'sentence',phrases)
 }
 const para=(s,e)=>split(s,e,/[.!?]+(?:[ \t\r\n]+|$)/g,'paragraph',words);
 return split(start,end,/\n+/g,'article',para)
}
function tree(b,deep=true){
 const root={start:0,end:b.length,children:[]},stack=[root];let p=0;
 function leaf(s,e){if(e>s)stack.at(-1).children.push({start:s,end:e,children:null})}
 while(p<b.length){
  let lt=b.indexOf(60,p);
  if(lt!==p){const e=lt<0?b.length:lt;if(deep&&stack.at(-1).name==='text')stack.at(-1).children.push(textTree(b,p,e));else leaf(p,e);p=e;continue}
  let e=-1,opaque=false;
  for(const [pre,suf] of [['<!--','-->'],['<![CDATA[',']]>'],['<?','?>']]){
   if(b.subarray(p,p+pre.length).toString('latin1')===pre){opaque=true;const j=b.indexOf(suf,p+pre.length);e=j<0?b.length:j+suf.length;break}
  }
  if(opaque){leaf(p,e);p=e;continue}
  assert.notEqual(b[p+1],33,'unsupported declaration');
  let q=p+1,quote=0;
  for(;q<b.length;q++){const c=b[q];if(quote){if(c===quote)quote=0}else if(c===34||c===39)quote=c;else if(c===62)break;else assert.notEqual(c,60)}
  if(q===b.length){leaf(p,q);p=q;continue}
  e=q+1;const tag=b.subarray(p,e).toString('latin1'),m=/^<(\/?)([A-Za-z0-9_:.-]+)(?=[\s/>])/.exec(tag);assert(m);
  if(m[1]){assert(stack.length>1&&stack.at(-1).name===m[2]);leaf(p,e);stack.pop().end=e}
  else if(/\/\s*>$/.test(tag))leaf(p,e);
  else{const n={name:m[2],start:p,end:0,children:[]};stack.at(-1).children.push(n);stack.push(n);assert(stack.length<=DEPTH);leaf(p,e)}
  p=e;
 }
 // Close only the representation, not the actual XML: no invented closing bytes.
 while(stack.length>1)stack.pop().end=b.length;
 function verify(n){if(n.children===null)return;let pos=n.start;for(const c of n.children){assert.equal(c.start,pos);verify(c);pos=c.end}assert.equal(pos,n.end)}
 verify(root);return root;
}
function walk(n,f){f(n);if(n.children)for(const c of n.children)walk(c,f)}

const BIT=n=>n===0n?0:n.toString(2).length;
const hex=n=>n.toString(16);
const fromHex=s=>BigInt('0x'+s);
const gcd=(a,b)=>{while(b)[a,b]=[b,a%b];return a};
function pow(a,e,n){let r=1n;while(e){if(e&1n)r=r*a%n;a=a*a%n;e>>=1n}return r}
const primes2=[];for(let p=2;p<=10000;p++)if(!primes2.some(q=>q*q<=p&&p%q===0))primes2.push(p);
const basePrimes=primes2.filter(p=>p<=97).map(BigInt),baseSet=new Set(basePrimes);
const cold=primes2.filter(p=>p>97).map(BigInt);
const cache=new Map();
function quality(n){
 if(cache.has(n))return cache.get(n);
 let result='composite';
 if(n>=2n){
  const small=basePrimes.find(p=>n%p===0n);
  if(small!==undefined){if(small===n)result='prime64'}
  else{
   let d=n-1n,s=0;while(!(d&1n)){d>>=1n;s++}
   let ok=true;
   const bases=n<(1n<<64n)?[2n,325n,9375n,28178n,450775n,9780504n,1795265022n]:[2n,3n,5n,7n,11n,13n,17n,19n,23n,29n,31n,37n];
   outer:for(const base of bases){let a=base%n;if(!a)continue;let x=pow(a,d,n);if(x===1n||x===n-1n)continue;
    for(let i=1;i<s;i++){x=x*x%n;if(x===n-1n)continue outer}ok=false;break}
   if(ok)result=n<(1n<<64n)?'prime64':'probable-prime';
  }
 }
 cache.set(n,result);return result
}
function rho(n,budget){
 for(let c=1n;c<=4n&&budget.left>0;c++){
  let x=2n,y=2n;const f=z=>(z*z+c)%n;
  for(let i=0;i<1024&&budget.left>0;i++){budget.left--;x=f(x);y=f(f(y));const d=gcd(x>y?x-y:y-x,n);if(d===n)break;if(d>1n)return d}
 }
 return null
}
function split(n,budget,out){
 if(n===1n)return;
 if(BIT(n)>256){out.unresolved.push(n);return}
 const q=quality(n);
 if(q!=='composite'){out.factors.push({p:n,e:1,source:'new-search',quality:q});return}
 const d=rho(n,budget);
 if(d){split(d,budget,out);split(n/d,budget,out)}
 else out.unresolved.push(n)
}
function extract(n,candidates,source,found,attempted){
 for(const p of candidates){
  if(p>n||n===1n)continue;
  attempted.push(hex(p));let e=0;
  while(n%p===0n){n/=p;e++}
  if(e)found.push({p,e,source,quality:quality(p)});
 }
 return n
}
const inv=new Map();
function learn(p,id,origin){
 const q=quality(p);assert(q!=='composite');
 let row=inv.get(p);
 if(!row){row={p,quality:q,count:0,first:id,origin};inv.set(p,row)}
 row.count++;
}
function seed(){
 // Existing evidence is a research inventory, not decoder side information.
 let cases=0;
 const e95=JSON.parse(readFileSync('experiments/records/E0095.json','utf8'));
 for(const row of e95.factors){
  if(!row.factors)continue;const fs=row.factors.map(BigInt);assert.equal(fs.reduce((x,p)=>x*p,1n),BigInt(row.n));
  for(const p of new Set(fs))learn(p,'E0095:'+row.offset,'E0095');cases++;
 }
 const e96=JSON.parse(readFileSync('experiments/records/E0096.json','utf8'));
 for(const row of e96.rows){
  assert.equal(row.terms.reduce((x,t)=>x*BigInt(t.n),1n),BigInt(row.n));
  for(const t of row.terms)if(t.kind!=='unfactored')learn(BigInt(t.n),'E0096:'+row.offset,'E0096');cases++;
 }
 const e99=JSON.parse(readFileSync('experiments/records/E0099.json','utf8'));
 for(const shard of e99.factor_shards){
  const data=JSON.parse(readFileSync('experiments/records/'+shard.path,'utf8'));
  assert.equal(data.rows.length,shard.rows);
  for(const row of data.rows){
   assert.equal(row.terms.reduce((x,t)=>x*BigInt(t.n)**BigInt(t.e),1n),BigInt(row.n));
   for(const t of row.terms)if(t.kind!=='unfactored')learn(BigInt(t.n),'E0099:'+row.region+':'+row.offset,'E0099');cases++;
  }
 }
 console.log(JSON.stringify({event:'FACTOR_SEED',cases,distinct_factors:inv.size}));
}
function byRank(a,b){return b.count-a.count||(a.p<b.p?-1:a.p>b.p?1:0)}
// A product tree over the persistent inventory. Every known factor is represented.
let snapshot=null,snapshotId='',snapshotSet=new Set(),delta=new Set();
function productTree(xs){
 if(!xs.length)return null;
 if(xs.length===1)return {product:xs[0],p:xs[0]};
 const mid=Math.floor(xs.length/2),left=productTree(xs.slice(0,mid)),right=productTree(xs.slice(mid));
 return {product:left.product*right.product,left,right};
}
function rebuildSnapshot(){
 const xs=[...inv.keys()].filter(p=>!baseSet.has(p)).sort((a,b)=>a<b?-1:a>b?1:0);
 snapshot=productTree(xs);snapshotSet=new Set(xs);delta=new Set();
 snapshotId=sha(Buffer.from(xs.map(hex).join(',')));
 console.log(JSON.stringify({event:'FACTOR_SNAPSHOT',id:snapshotId,values:xs.map(hex)}));
}
function hits(n,node,out){
 if(!node||n<=1n)return;
 const d=gcd(n,node.product%n);
 if(d===1n)return;
 if(node.p!==undefined){if(n%node.p===0n)out.push(node.p);return}
 hits(d,node.left,out);hits(d,node.right,out);
}
function analyze(n,childRows,id){
 const attempted={base:[],child:[],global:[],cold:[]};
 if(n<=1n)return {factors:[],q:n,attempted,base_bits:BIT(n),child_bits:BIT(n),reuse_bits:BIT(n),full_bits:BIT(n),snapshot:snapshotId,delta_count:delta.size,cold_bits:BIT(n),rho_steps:0,child_candidates:0,global_candidates:0};
 const found=[];let q=extract(n,basePrimes,'base',found,attempted.base),baseBits=BIT(q);
 // Prime factors from immediate children, prioritized by how many children contain them.
 // No assumption of inheritance without divisibility; test against the exact parent integer.
 const cp=new Map();
 for(const row of childRows)for(const f of row.factors){
  const p=f.p;if(baseSet.has(p))continue;
  cp.set(p,(cp.get(p)??0)+1);
 }
 const candidates=[...cp].map(([p,count])=>({p,count})).sort(byRank);
 const children=candidates.slice(0,64).map(x=>x.p),excluded=new Set([...basePrimes,...children]);
 q=extract(q,children,'child',found,attempted.child);
 const childBits=BIT(q);
 const globals=[...inv.values()].filter(x=>!excluded.has(x.p)&&x.p<=q).sort(byRank).slice(0,32).map(x=>x.p);
 q=extract(q,globals,'global',found,attempted.global);
 const reuseBits=BIT(q);
 // Matched cold control: same base extraction and same number of additional attempted
 // divisors from a fixed prime ordering, no child or corpus inventory.
 const coldFound=[];let control=extract(n,basePrimes,'base',coldFound,[]);
 const coldList=cold.filter(p=>p<=control).slice(0,attempted.child.length+attempted.global.length);
 control=extract(control,coldList,'cold',coldFound,attempted.cold);
 const deltaCount=delta.size,matched=[];
 hits(q,snapshot,matched);
 q=extract(q,matched,'inventory-gcd',found,[]);
 const deltaHits=[...delta].filter(p=>p<=q&&q%p===0n);
 q=extract(q,deltaHits,'inventory-delta',found,[]);
 const fullBits=BIT(q);
 const budget={left:4096},rest={factors:[],unresolved:[]};
 split(q,budget,rest);found.push(...rest.factors);q=rest.unresolved.reduce((x,p)=>x*p,1n);
 const merged=new Map();
 for(const f of found){
  const x=merged.get(f.p);if(x){x.e+=f.e;if(!x.sources.includes(f.source))x.sources.push(f.source)}
  else merged.set(f.p,{p:f.p,e:f.e,quality:f.quality,sources:[f.source]})
 }
 const factors=[...merged.values()].sort((a,b)=>a.p<b.p?-1:a.p>b.p?1:0);
 assert.equal(factors.reduce((x,f)=>x*f.p**BigInt(f.e),q),n);
 for(const f of factors){learn(f.p,id,'E0104');if(!baseSet.has(f.p)&&!snapshotSet.has(f.p))delta.add(f.p)}
 return {factors,q,attempted,base_bits:baseBits,child_bits:childBits,reuse_bits:reuseBits,full_bits:fullBits,snapshot:snapshotId,delta_count:deltaCount,cold_bits:BIT(control),rho_steps:4096-budget.left,child_candidates:candidates.length,global_candidates:globals.length}
}
function inventoryPage(b,offset){
 const root=tree(b),nodes=[];let next=0;
 function assign(n,parent,depth){
  const id='enwik9:'+offset+':'+next++;
  const row={id,parent,depth,node:n,children:[]};nodes.push(row);
  if(n.children)for(const c of n.children)row.children.push(assign(c,id,depth+1));
  return row
 }
 const top=assign(root,null,0),results=new Map(),stats={nodes:0,leaves:0,parents:0,full_inventory_hits:0,parent_full_inventory_hits:0,full_bits_removed:0,parent_full_bits_removed:0,complete:0,partial:0,trivial:0,child_hits:0,global_hits:0,parent_child_hits:0,parent_global_hits:0,parent_better_than_cold:0,parent_worse_than_cold:0,parent_equal_cold:0,child_bits_removed:0,global_bits_removed:0},levels={};
 function visit(row){
  const children=row.children.map(visit),n=row.node,w=n.end-n.start,bytes=b.subarray(n.start,n.end),value=integer(bytes);
  if(children.length){let assembled=0n,len=0;for(const child of children){assembled=(assembled<<BigInt(8*child.width))+child.value;len+=child.width}assert.equal(len,w);assert.equal(assembled,value)}
  const start=performance.now(),f=analyze(value,children,row.id),kind=n.kind??n.name??(row.parent===null?'page-root':'lexical'),isParent=children.length>0;
  const childHit=f.factors.some(x=>x.sources.includes('child')),globalHit=f.factors.some(x=>x.sources.includes('global'));
  const status=value<=1n?'trivial':f.q===1n?'complete':'partial';
  const fullHit=f.factors.some(x=>x.sources.some(s=>s==='inventory-gcd'||s==='inventory-delta'));
  if(fullHit){stats.full_inventory_hits++;if(isParent)stats.parent_full_inventory_hits++}
  stats.full_bits_removed+=f.reuse_bits-f.full_bits;if(isParent)stats.parent_full_bits_removed+=f.reuse_bits-f.full_bits;
  stats.nodes++;stats[isParent?'parents':'leaves']++;stats[status]++;
  if(childHit)stats.child_hits++;if(globalHit)stats.global_hits++;
  if(isParent){if(childHit)stats.parent_child_hits++;if(globalHit)stats.parent_global_hits++;stats[f.reuse_bits<f.cold_bits?'parent_better_than_cold':f.reuse_bits>f.cold_bits?'parent_worse_than_cold':'parent_equal_cold']++}
  stats.child_bits_removed+=f.base_bits-f.child_bits;stats.global_bits_removed+=f.child_bits-f.reuse_bits;
  const level=levels[kind]??={nodes:0,complete:0,partial:0,trivial:0,child_hits:0,global_hits:0,bits:0,base_bits:0,reuse_bits:0,remaining_bits:0,cold_bits:0,full_bits:0,full_hits:0};
  level.nodes++;level[status]++;level.child_hits+=Number(childHit);level.global_hits+=Number(globalHit);level.bits+=BIT(value);level.base_bits+=f.base_bits;level.reuse_bits+=f.reuse_bits;level.remaining_bits+=BIT(f.q);level.cold_bits+=f.cold_bits;level.full_bits+=f.full_bits;level.full_hits+=Number(fullHit);
  const out={event:'FACTOR_OBJECT',id:row.id,parent:row.parent,children:row.children.map(c=>c.id),depth:row.depth,kind,offset:offset+n.start,width:w,byte_sha256:sha(bytes),status,n_bits:BIT(value),factors:f.factors.map(x=>({p:hex(x.p),e:x.e,quality:x.quality,sources:x.sources})),cofactor:hex(f.q),cofactor_bits:BIT(f.q),base_bits:f.base_bits,child_bits:f.child_bits,reuse_bits:f.reuse_bits,full_bits:f.full_bits,snapshot:f.snapshot,delta_count:f.delta_count,cold_bits:f.cold_bits,child_candidates:f.child_candidates,global_candidates:f.global_candidates,tested:f.attempted,rho_steps:f.rho_steps,milliseconds:performance.now()-start};
  // Snapshot + postorder delta fully determine extra candidates; capped lists stay explicit.
  console.log(JSON.stringify(out));
  const ret={value,width:w,factors:f.factors};results.set(row.id,ret);return ret
 }
 visit(top);assert.equal(results.size,nodes.length);
 return {offset,width:b.length,sha256:sha(b),root_id:top.id,stats,levels};
}
// Planted inheritance: A=12, B=18, shared factor 6; use primes outside baseline too.
const p=101n,A=p*3n,Bb=p*5n,N=A*256n**2n+Bb;
const fixtureTree=productTree([101n,103n,107n]),fixtureHits=[];hits(101n**3n*107n*109n,fixtureTree,fixtureHits);assert.deepEqual(fixtureHits,[101n,107n]);
const planted=analyze(N,[{factors:[{p}]},{factors:[{p}]}],'fixture');assert(planted.factors.some(f=>f.p===p&&f.sources.includes('child')));assert.equal(planted.factors.reduce((v,f)=>v*f.p**BigInt(f.e),planted.q),N);
inv.clear();cache.clear();delta.clear();
const full=readFileSync(process.argv[2]);assert.equal(full.length,1000000000);assert.equal(sha(full),'159b85351e5f76e60cbe32e04c677847a9ecba3adc79addab6f4c6c7aa3744bc');
seed();
const manifest=JSON.parse(readFileSync('inventory/manifest.json','utf8'));
assert.equal(manifest.corpus_sha256,sha(full));assert.equal(manifest.indexed_nodes,794);
let imported=0;
for(const batch of manifest.batches)for(const shard of batch.shards){
 const data=JSON.parse(readFileSync(shard.path,'utf8'));assert.equal(data.rows.length,shard.rows);
 for(const row of data.rows){
  const value=integer(full.subarray(row.offset,row.offset+row.width));assert.equal(sha(full.subarray(row.offset,row.offset+row.width)),row.byte_sha256);
  assert.equal(row.factors.reduce((n,f)=>n*fromHex(f.p)**BigInt(f.e),fromHex(row.cofactor)),value);
  for(const f of row.factors)learn(fromHex(f.p),row.id,batch.id);imported++;
 }
}
assert.equal(imported,manifest.indexed_nodes);assert.equal(inv.size,manifest.index.distinct_factors);
const indexed=new Set();for(const s of manifest.index.shards){const data=JSON.parse(readFileSync(s.path,'utf8'));assert.equal(data.factors.length,s.count);for(const f of data.factors){const p=fromHex(f.p);assert(inv.has(p)&&!indexed.has(p));indexed.add(p)}}
assert.equal(indexed.size,inv.size);
console.log(JSON.stringify({event:'FACTOR_RESUME',imported,distinct_factors:inv.size}));
const pages=[];
for(const start of [100000000,400000000,800000000]){
 let at=full.indexOf('<page>',start),chosen=null;
 for(let i=0;i<2048&&at>=0;i++){
  const end=full.indexOf('</page>',at)+7;assert(end>at);
  const w=end-at;
  if(w>=1537&&w<=2048){chosen={at,end};break}
  at=full.indexOf('<page>',end);
 }
 assert(chosen,'bounded page selection');rebuildSnapshot();const result=inventoryPage(full.subarray(chosen.at,chosen.end),chosen.at);pages.push(result);console.log(JSON.stringify({event:'FACTOR_PAGE',...result}));
}
console.log(JSON.stringify({event:'FACTOR_INVENTORY_SUMMARY',pages:pages.map(p=>({offset:p.offset,width:p.width,root_id:p.root_id})),distinct_factors:inv.size,nodes:pages.reduce((n,p)=>n+p.stats.nodes,0),seeded_sources:['E0095','E0096','E0099','E0103']}));
