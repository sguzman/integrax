import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {deflateRawSync,inflateRawSync,gzipSync} from 'node:zlib';
const MAX=8*1024*1024,DEPTH=32;
const EXPERIMENT=process.env.IX_C20_EXPERIMENT??'E0152';
const PAGE_MIN=Number(process.env.IX_C20_PAGE_MIN??65536),PAGE_MAX=Number(process.env.IX_C20_PAGE_MAX??81920);
const PAGE_STARTS=JSON.parse(process.env.IX_C20_PAGE_STARTS??'[200000000,600000000,900000000]');
assert(['E0152','E0156'].includes(EXPERIMENT));assert(Number.isSafeInteger(PAGE_MIN)&&Number.isSafeInteger(PAGE_MAX)&&PAGE_MIN>0&&PAGE_MAX>=PAGE_MIN);assert(Array.isArray(PAGE_STARTS)&&PAGE_STARTS.length===3);
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
const inv=new Map(),seenValues=new Set(),witnesses=new Map();
function learn(p,id,origin,value){
 if(value!==undefined){
  const w=witnesses.get(p);
  if(!w)witnesses.set(p,[{id,value}]);
  else if(w.length===1&&w[0].value!==value)w.push({id,value});
 }

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
  const n=BigInt(row.n);seenValues.add(n);for(const p of new Set(fs))learn(p,'E0095:'+row.offset,'E0095',n);cases++;
 }
 const e96=JSON.parse(readFileSync('experiments/records/E0096.json','utf8'));
 for(const row of e96.rows){
  assert.equal(row.terms.reduce((x,t)=>x*BigInt(t.n),1n),BigInt(row.n));
  const n=BigInt(row.n);seenValues.add(n);for(const t of row.terms)if(t.kind!=='unfactored')learn(BigInt(t.n),'E0096:'+row.offset,'E0096',n);cases++;
 }
 const e99=JSON.parse(readFileSync('experiments/records/E0099.json','utf8'));
 for(const shard of e99.factor_shards){
  const data=JSON.parse(readFileSync('experiments/records/'+shard.path,'utf8'));
  assert.equal(data.rows.length,shard.rows);
  for(const row of data.rows){
   assert.equal(row.terms.reduce((x,t)=>x*BigInt(t.n)**BigInt(t.e),1n),BigInt(row.n));
   const n=BigInt(row.n);seenValues.add(n);for(const t of row.terms)if(t.kind!=='unfactored')learn(BigInt(t.n),'E0099:'+row.region+':'+row.offset,'E0099',n);cases++;
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
function hits(n,node,out,stats=null){
 if(!node||n<=1n)return;
 if(stats)stats.gcd_calls++;
 const d=gcd(n,node.product%n);
 if(d===1n)return;
 if(node.p!==undefined){if(n%node.p===0n)out.push(node.p);return}
 hits(d,node.left,out,stats);hits(d,node.right,out,stats);
}
function analyze(n,childRows,id){
 const attempted={base:[],child:[],global:[],cold:[]},valueSeen=seenValues.has(n);
 if(n<=1n){seenValues.add(n);return {value_seen:valueSeen,factors:[],q:n,attempted,base_bits:BIT(n),child_bits:BIT(n),reuse_bits:BIT(n),full_bits:BIT(n),snapshot_bits:BIT(n),flat_snapshot_bits:BIT(n),tree_snapshot_bits:BIT(n),flat_snapshot_ms:0,tree_snapshot_ms:0,tree_gcd_calls:0,snapshot:snapshotId,delta_count:delta.size,cold_bits:BIT(n),rho_steps:0,child_candidates:0,global_candidates:0,inventory_flat_tests:0};}
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
 const deltaCount=delta.size,matched=[];let flatTests=0;
 const inventoryInput=q,flatStart=performance.now();
 for(const p of snapshotSet){if(p>inventoryInput)break;flatTests++;if(inventoryInput%p===0n)matched.push(p)}
 let flatQ=extract(inventoryInput,matched,'inventory-flat',found,[]);
 const flatSnapshotMs=performance.now()-flatStart,flatSnapshotBits=BIT(flatQ);
 const treeMatched=[],treeStats={gcd_calls:0},treeStart=performance.now();
 hits(inventoryInput,snapshot,treeMatched,treeStats);
 let treeQ=extract(inventoryInput,treeMatched,'inventory-tree-control',[],[]);
 const treeSnapshotMs=performance.now()-treeStart,treeSnapshotBits=BIT(treeQ);
 assert.equal(flatQ,treeQ,`flat/tree residual mismatch for ${id}`);
 assert.deepEqual(matched,treeMatched,`flat/tree factor-set mismatch for ${id}`);
 q=flatQ;
 const snapshotBits=flatSnapshotBits;
 const deltaHits=[];for(const p of delta){if(p<=q){flatTests++;if(q%p===0n)deltaHits.push(p)}}
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
 for(const f of factors){
  if(f.sources.some(s=>s==='child'||s==='global'||s==='inventory-flat'||s==='inventory-delta')){
   const w=witnesses.get(f.p)??[],other=w.find(x=>x.value!==n);
   f.prior_distinct_witness=other?.id??null;
   f.prior_witness=w[0]?.id??null;
  }
  learn(f.p,id,EXPERIMENT,n);if(!baseSet.has(f.p)&&!snapshotSet.has(f.p))delta.add(f.p)
 }
 seenValues.add(n);
 return {value_seen:valueSeen,factors,q,attempted,base_bits:baseBits,child_bits:childBits,reuse_bits:reuseBits,full_bits:fullBits,snapshot_bits:snapshotBits,flat_snapshot_bits:flatSnapshotBits,tree_snapshot_bits:treeSnapshotBits,flat_snapshot_ms:flatSnapshotMs,tree_snapshot_ms:treeSnapshotMs,tree_gcd_calls:treeStats.gcd_calls,snapshot:snapshotId,delta_count:deltaCount,cold_bits:BIT(control),rho_steps:4096-budget.left,child_candidates:candidates.length,global_candidates:globals.length,inventory_flat_tests:flatTests}
}
// Frozen nested inventories; no discoveries from the held-out pages enter these screens.
const fixedTrees=[];
function frozenScreen(n){
 if(n<=1n)return fixedTrees.map(t=>({stage:t.stage,bits:BIT(n),hits:0,ms:0}));
 const out=[];let last=BIT(n);
 for(const t of fixedTrees){
  const start=performance.now(),matched=[],used=[];
  const base=extract(n,basePrimes,'base',used,[]);
  hits(base,t.tree,matched);
  const q=extract(base,matched,'frozen',used,[]);
  const b=BIT(q);assert(b<=last);last=b;
  assert.equal(used.reduce((x,f)=>x*f.p**BigInt(f.e),q),n);
  out.push({stage:t.stage,bits:b,hits:used.filter(f=>f.source==='frozen').length,ms:performance.now()-start});
 }
 return out;
}
function inventoryPage(b,offset){
 const root=tree(b),nodes=[];let next=0;
 function assign(n,parent,depth){
  const id='enwik9:'+offset+':'+next++;
  const row={id,parent,depth,node:n,children:[]};nodes.push(row);
  if(n.children)for(const c of n.children)row.children.push(assign(c,id,depth+1));
  return row
 }
 const top=assign(root,null,0),results=new Map(),stats={nodes:0,leaves:0,parents:0,new_values:0,parent_new_values:0,full_hit_new_value:0,full_hit_seen_value:0,parent_full_hit_new_value:0,parent_full_hit_seen_value:0,parent_full_hit_distinct_witness:0,full_inventory_hits:0,parent_full_inventory_hits:0,full_bits_removed:0,parent_full_bits_removed:0,inventory_flat_tests:0,complete:0,partial:0,trivial:0,child_hits:0,global_hits:0,parent_child_hits:0,parent_global_hits:0,parent_better_than_cold:0,parent_worse_than_cold:0,parent_equal_cold:0,child_bits_removed:0,global_bits_removed:0},levels={};
 function visit(row){
  const children=row.children.map(visit),n=row.node,w=n.end-n.start,bytes=b.subarray(n.start,n.end),value=integer(bytes);
  if(children.length){let assembled=0n,len=0;for(const child of children){assembled=(assembled<<BigInt(8*child.width))+child.value;len+=child.width}assert.equal(len,w);assert.equal(assembled,value)}
  const start=performance.now(),f=analyze(value,children,row.id),kind=n.kind??n.name??(row.parent===null?'page-root':'lexical'),isParent=children.length>0;
  const childHit=f.factors.some(x=>x.sources.includes('child')),globalHit=f.factors.some(x=>x.sources.includes('global'));
  const status=value<=1n?'trivial':f.q===1n?'complete':'partial';
  const fullHit=f.factors.some(x=>x.sources.some(s=>s==='inventory-flat'||s==='inventory-delta'));
  if(!f.value_seen){stats.new_values++;if(isParent)stats.parent_new_values++}
  if(fullHit){
   stats.full_inventory_hits++;stats[f.value_seen?'full_hit_seen_value':'full_hit_new_value']++;
   if(isParent){stats.parent_full_inventory_hits++;stats[f.value_seen?'parent_full_hit_seen_value':'parent_full_hit_new_value']++;
    if(f.factors.some(x=>x.prior_distinct_witness&&x.sources.some(s=>s==='inventory-flat'||s==='inventory-delta')))stats.parent_full_hit_distinct_witness++}
  }
  stats.full_bits_removed+=f.reuse_bits-f.full_bits;if(isParent)stats.parent_full_bits_removed+=f.reuse_bits-f.full_bits;
  stats.nodes++;stats[isParent?'parents':'leaves']++;stats[status]++;
  if(stats.nodes%5000===0)console.error(JSON.stringify({event:`${EXPERIMENT}_PROGRESS`,page_offset:offset,page_width:b.length,nodes:stats.nodes,parents:stats.parents,full_inventory_hits:stats.full_inventory_hits}));
  if(childHit)stats.child_hits++;if(globalHit)stats.global_hits++;
  if(isParent){if(childHit)stats.parent_child_hits++;if(globalHit)stats.parent_global_hits++;stats[f.reuse_bits<f.cold_bits?'parent_better_than_cold':f.reuse_bits>f.cold_bits?'parent_worse_than_cold':'parent_equal_cold']++}
  stats.child_bits_removed+=f.base_bits-f.child_bits;stats.global_bits_removed+=f.child_bits-f.reuse_bits;stats.inventory_flat_tests+=f.inventory_flat_tests??0;
  const level=levels[kind]??={nodes:0,complete:0,partial:0,trivial:0,child_hits:0,global_hits:0,bits:0,base_bits:0,reuse_bits:0,remaining_bits:0,cold_bits:0,full_bits:0,full_hits:0};
  level.nodes++;level[status]++;level.child_hits+=Number(childHit);level.global_hits+=Number(globalHit);level.bits+=BIT(value);level.base_bits+=f.base_bits;level.reuse_bits+=f.reuse_bits;level.remaining_bits+=BIT(f.q);level.cold_bits+=f.cold_bits;level.full_bits+=f.full_bits;level.full_hits+=Number(fullHit);
  const fixed=frozenScreen(value);
  const out={event:'FACTOR_OBJECT',fixed_inventory:fixed,id:row.id,parent:row.parent,children:row.children.map(c=>c.id),depth:row.depth,kind,offset:offset+n.start,width:w,byte_sha256:sha(bytes),status,n_bits:BIT(value),value_seen:f.value_seen,factors:f.factors.map(x=>({p:hex(x.p),e:x.e,quality:x.quality,sources:x.sources,prior_witness:x.prior_witness??null,prior_distinct_witness:x.prior_distinct_witness??null})),cofactor:hex(f.q),cofactor_bits:BIT(f.q),base_bits:f.base_bits,child_bits:f.child_bits,reuse_bits:f.reuse_bits,full_bits:f.full_bits,snapshot_bits:f.snapshot_bits,flat_snapshot_bits:f.flat_snapshot_bits,tree_snapshot_bits:f.tree_snapshot_bits,flat_snapshot_ms:f.flat_snapshot_ms,tree_snapshot_ms:f.tree_snapshot_ms,tree_gcd_calls:f.tree_gcd_calls,snapshot:f.snapshot,delta_count:f.delta_count,cold_bits:f.cold_bits,child_candidates:f.child_candidates,global_candidates:f.global_candidates,inventory_flat_tests:f.inventory_flat_tests??0,tested:f.attempted,rho_steps:f.rho_steps,milliseconds:performance.now()-start};
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
inv.clear();cache.clear();delta.clear();seenValues.clear();witnesses.clear();
const full=readFileSync(process.argv[2]);assert.equal(full.length,1000000000);assert.equal(sha(full),'159b85351e5f76e60cbe32e04c677847a9ecba3adc79addab6f4c6c7aa3744bc');
seed();
const manifest=JSON.parse(readFileSync('inventory/manifest.json','utf8'));
assert.equal(manifest.corpus_sha256,sha(full));assert.equal(manifest.indexed_nodes,290180);assert.equal(manifest.index.distinct_factors,47547);assert.equal(manifest.batches.at(-1).id,'E0149');
const overlays=new Map();for(const r of manifest.refinements??[]){const data=JSON.parse(readFileSync(r.path,'utf8'));assert.equal(data.rows.length,r.rows);for(const x of data.rows){const list=overlays.get(x.id)??[];list.push({...x,origin:r.id});overlays.set(x.id,list)}}
const consumed=new Set(),oldOffsets=new Set(manifest.batches.flatMap(b=>b.shards.map(s=>s.offset)));
let imported=0;
for(const batch of manifest.batches)for(const shard of batch.shards){
 const data=JSON.parse(readFileSync(shard.path,'utf8'));assert.equal(data.rows.length,shard.rows);
 for(const row of data.rows){
  const value=integer(full.subarray(row.offset,row.offset+row.width));assert.equal(sha(full.subarray(row.offset,row.offset+row.width)),row.byte_sha256);
  assert.equal(row.factors.reduce((n,f)=>n*fromHex(f.p)**BigInt(f.e),fromHex(row.cofactor)),value);
  seenValues.add(value);for(const f of row.factors)learn(fromHex(f.p),row.id,batch.id,value);
  let q=fromHex(row.cofactor);for(const ref of overlays.get(row.id)??[]){assert.equal(fromHex(ref.old_cofactor),q);assert.equal(ref.factors.reduce((n,f)=>n*fromHex(f.p)**BigInt(f.e),fromHex(ref.remaining)),q);assert.equal(ref.unresolved_parts.reduce((n,x)=>n*fromHex(x),1n),fromHex(ref.remaining));for(const f of ref.factors){assert.equal(quality(fromHex(f.p)),f.quality);learn(fromHex(f.p),row.id,ref.origin,value)}q=fromHex(ref.remaining);consumed.add(row.id)}
  imported++;
 }
}
assert.equal(consumed.size,overlays.size);assert.equal(imported,manifest.indexed_nodes);assert.equal(inv.size,manifest.index.distinct_factors);
const indexed=new Set();for(const s of manifest.index.shards){const data=JSON.parse(readFileSync(s.path,'utf8'));assert.equal(data.factors.length,s.count);for(const f of data.factors){const p=fromHex(f.p);assert(inv.has(p));assert.equal(inv.get(p).quality,f.quality);indexed.add(p)}}
assert.equal(indexed.size,inv.size);
console.log(JSON.stringify({event:'FACTOR_RESUME',imported,distinct_factors:inv.size}));
const frozen=new Set();
for(const [stage,count] of [['E0104',3286],['E0105',4145],['E0106',4146],['E0107',5144],['E0108',6504],['E0110',6507],['E0112',8376],['E0114',8378],['E0116',10788],['E0119',13631],['E0121',13633],['E0123',16081],['E0126',18778],['E0128',22124],['E0131',24808],['E0134',28721],['E0137',33701],['E0140',38074],['E0144',43328],['E0149',47547]]){
 for(const s of manifest.index.shards.filter(s=>s.path.startsWith('inventory/index/'+stage+'/'))){
  const data=JSON.parse(readFileSync(s.path,'utf8'));for(const f of data.factors)frozen.add(fromHex(f.p));
 }
 assert.equal(frozen.size,count);
 const xs=[...frozen].filter(p=>!baseSet.has(p)).sort((a,b)=>a<b?-1:a>b?1:0);
 fixedTrees.push({stage,tree:productTree(xs)});
 console.log(JSON.stringify({event:'FACTOR_FROZEN_INVENTORY',stage,distinct_factors:count,tree_factors:xs.length}));
}
const pages=[];
for(const start of PAGE_STARTS){
 let at=full.indexOf('<page>',start),chosen=null;
 for(let i=0;i<16384&&at>=0;i++){
  const end=full.indexOf('</page>',at)+7;assert(end>at);
  const w=end-at;
  if(w>=PAGE_MIN&&w<=PAGE_MAX&&!oldOffsets.has(at)){chosen={at,end};break}
  at=full.indexOf('<page>',end);
 }
  assert(chosen,'bounded page selection');console.error(JSON.stringify({event:`${EXPERIMENT}_PAGE_START`,page_offset:chosen.at,page_width:chosen.end-chosen.at}));rebuildSnapshot();const result=inventoryPage(full.subarray(chosen.at,chosen.end),chosen.at);pages.push(result);console.error(JSON.stringify({event:`${EXPERIMENT}_PAGE_DONE`,page_offset:result.offset,page_width:result.width,nodes:result.stats.nodes,full_inventory_hits:result.stats.full_inventory_hits}));console.log(JSON.stringify({event:'FACTOR_PAGE',...result}));
}
console.log(JSON.stringify({event:`${EXPERIMENT}_FACTOR_INVENTORY_SUMMARY`,pages:pages.map(p=>({offset:p.offset,width:p.width,root_id:p.root_id})),distinct_factors:inv.size,nodes:pages.reduce((n,p)=>n+p.stats.nodes,0),candidate_algorithm:'flat-scan',target_page_width_bytes:[PAGE_MIN,PAGE_MAX],seeded_sources:['E0095','E0096','E0099','E0103','E0104','E0105','E0106','E0107','E0108','E0109','E0110','E0111','E0112','E0113','E0114','E0115','E0116','E0117','E0119','E0120','E0121','E0122','E0123','E0126','E0128','E0129','E0131','E0132','E0133','E0134','E0135','E0137','E0140','E0144','E0145','E0149',...(EXPERIMENT==='E0156'?['E0152']:[])]}));
