import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
// Independent lexical census: delimiter search, quoted tag regex and stack.
const widthBucket=n=>n===0?0:n<=8?1:n<=16?2:n<=32?3:n<=64?4:n<=256?5:n<=1024?6:n<=4096?7:8;
function mix(x){x=Math.imul(x^(x>>>16),0x7feb352d);x=Math.imul(x^(x>>>15),0x846ca68b);return (x^(x>>>16))>>>0}
function census(b,targets=new Map()){
 const stats=new Map(),stack=[],seen=new Set(),samples=new Map();
 let p=0,tokens=0,markup_bytes=0,text_bytes=0,opaque_bytes=0,partial_markup_bytes=0,max_depth=0,roots=0,complete_elements=0;
 function span(path,kind,start,end){
  const key=path+'|'+kind,n=end-start,bin=widthBucket(n);
  let st=stats.get(key);if(!st){st={path,kind,count:0,bytes:0,max:0,buckets:Array(9).fill(0)};stats.set(key,st)}
  st.count++;st.bytes+=n;st.max=Math.max(st.max,n);st.buckets[bin]++;
  const target=targets.get(start);if(target)for(const f of target)if(f.path===path&&f.kind===kind&&f.width===n)seen.add(f);
  if(n>=1&&n<=64){
   const k=key+'|'+bin;let list=samples.get(k);if(!list){list=[];samples.set(k,list)}
   const count=st.buckets[bin],j=count<=256?count-1:mix(count+bin*1234567)%count;
   if(j<256)list[j]={path,kind,offset:start,width:n};
  }
 }
 while(p<b.length){
  const lt=b.indexOf(60,p);
  if(lt!==p){const e=lt<0?b.length:lt;text_bytes+=e-p;tokens++;p=e;continue}
  tokens++;
  let opaque=false,e=-1;
  for(const [prefix,suffix] of [['<!--','-->'],['<![CDATA[',']]>'],['<?','?>']]){
   if(b.subarray(p,p+prefix.length).toString('latin1')===prefix){opaque=true;const j=b.indexOf(suffix,p+prefix.length);e=j<0?-1:j+suffix.length;break}
  }
  if(opaque){if(e<0){partial_markup_bytes+=b.length-p;break}opaque_bytes+=e-p;if(stack.length)stack.at(-1).opaque=true;p=e;continue}
  assert.notEqual(b[p+1],33,'unsupported declaration');
  // Find a closing delimiter outside quoted attributes.
  let gt=b.indexOf(62,p+1),tag='';
  while(gt>=0){
   tag=b.subarray(p,gt+1).toString('latin1');
   const unquoted=tag.replace(/"[^"]*"|'[^']*'/g,'');
   if(!/["']/.test(unquoted))break;
   gt=b.indexOf(62,gt+1);
  }
  if(gt<0){partial_markup_bytes+=b.length-p;break}
  e=gt+1;markup_bytes+=e-p;
  const m=/^<(\/?)([A-Za-z0-9_:.-]+)(?=[\s/>])/.exec(tag);assert(m,'tag name');
  const name=m[2];
  if(m[1]){
   assert(new RegExp('^</'+name.replace(/[.*+?^$(){}|[\]\\]/g,'\\$&')+'\\s*>$').test(tag),'closing tag');
   const f=stack.pop();assert(f&&f.name===name,'nesting');
   span(f.path,'element',f.start,e);
   if(!f.children&&!f.opaque)span(f.path,'leaf-body',f.body,p);
   complete_elements++;
  }else{
   const parent=stack.at(-1),path=(parent?parent.path:'')+'/'+name;
   if(parent)parent.children++;else roots++;
   max_depth=Math.max(max_depth,stack.length+1);
   if(/\/\s*>$/.test(tag)){span(path,'element',p,e);span(path,'leaf-body',e,e);complete_elements++}
   else stack.push({name,path,start:p,body:e,children:0,opaque:false});
  }
  p=e;
 }
 const profile={bytes:b.length,tokens,markup_bytes,text_bytes,opaque_bytes,partial_markup_bytes,max_depth,roots,complete_elements,open_tail:stack.map(x=>x.path)};
 assert.equal(markup_bytes+text_bytes+opaque_bytes+partial_markup_bytes,b.length);
 return {profile,stats,seen,samples};
}

const {readFileSync: read}=await import('node:fs');
const sha=b=>createHash('sha256').update(b).digest('hex');
const primes=[];for(let p=2;p<=997;p++)if(!primes.some(q=>q*q<=p&&p%q===0))primes.push(p);
const bigPrimes=primes.map(BigInt);
const ub=n=>{let x=BigInt(n),a=[];do{let c=Number(x&127n);x>>=7n;if(x)c|=128;a.push(c)}while(x);return Buffer.from(a)};
const toInt=b=>b.length?BigInt('0x'+b.toString('hex')):0n;
function rawInt(x){if(!x)return Buffer.alloc(0);let h=x.toString(16);return Buffer.from(h.length%2?'0'+h:h,'hex')}
function fixed(x,w){const b=rawInt(x);assert(b.length<=w);return Buffer.concat([Buffer.alloc(w-b.length),b]);}
const key=b=>b.toString('hex');
const B=(...parts)=>Buffer.concat(parts);
function smooth(b){
 let q=toInt(b);const terms=[];
 if(q>1n)for(let i=0;i<primes.length;i++){
  const p=bigPrimes[i];let e=0;while(q%p===0n){q/=p;e++}
  if(e)terms.push({p,e});
  if(q===1n)break;
 }
 return {q,terms};
}
// Explicit records: width + tag + body. All candidate modes use same framing.
// Candidate A: literal. B: whole-value dictionary index. C: exact product of dictionary factors and cofactor.
function literal(b){return B(ub(b.length),Buffer.from([0]),b)}
function byValue(b,idx){return B(ub(b.length),Buffer.from([1]),ub(idx))}
function byFactor(b,terms,q,dict){
 const qb=rawInt(q),parts=[ub(b.length),Buffer.from([2]),ub(terms.length)];
 for(const t of terms)parts.push(ub(dict.get(t.p)),ub(t.e));
 parts.push(ub(qb.length),qb);return B(...parts);
}
// Mode D: one dictionary divisor and raw quotient; remainder fixed zero.
// Any integral divisor is allowed; no prime claim is needed.
function byDivisor(b,d,q,dict){
 const qb=rawInt(q);return B(ub(b.length),Buffer.from([3]),ub(dict.get(d)),ub(qb.length),qb)
}
function dictionaryBytes(vals,divs){
 const parts=[ub(vals.length)];
 for(const b of vals)parts.push(ub(b.length),b);
 parts.push(ub(divs.length));
 for(const d of divs){const b=rawInt(d);parts.push(ub(b.length),b)}
 return B(...parts)
}
function train(trainRows){
 const values=new Map(),factors=new Map(),products=new Map();
 for(const b of trainRows){
  const k=key(b),entry=values.get(k)??{b,n:0};entry.n++;values.set(k,entry);
  const t=smooth(b);
  for(const {p,e} of t.terms){
   factors.set(p,(factors.get(p)??0)+1);
   const d=p**BigInt(e);if(d>1n)products.set(d,(products.get(d)??0)+1);
  }
  let d=1n;for(const t1 of t.terms)d*=t1.p**BigInt(t1.e);
  if(d>1n)products.set(d,(products.get(d)??0)+1);
 }
 const vals=[...values.values()].filter(x=>x.n>=2).sort((a,b)=>(b.n-1)*b.b.length-(a.n-1)*a.b.length||Buffer.compare(a.b,b.b)).slice(0,128).map(x=>x.b);
 const divs=[...new Set([...factors.keys(),...products.keys()])].map(d=>({d,n:(products.get(d)??0)+(factors.get(d)??0)})).filter(x=>x.n>=2).sort((a,b)=>b.n-a.n||(a.d<b.d?-1:a.d>b.d?1:0)).slice(0,128).map(x=>x.d);
 return {vals,divs};
}
function encodeGroup(rows,vals,divs,allowFactors){
 const vi=new Map(vals.map((b,i)=>[key(b),i])),di=new Map(divs.map((d,i)=>[d,i]));
 const records=[],counts=[0,0,0,0];
 for(const b of rows){
  let best=literal(b),tag=0;
  const i=vi.get(key(b));
  if(i!==undefined){const c=byValue(b,i);if(c.length<best.length){best=c;tag=1}}
  const n=toInt(b);
  if(allowFactors&&n>1n&&divs.length){
   let q=n;const ts=[];
   for(const d of divs){let e=0;while(q>1n&&q%d===0n){q/=d;e++}if(e)ts.push({p:d,e});}
   if(ts.length){const c=byFactor(b,ts,q,di);if(c.length<best.length){best=c;tag=2}}
   for(const d of divs)if(d<n&&n%d===0n){const c=byDivisor(b,d,n/d,di);if(c.length<best.length){best=c;tag=3}}
  }
  records.push(best);counts[tag]++;
 }
 return {archive:B(Buffer.from('IXD1'),ub(rows.length),dictionaryBytes(vals,divs),...records),counts};
}
function decodeGroup(b){
 let p=0;
 function take(n){assert(Number.isSafeInteger(n)&&n>=0&&p+n<=b.length);const x=b.subarray(p,p+n);p+=n;return x}
 function u(){let x=0,s=0;for(let i=0;i<5;i++){const v=take(1)[0];x+=(v&127)*2**s;if(v<128){assert(i===0||v!==0);return x}s+=7}throw Error('varint')}
 function num(){return toInt(take(u()))}
 assert.equal(take(4).toString(),'IXD1');const n=u();assert(n<=65536);
 const nv=u();assert(nv<=128);const vals=[];for(let j=0;j<nv;j++)vals.push(take(u()));
 const nd=u();assert(nd<=128);const ds=[];for(let j=0;j<nd;j++){const d=num();assert(d>1n);ds.push(d)}
 const rows=[];
 for(let i=0;i<n;i++){const w=u(),tag=take(1)[0];assert(w<=64);
  if(tag===0)rows.push(take(w));
  else if(tag===1){const v=vals[u()];assert(v&&v.length===w);rows.push(v)}
  else if(tag===2){let n=1n;const count=u();assert(count>0&&count<=128);const used=new Set();for(let j=0;j<count;j++){const idx=u(),e=u();assert(ds[idx]&&e>0&&e<=512&&!used.has(idx));used.add(idx);n*=ds[idx]**BigInt(e)}n*=num();rows.push(fixed(n,w))}
  else if(tag===3){const d=ds[u()];assert(d);rows.push(fixed(d*num(),w))}
  else throw Error('tag');
 }
 assert.equal(p,b.length);return rows;
}
function evaluate(rows,trainRows){
 const {vals,divs}=train(trainRows);
 const plain=encodeGroup(rows,[],[],false),value=encodeGroup(rows,vals,[],false),factor=encodeGroup(rows,[],divs,true),joint=encodeGroup(rows,vals,divs,true);
 for(const g of [plain,value,factor,joint]){
  assert.deepEqual(decodeGroup(g.archive),rows);
  assert.throws(()=>decodeGroup(B(g.archive,Buffer.from([0]))));
 }
 return {count:rows.length,raw_bytes:rows.reduce((s,b)=>s+b.length,0),train_count:trainRows.length,value_dict:vals.length,factor_dict:divs.length,plain:plain.archive.length,value:value.archive.length,factor:factor.archive.length,joint:joint.archive.length,plain_counts:plain.counts,value_counts:value.counts,factor_counts:factor.counts,joint_counts:joint.counts};
}
// Fixtures: repeated whole values and products with different quotients.
const synth=Array.from({length:256},(_,i)=>fixed(2n**128n*BigInt(2*i+1),24));
const fixture=evaluate(synth.slice(128),synth.slice(0,128));assert(fixture.factor<fixture.plain);assert(fixture.factor_counts[2]+fixture.factor_counts[3]>0);
const repeat=Array(128).fill(Buffer.from('identical object'));const f2=evaluate(repeat,repeat);assert(f2.value<f2.plain);
console.log(JSON.stringify({event:'XML_DICT_FIXTURES',factor:fixture,value:f2}));
const path=process.argv[2],b=read(path);assert.equal(b.length,1000000000);assert.equal(sha(b),'159b85351e5f76e60cbe32e04c677847a9ecba3adc79addab6f4c6c7aa3744bc');
const start=performance.now(),c=census(b);
assert.equal(c.profile.complete_elements,2686411);
let total={count:0,raw_bytes:0,plain:0,value:0,factor:0,joint:0,joint_best_without_factor:0,joint_best:0,arithmetic_records:0};
for(const k of [...c.samples.keys()].sort()){
 // Path/kind/width cohort; offset ordering ensures no identical occurrence in train and test.
 const list=c.samples.get(k).sort((a,b)=>a.offset-b.offset);
 if(list.length<16)continue;
 const trainRows=list.filter((_,i)=>i%2===0).map(x=>b.subarray(x.offset,x.offset+x.width));
 const rows=list.filter((_,i)=>i%2===1).map(x=>b.subarray(x.offset,x.offset+x.width));
 const m=evaluate(rows,trainRows);console.log(JSON.stringify({event:'XML_DICT_GROUP',key:k,...m}));
 for(const name of ['count','raw_bytes','plain','value','factor','joint'])total[name]+=m[name];
 total.joint_best_without_factor+=Math.min(m.plain,m.value);
 total.joint_best+=Math.min(m.plain,m.value,m.factor,m.joint);
 total.arithmetic_records+=m.joint_counts[2]+m.joint_counts[3];
}
console.log(JSON.stringify({event:'XML_DICT_SUMMARY',...total,seconds:(performance.now()-start)/1000}));
