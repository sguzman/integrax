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
function train(b,n){
 const counts=new Map();walk(n,x=>{const w=x.end-x.start;if(w<2||w>64)return;const s=b.subarray(x.start,x.end),k=s.toString('hex');let z=counts.get(k);if(!z){z={b:s,n:0};counts.set(k,z)}z.n++});
 return [...counts.values()].filter(z=>z.n>=2).sort((a,b)=>(b.n-1)*(b.b.length-1)-(a.n-1)*(a.b.length-1)||Buffer.compare(a.b,b.b)).slice(0,128).map(x=>x.b)
}
function archive(b,root,dict,mode,factors=new Map()){
 const ids=new Map(dict.map((v,i)=>[v.toString('hex'),i]));
 function best(n,force=false){
  const x=b.subarray(n.start,n.end),w=x.length;
  let out=B(t(0),u(w),x);
  const choose=c=>{if(c.length<out.length)out=c};
  if(w<=64&&ids.has(x.toString('hex')))choose(B(t(1),u(ids.get(x.toString('hex')))));
  if((mode&2)&&w>=64){const z=deflateRawSync(x,{level:6});choose(B(t(3),u(w),u(z.length),z))}
  if((mode&1)&&w>0&&w<=64){
   // Decimal digit representation is a different radix for exactly the same bytes.
   if(x.every(c=>c>=48&&c<=57)){const z=mag(BigInt(x.toString('ascii')));choose(B(t(4),u(w),u(z.length),z))}
   const n=integer(x);
   if(n>1n)for(let i=0;i<primes.length;i++){const p=primes[i];let q=n,e=0;while(q%p===0n){q/=p;e++}if(e){const z=mag(q);choose(B(t(5),u(w),u(i),u(e),u(z.length),z))}}
  }
  if((mode&1)&&w>0&&w<=512){
   for(let k=0;k<alphabets.length;k++){
    const alphabet=alphabets[k],radix=BigInt(alphabet.length);let rank=0n,ok=true;
    for(const c of x){const digit=alphabet.indexOf(c);if(digit<0){ok=false;break}rank=rank*radix+BigInt(digit)}
    if(ok){const z=mag(rank);choose(B(t(7),u(w),u(k),u(z.length),z))}
   }
   if(w<=32){const terms=factors.get(x.toString('hex'));if(terms&&terms.length>1){
    const z=terms.map(q=>{const m=mag(q.n);return B(u(m.length),m,u(q.e))});
    choose(Buffer.concat([t(6),u(w),u(z.length),...z]));
   }}
  }
  if(n.children&&n.children.length){
   const parts=n.children.map(c=>best(c));
   const c=Buffer.concat([t(2),u(parts.length),...parts]);
   if(force)out=c;else choose(c);
  }
  return out
 }
 const d=Buffer.concat([u(dict.length),...dict.flatMap(x=>[u(x.length),x])]);
 // Root forced to concatenate its page and gap objects. Within each object the optimizer may collapse the tree.
 return B(Buffer.from('IXT3'),u(b.length),d,best(root,true));
}
function decode(a){
 let at=0,output=0,nodes=0;const counts=Array(8).fill(0);
 const take=n=>{assert(Number.isSafeInteger(n)&&n>=0&&at+n<=a.length);const x=a.subarray(at,at+n);at+=n;return x};
 function get(){let v=0,s=1;for(let i=0;i<4;i++){const b=take(1)[0];v+=(b&127)*s;if(b<128){assert(i===0||b!==0);assert(v<=MAX);return v}s*=128}throw Error('varint')}
 assert.equal(take(4).toString(),'IXT3');const size=get(),nd=get();assert(nd<=128);const dict=[];
 for(let i=0;i<nd;i++){const n=get();assert(n>=2&&n<=64);dict.push(take(n))}
 function leaf(b){output+=b.length;assert(output<=size);return b}
 function node(depth){
  assert(depth<=DEPTH&&++nodes<=size*2+1);const tag=take(1)[0];assert(tag<8);counts[tag]++;
  if(tag===0)return leaf(take(get()));
  if(tag===1){const x=dict[get()];assert(x);return leaf(x)}
  if(tag===2){const n=get();assert(n>0&&n<=size+1);const a=[];for(let i=0;i<n;i++)a.push(node(depth+1));return Buffer.concat(a)}
  const w=get();assert(w>0&&w<=size-output);
  if(tag===3){const z=take(get());const x=inflateRawSync(z,{maxOutputLength:w});assert.equal(x.length,w);return leaf(x)}
  if(tag===7){
   assert(w<=512);const alphabet=alphabets[get()],len=get();assert(alphabet&&len<=w);let rank=integer(take(len));const x=Buffer.alloc(w),radix=BigInt(alphabet.length);
   for(let i=w-1;i>=0;i--){x[i]=alphabet[Number(rank%radix)];rank/=radix}assert.equal(rank,0n);return leaf(x)
  }
  if(tag===6){
   assert(w<=32);const count=get();assert(count>0&&count<=256);let n=1n,prev=1n;
   for(let i=0;i<count;i++){const len=get();assert(len>0&&len<=w);const q=integer(take(len)),e=get();assert(q>prev&&e>0&&e<=256);prev=q;n*=q**BigInt(e);assert(n<(1n<<BigInt(w*8)))}
   return leaf(fixed(n,w))
  }
  assert(w<=64);
  if(tag===4){const len=get();assert(len<=64);const x=integer(take(len)).toString();assert(x.length<=w);return leaf(Buffer.from(x.padStart(w,'0'),'ascii'))}
  if(tag===5){const p=primes[get()],e=get(),len=get();assert(p&&e>0&&e<=512&&len<=64);return leaf(fixed(p**BigInt(e)*integer(take(len)),w))}
  throw Error('tag')
 }
 const b=node(0);assert.equal(b.length,size);assert.equal(output,size);assert.equal(at,a.length);return {b,counts};
}
function check(b,dict,mode,factors=new Map(),root=tree(b)){
 const a=archive(b,root,dict,mode,factors),d=decode(a);
 assert.deepEqual(d.b,b);assert.throws(()=>decode(B(a,t(0))));assert.throws(()=>decode(a.subarray(0,a.length-1)));
 return {archive_bytes:a.length,archive_sha256:sha(a),counts:d.counts,verified:true}
}

const alphabets=['abcdefghijklmnopqrstuvwxyz','ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz ','abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ ','abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ','0123456789'].map(s=>Buffer.from(s));
const gcd=(a,b)=>{while(b)[a,b]=[b,a%b];return a};
function pow(a,e,n){let r=1n;while(e){if(e&1n)r=r*a%n;a=a*a%n;e>>=1n}return r}
const small=[];for(let p=2;p<=997;p++)if(!small.some(q=>q*q<=p&&p%q===0))small.push(p);
function probable(n){
 if(n<2n)return false;for(const p of small.slice(0,12)){let q=BigInt(p);if(n%q===0n)return n===q}
 let d=n-1n,s=0;while(!(d&1n)){d>>=1n;s++}
 const bases=n<(1n<<64n)?[2n,325n,9375n,28178n,450775n,9780504n,1795265022n]:[2n,3n,5n,7n,11n,13n,17n,19n,23n,29n,31n,37n];
 outer:for(const base of bases){let a=base%n;if(!a)continue;let x=pow(a,d,n);if(x===1n||x===n-1n)continue;
  for(let i=1;i<s;i++){x=x*x%n;if(x===n-1n)continue outer}return false}
 return true
}
function split(n,budget,out){
 if(n===1n)return;
 if(probable(n)){out.push({n,kind:n<(1n<<64n)?'prime64':'probable-prime'});return}
 for(let c=1n;c<=4n&&budget.left;c++){let x=2n,y=2n;const f=z=>(z*z+c)%n;
  for(let i=0;i<2048&&budget.left;i++){budget.left--;x=f(x);y=f(f(y));const d=gcd(x>y?x-y:y-x,n);if(d===n)break;if(d>1n){split(d,budget,out);split(n/d,budget,out);return}}
 }
 out.push({n,kind:'unfactored'})
}
function factor(n){
 let q=n,out=[],budget={left:8192};
 for(const p of small){const d=BigInt(p);while(q>1n&&q%d===0n){out.push({n:d,kind:'prime64'});q/=d}}
 split(q,budget,out);out.sort((a,b)=>a.n<b.n?-1:a.n>b.n?1:0);
 assert.equal(out.reduce((a,t)=>a*t.n,1n),n);
 const terms=[];for(const t of out){if(terms.length&&terms.at(-1).n===t.n)terms.at(-1).e++;else terms.push({...t,e:1})}
 return {terms,steps:8192-budget.left}
}
function mix(x){x=Math.imul(x^(x>>>16),0x7feb352d);x=Math.imul(x^(x>>>15),0x846ca68b);return (x^(x>>>16))>>>0}
function probe(b,root,region){
 const counts={},candidates=new Map();
 walk(root,n=>{
  if(!n.kind)return;const w=n.end-n.start;
  counts[n.kind]=(counts[n.kind]??0)+1;
  if(w<2||w>32)return;
  const k=n.kind+'|'+(w<=8?'2-8':w<=16?'9-16':'17-32'),x=b.subarray(n.start,n.end),hex=x.toString('hex');
  if(!candidates.has(k))candidates.set(k,new Map());
  const pool=candidates.get(k);let e=pool.get(hex);
  if(!e){e={hex,start:n.start,width:w,count:0};pool.set(hex,e)}e.count++
 });
 const cache=new Map(),stats={tested:0,complete:0,unresolved:0,nontrivial:0,local_factor_wins:0,local_factor_saved:0},cohorts=[];
 for(const [k,pool] of [...candidates.entries()].sort()){
  // Distinct values, prefer recurring values, deterministic spread among frequency ties.
  const rows=[...pool.values()].sort((a,b)=>b.count-a.count||mix(a.start)-mix(b.start)||a.start-b.start).slice(0,64);
  let evaluated=0;
  for(const row of rows){const n=BigInt('0x'+row.hex);if(n<2n)continue;
   let f=cache.get(row.hex);if(!f){f=factor(n);cache.set(row.hex,f)}
   const ts=f.terms;assert.equal(ts.reduce((v,t)=>v*t.n**BigInt(t.e),1n),n);
   assert.deepEqual(fixed(n,row.width),b.subarray(row.start,row.start+row.width));
   const raw=1+u(row.width).length+row.width;
   const cost=1+u(row.width).length+u(ts.length).length+ts.reduce((s,t)=>{const z=mag(t.n);return s+u(z.length).length+z.length+u(t.e).length},0);
   const unresolved=ts.some(t=>t.kind==='unfactored');
   stats.tested++;evaluated++;stats[unresolved?'unresolved':'complete']++;
   if(ts.reduce((s,t)=>s+t.e,0)>1)stats.nontrivial++;
   if(cost<raw){stats.local_factor_wins++;stats.local_factor_saved+=raw-cost}
   console.log(JSON.stringify({event:'ARTICLE_FACTOR',region,cohort:k,offset:row.start,width:row.width,occurrences:row.count,n:n.toString(),terms:ts.map(t=>({...t,n:t.n.toString()})),steps:f.steps,raw_record_bytes:raw,factor_record_bytes:cost}));
  }
  cohorts.push({cohort:k,distinct:pool.size,evaluated})
 }
 return {cache:new Map([...cache].map(([k,f])=>[k,f.terms])),counts,cohorts,stats}
}
const fixture=Buffer.from('<page><revision><text>alpha beta gamma delta. next sentence!\nparagraph here. 000001234567890123456789</text></revision></page>');
const tr=tree(fixture);let kinds=new Set();walk(tr,n=>{if(n.kind)kinds.add(n.kind)});assert(['article','paragraph','sentence','phrase','word'].every(k=>kinds.has(k)));
for(const mode of [0,1,2,3])check(fixture,[],mode,new Map(),tr);
const lower=Buffer.from('<text>abcdefghijklmnopqrstuvwxyz abcdefghijklmnopqrstuvwxyz</text>');assert(check(lower,[],1).counts[7]>0);
const product=Buffer.concat([Buffer.from('<r>'),fixed(2n**120n*3n,16),Buffer.from('</r>')]);
const phex=product.subarray(3,19).toString('hex'),f=factor(BigInt('0x'+phex));assert.equal(f.terms.reduce((v,t)=>v*t.n**BigInt(t.e),1n),2n**120n*3n);
const packed=Buffer.concat([Buffer.from('IXT3'),u(16),u(0),t(6),u(16),u(2),u(1),t(2),u(120),u(1),t(3),u(1)]);assert.deepEqual(decode(packed).b,fixed(2n**120n*3n,16));
const direct=Buffer.from('abcdefghijklmnop');const directf=factor(integer(direct));assert.equal(directf.terms.reduce((v,t)=>v*t.n**BigInt(t.e),1n),integer(direct));
const full=readFileSync(process.argv[2]);assert.equal(full.length,1000000000);assert.equal(sha(full),'159b85351e5f76e60cbe32e04c677847a9ecba3adc79addab6f4c6c7aa3744bc');
function region(offset){
 const start=full.indexOf('<page>',offset);assert(start>=0);
 const end=full.indexOf('</page>',start+262144)+7;assert(end>start&&end-start<MAX);
 return {start,end,b:full.subarray(start,end)}
}
const training=region(0),shared=train(training.b,tree(training.b));
const totals={raw:0,gzip:0,structural:0,arithmetic:0,hybrid:0,hybrid_arithmetic:0,shallow_hybrid:0,tested:0,complete:0,unresolved:0,nontrivial:0,local_factor_wins:0,local_factor_saved:0,factor_nodes:0,radix_nodes:0,hybrid_factor_nodes:0,hybrid_radix_nodes:0};
for(const offset of [100000000,400000000,800000000]){
 const {start,end,b}=region(offset),tm=performance.now(),root=tree(b),p=probe(b,root,offset);
 const [structural,arithmetic,hybrid,hybrid_arithmetic]=[0,1,2,3].map(m=>check(b,shared,m,p.cache,root));
 const shallow_hybrid=check(b,shared,2,new Map(),tree(b,false)),gzip=gzipSync(b,{level:9}).length;
 assert(arithmetic.archive_bytes<=structural.archive_bytes&&hybrid_arithmetic.archive_bytes<=hybrid.archive_bytes&&hybrid.archive_bytes<=shallow_hybrid.archive_bytes);
 console.log(JSON.stringify({event:'ARTICLE_REGION',offset,start,end,input_sha256:sha(b),raw:b.length,gzip,structural,arithmetic,hybrid,hybrid_arithmetic,shallow_hybrid,counts:p.counts,cohorts:p.cohorts,stats:p.stats,unique_factor_values:p.cache.size,seconds:(performance.now()-tm)/1000}));
 totals.raw+=b.length;totals.gzip+=gzip;
 for(const [k,v] of Object.entries({structural,arithmetic,hybrid,hybrid_arithmetic,shallow_hybrid}))totals[k]+=v.archive_bytes;
 for(const [k,v] of Object.entries(p.stats))totals[k]+=v;
 totals.factor_nodes+=arithmetic.counts[5]+arithmetic.counts[6];totals.radix_nodes+=arithmetic.counts[4]+arithmetic.counts[7];totals.hybrid_factor_nodes+=hybrid_arithmetic.counts[5]+hybrid_arithmetic.counts[6];totals.hybrid_radix_nodes+=hybrid_arithmetic.counts[4]+hybrid_arithmetic.counts[7];
}
console.log(JSON.stringify({event:'ARTICLE_SUMMARY',training_start:training.start,training_end:training.end,dictionary_entries:shared.length,...totals}));
