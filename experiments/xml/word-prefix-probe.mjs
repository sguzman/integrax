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

const D=4095,TOP=4294967295,HALF=2147483648,Q=1073741824,TQ=3221225472;
function segments(b){
 const a=[];walk(tree(b),n=>{if(n.kind==='article')a.push({start:n.start,end:n.end})});
 const out=[];let p=0;
 for(const n of a){assert(n.start>=p&&n.end>n.start);if(n.start>p)out.push({kind:0,b:b.subarray(p,n.start)});out.push({kind:1,b:b.subarray(n.start,n.end)});p=n.end}
 if(p<b.length)out.push({kind:0,b:b.subarray(p)});
 assert.deepEqual(Buffer.concat(out.map(x=>x.b)),b);return out;
}
function tokens(b){
 const out=[];for(const m of b.toString('latin1').matchAll(/[A-Za-z]+|[0-9]+|[ \t\r\n]+|[^A-Za-z0-9 \t\r\n]+/g)){
  for(let j=0;j<m[0].length;j+=64)out.push(b.subarray(m.index+j,m.index+Math.min(m[0].length,j+64)));
 }
 assert.equal(out.reduce((n,x)=>n+x.length,0),b.length);return out;
}
const key=b=>b.toString('hex');
function training(segs){
 const maps=[new Map(),new Map()];
 for(const s of segs)for(const b of tokens(s.b)){
  const m=maps[s.kind],k=key(b),v=m.get(k);if(v)v.n++;else m.set(k,{b,n:1});
 }
 return maps.map(m=>[...m.values()].filter(v=>v.n>=2).sort((a,b)=>b.n-a.n||Buffer.compare(a.b,b.b)).slice(0,D).map(v=>v.b));
}
function cls(b){const c=b[0];return c>=65&&c<=90||c>=97&&c<=122?0:c>=48&&c<=57?1:[9,10,13,32].includes(c)?2:3}
class Bits{
 constructor(){this.bytes=[];this.n=0;this.v=0}
 put(b){this.v=this.v*2+b;if(++this.n===8){this.bytes.push(this.v);this.n=0;this.v=0}}
 finish(){if(this.n)this.bytes.push(this.v*2**(8-this.n));return Buffer.from(this.bytes)}
}
class Reader{
 constructor(b){this.b=b;this.at=0;this.pad=0}
 bit(virtual=false){if(this.at>=this.b.length*8){assert(virtual&&++this.pad<=32,'rank padding');return 0}const i=this.at++;return (this.b[i>>3]>>(7-(i&7)))&1}
}
class Model{
 constructor(n){this.n=n;this.c=Array.from({length:n},(_,i)=>1+Math.floor(64/(i+1)));this.rebuild()}
 rebuild(){this.f=new Uint32Array(this.n+1);this.total=0;for(let i=0;i<this.n;i++){this.add(i,this.c[i]);this.total+=this.c[i]}}
 add(i,n){for(let k=i+1;k<=this.n;k+=k&-k)this.f[k]+=n}
 prefix(i){let n=0;for(let k=i;k;k-=k&-k)n+=this.f[k];return n}
 find(x){let k=0;for(let step=2**Math.floor(Math.log2(this.n));step>=1;step/=2){const j=k+step;if(j<=this.n&&this.f[j]<=x){x-=this.f[j];k=j}}assert(k<this.n);return k}
 update(i){this.c[i]++;this.add(i,1);this.total++;if(this.total>=16384){this.c=this.c.map(x=>Math.ceil(x/2));this.rebuild()}}
}
// Decoder-synchronized prefix integers. IDs are assigned in first-seen order.
const LIMIT=32768;
class EscapeState{
 constructor(mode,dict){
  this.mode=mode;this.ids=new Map();this.values=[];this.references=0;this.prefixReferences=0;
  if(mode>=3)for(const b of dict)this.learn(b)
 }
 learn(b){
  if(this.mode<3||this.values.length>=LIMIT)return;
  // Mode 3 learns complete words only; mode 4 also learns every prefix of length >=3.
  for(let n=this.mode===3?b.length:3;n<=b.length;n++){
   if(n<3)continue;const p=b.subarray(0,n),k=key(p);
   if(!this.ids.has(k)){this.ids.set(k,this.values.length);this.values.push(p);if(this.values.length===LIMIT)break}
  }
 }
 encode(b){
  let best=B(u(b.length),b),chosen=0;
  if(this.mode>=3)for(let n=this.mode===3?b.length:3;n<=b.length;n++){
   if(n<3)continue;const id=this.ids.get(key(b.subarray(0,n)));if(id===undefined)continue;
   // Prefix length is implicit in ID; suffix width is in the one-byte tag.
   const c=B(t(65+b.length-n),u(id),b.subarray(n));
   if(c.length<best.length){best=c;chosen=n}
  }
  if(chosen){this.references++;if(chosen<b.length)this.prefixReferences++}
  this.learn(b);return best
 }
 decode(e){
  const tag=e.take(1)[0];let b;
  if(tag>=1&&tag<=64)b=e.take(tag);
  else{
   assert(this.mode>=3&&tag>=65&&tag<=129,'escape tag');
   const p=this.values[e.get()],n=tag-65;
   assert(p&&p.length+n<=64,'prefix id or width');
   assert(this.mode!==3||n===0,'exact-only reference');
   b=B(p,e.take(n));
  }
  assert(b.length>=1&&b.length<=64);this.learn(b);return b
 }
}
function encodeStream(ts,dict,mode){
 const lookup=new Map(dict.map((b,i)=>[key(b),i+1])),bits=new Bits(),esc=[],state=new EscapeState(mode,dict);
 const models=Array.from({length:mode>=2?5:1},()=>new Model(dict.length+1));
 const width=Math.ceil(Math.log2(dict.length+1));let context=4,lo=0,hi=TOP,pending=0,escapeCount=0;
 function emit(b){bits.put(b);while(pending){bits.put(1-b);pending--}}
 for(const b of ts){
  const id=lookup.get(key(b))??0;if(!id){esc.push(state.encode(b));escapeCount++}
  if(mode===0){for(let j=width-1;j>=0;j--)bits.put((id>>j)&1)}
  else{
   const m=models[mode>=2?context:0],range=hi-lo+1,base=lo;
   lo=base+Math.floor(range*m.prefix(id)/m.total);hi=base+Math.floor(range*m.prefix(id+1)/m.total)-1;assert(lo<=hi);
   for(;;){if(hi<HALF)emit(0);else if(lo>=HALF){emit(1);lo-=HALF;hi-=HALF}else if(lo>=Q&&hi<TQ){pending++;lo-=Q;hi-=Q}else break;lo*=2;hi=hi*2+1}
   m.update(id);
  }
  context=cls(b);
 }
 if(mode&&ts.length){pending++;emit(lo<Q?0:1)}
 return {ranks:bits.finish(),escape:Buffer.concat(esc),escapeCount,count:ts.length,references:state.references,prefixReferences:state.prefixReferences};
}
function cursor(b){
 let p=0;return {take(n){assert(Number.isSafeInteger(n)&&n>=0&&p+n<=b.length,'truncated');const x=b.subarray(p,p+n);p+=n;return x},get(){let x=0,s=1;for(let i=0;i<4;i++){const c=this.take(1)[0];x+=(c&127)*s;if(c<128){assert(i===0||c!==0);assert(x<=MAX);return x}s*=128}throw Error('varint')},end(){assert.equal(p,b.length,'trailing')}}
}
function decodeStream(count,ranks,escape,dict,mode,maxBytes){
 assert(count<=maxBytes);const rd=new Reader(ranks),e=cursor(escape),state=new EscapeState(mode,dict),width=Math.ceil(Math.log2(dict.length+1));
 const models=Array.from({length:mode>=2?5:1},()=>new Model(dict.length+1));
 let lo=0,hi=TOP,code=0,context=4,bytes=0;const ts=[];
 if(mode&&count)for(let j=0;j<32;j++)code=code*2+rd.bit(true);
 for(let i=0;i<count;i++){
  let id=0;
  if(mode===0){for(let j=0;j<width;j++)id=id*2+rd.bit();assert(id<=dict.length)}
  else{
   const m=models[mode>=2?context:0],range=hi-lo+1,base=lo;assert(code>=lo&&code<=hi);
   const x=Math.floor(((code-lo+1)*m.total-1)/range);id=m.find(x);
   lo=base+Math.floor(range*m.prefix(id)/m.total);hi=base+Math.floor(range*m.prefix(id+1)/m.total)-1;
   for(;;){if(hi<HALF){}else if(lo>=HALF){lo-=HALF;hi-=HALF;code-=HALF}else if(lo>=Q&&hi<TQ){lo-=Q;hi-=Q;code-=Q}else break;lo*=2;hi=hi*2+1;code=code*2+rd.bit(true)}
   m.update(id);
  }
  let b;if(id)b=dict[id-1];else b=state.decode(e);
  assert(b&&b.length);bytes+=b.length;assert(bytes<=maxBytes);ts.push(b);context=cls(b);
 }
 e.end();const check=encodeStream(ts,dict,mode);assert.deepEqual(check.ranks,ranks);assert.deepEqual(check.escape,escape);
 return Buffer.concat(ts);
}
function archive(b,segs,dicts,mode){
 const parts=[Buffer.from('IXW1'),t(mode),u(b.length),u(segs.length)];
 for(const s of segs)parts.push(t(s.kind),u(s.b.length));
 const detail=[];
 for(let k=0;k<2;k++){
  const dict=dicts[k],ts=segs.filter(s=>s.kind===k).flatMap(s=>tokens(s.b)),m=encodeStream(ts,dict,mode);
  const header=Buffer.concat([u(dict.length),...dict.flatMap(b=>[u(b.length),b])]);
  parts.push(header,u(m.count),u(m.ranks.length),m.ranks,u(m.escape.length),m.escape);
  detail.push({kind:k,dict_entries:dict.length,dict_bytes:header.length,tokens:m.count,escapes:m.escapeCount,rank_bytes:m.ranks.length,escape_bytes:m.escape.length,references:m.references,prefix_references:m.prefixReferences});
 }
 return {a:Buffer.concat(parts),detail}
}
function decode(a){
 const c=cursor(a);assert.equal(c.take(4).toString(),'IXW1');const mode=c.take(1)[0];assert(mode<=4);
 const size=c.get(),n=c.get(),segs=[];assert(n<=size);let sum=0,totals=[0,0];
 for(let i=0;i<n;i++){const k=c.take(1)[0],len=c.get();assert(k<=1&&len>0);segs.push({k,len});sum+=len;totals[k]+=len;assert(sum<=size)}
 assert.equal(sum,size);
 const streams=[];
 for(let k=0;k<2;k++){
  const nd=c.get();assert(nd<=D);const dict=[],seen=new Set();
  for(let j=0;j<nd;j++){const w=c.get();assert(w>=1&&w<=64);const b=c.take(w);assert(!seen.has(key(b)));seen.add(key(b));dict.push(b)}
  const count=c.get(),ranks=c.take(c.get()),escape=c.take(c.get());
  const stream=decodeStream(count,ranks,escape,dict,mode,totals[k]);assert.equal(stream.length,totals[k]);streams.push(stream)
 }
 c.end();const pos=[0,0],out=[];
 for(const {k,len} of segs){out.push(streams[k].subarray(pos[k],pos[k]+len));pos[k]+=len}
 assert.deepEqual(pos,totals);return Buffer.concat(out)
}
function check(b,segs,dicts,mode){
 const {a,detail}=archive(b,segs,dicts,mode);assert.deepEqual(decode(a),b);
 assert.throws(()=>decode(B(a,t(0))));assert.throws(()=>decode(a.subarray(0,a.length-1)));
 return {archive_bytes:a.length,archive_sha256:sha(a),streams:detail,verified:true}
}
// Validate Fenwick search against direct cumulative counts and trigger rescaling.
const model=new Model(17);for(let i=0;i<20000;i++){const id=i%17;model.update(id);if(i%101===0){for(let j=0;j<17;j++){assert.equal(model.prefix(j),model.c.slice(0,j).reduce((a,b)=>a+b,0));assert.equal(model.find(model.prefix(j)),j)}}}
for(const b of [Buffer.alloc(0),Buffer.from('<page><text>alpha beta alpha beta\n123 &amp; gamma.</text></page>'),Buffer.from('<text>unfinished \x00 \xff','latin1')]){
 const s=segments(b),d=training(s);for(const mode of [0,1,2,3,4]){check(b,s,d,mode);check(b,s,[[],[]],mode)}
}
const long=Buffer.from('<text>'+('alpha beta alpha gamma! 123. ').repeat(3000)+'</text>'),ls=segments(long),ld=training(ls);for(const mode of [0,1,2,3,4])check(long,ls,ld,mode);
// Direct tests include a known prefix plus a suffix and an exact repeated unknown.
const unknown=['intercontinental','intercontinentalism','intercontinental','intercontinentalist'].map(x=>Buffer.from(x));
const d=[Buffer.from('intercontinentality')];
for(const m of [2,3,4]){
 const z=encodeStream(unknown,d,m);assert.deepEqual(decodeStream(z.count,z.ranks,z.escape,d,m,100),Buffer.concat(unknown));
 if(m===3)assert(z.references>0);
 if(m===4)assert(z.prefixReferences>0);
}
const fixture2=encodeStream(unknown,d,2),fixture4=encodeStream(unknown,d,4);
assert(fixture4.escape.length<fixture2.escape.length);
console.log('PREFIX_RESIDUAL_FIXTURES_PASSED');
const full=readFileSync(process.argv[2]);assert.equal(full.length,1000000000);assert.equal(sha(full),'159b85351e5f76e60cbe32e04c677847a9ecba3adc79addab6f4c6c7aa3744bc');
function region(offset){const start=full.indexOf('<page>',offset);assert(start>=0);const end=full.indexOf('</page>',start+262144)+7;assert(end>start&&end-start<MAX);return {start,end,b:full.subarray(start,end)}}
const tr=region(0),dicts=training(segments(tr.b)),old=JSON.parse(readFileSync('experiments/records/E0100.json','utf8'));
const totals={raw:0,gzip:0,context:0,exact:0,prefix:0,context_escape:0,exact_escape:0,prefix_escape:0};
for(const offset of [100000000,400000000,800000000]){
 const tm=performance.now(),{start,end,b}=region(offset),segs=segments(b),[context,exact,prefix]=[2,3,4].map(m=>check(b,segs,dicts,m));
 const prior=old.rows.find(r=>r.offset===offset);assert.equal(sha(b),prior.input_sha256);assert.equal(context.archive_sha256,prior.context.archive_sha256);
 for(const v of [exact,prefix])for(let k=0;k<2;k++){
  assert.equal(v.streams[k].rank_bytes,context.streams[k].rank_bytes);assert.equal(v.streams[k].escapes,context.streams[k].escapes);
 }
 const gzip=gzipSync(b,{level:9}).length,row={event:'PREFIX_RESIDUAL_REGION',offset,start,end,input_sha256:sha(b),raw:b.length,gzip,context,exact,prefix,seconds:(performance.now()-tm)/1000};
 console.log(JSON.stringify(row));for(const k of ['raw','gzip'])totals[k]+=row[k];
 for(const k of ['context','exact','prefix']){totals[k]+=row[k].archive_bytes;totals[k+'_escape']+=row[k].streams.reduce((n,s)=>n+s.escape_bytes,0)}
}
console.log(JSON.stringify({event:'PREFIX_RESIDUAL_SUMMARY',training_start:tr.start,training_end:tr.end,...totals}));
