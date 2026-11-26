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
function tree(b){
 const root={start:0,end:b.length,children:[]},stack=[root];let p=0;
 function leaf(s,e){if(e>s)stack.at(-1).children.push({start:s,end:e,children:null})}
 while(p<b.length){
  let lt=b.indexOf(60,p);
  if(lt!==p){const e=lt<0?b.length:lt;leaf(p,e);p=e;continue}
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
function archive(b,root,dict,mode){
 const ids=new Map(dict.map((v,i)=>[v.toString('hex'),i]));
 function best(n,force=false){
  const x=b.subarray(n.start,n.end),w=x.length;
  let out=B(t(0),u(w),x);
  const choose=c=>{if(c.length<out.length)out=c};
  if(w<=64&&ids.has(x.toString('hex')))choose(B(t(1),u(ids.get(x.toString('hex')))));
  if(mode>=1&&w>=64){const z=deflateRawSync(x,{level:6});choose(B(t(3),u(w),u(z.length),z))}
  if(mode===2&&w>0&&w<=64){
   // Decimal digit representation is a different radix for exactly the same bytes.
   if(x.every(c=>c>=48&&c<=57)){const z=mag(BigInt(x.toString('ascii')));choose(B(t(4),u(w),u(z.length),z))}
   const n=integer(x);
   if(n>1n)for(let i=0;i<primes.length;i++){const p=primes[i];let q=n,e=0;while(q%p===0n){q/=p;e++}if(e){const z=mag(q);choose(B(t(5),u(w),u(i),u(e),u(z.length),z))}}
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
 return B(Buffer.from('IXT2'),u(b.length),d,best(root,true));
}
function decode(a){
 let at=0,output=0,nodes=0;const counts=Array(6).fill(0);
 const take=n=>{assert(Number.isSafeInteger(n)&&n>=0&&at+n<=a.length);const x=a.subarray(at,at+n);at+=n;return x};
 function get(){let v=0,s=1;for(let i=0;i<4;i++){const b=take(1)[0];v+=(b&127)*s;if(b<128){assert(i===0||b!==0);assert(v<=MAX);return v}s*=128}throw Error('varint')}
 assert.equal(take(4).toString(),'IXT2');const size=get(),nd=get();assert(nd<=128);const dict=[];
 for(let i=0;i<nd;i++){const n=get();assert(n>=2&&n<=64);dict.push(take(n))}
 function leaf(b){output+=b.length;assert(output<=size);return b}
 function node(depth){
  assert(depth<=DEPTH&&++nodes<=size*2+1);const tag=take(1)[0];assert(tag<6);counts[tag]++;
  if(tag===0)return leaf(take(get()));
  if(tag===1){const x=dict[get()];assert(x);return leaf(x)}
  if(tag===2){const n=get();assert(n>0&&n<=size+1);const a=[];for(let i=0;i<n;i++)a.push(node(depth+1));return Buffer.concat(a)}
  const w=get();assert(w>0&&w<=size-output);
  if(tag===3){const z=take(get());const x=inflateRawSync(z,{maxOutputLength:w});assert.equal(x.length,w);return leaf(x)}
  assert(w<=64);
  if(tag===4){const len=get();assert(len<=64);const x=integer(take(len)).toString();assert(x.length<=w);return leaf(Buffer.from(x.padStart(w,'0'),'ascii'))}
  if(tag===5){const p=primes[get()],e=get(),len=get();assert(p&&e>0&&e<=512&&len<=64);return leaf(fixed(p**BigInt(e)*integer(take(len)),w))}
  throw Error('tag')
 }
 const b=node(0);assert.equal(b.length,size);assert.equal(output,size);assert.equal(at,a.length);return {b,counts};
}
function check(b,dict,mode){
 const a=archive(b,tree(b),dict,mode),d=decode(a);
 assert.deepEqual(d.b,b);assert.throws(()=>decode(B(a,t(0))));assert.throws(()=>decode(a.subarray(0,a.length-1)));
 return {archive_bytes:a.length,archive_sha256:sha(a),counts:d.counts,verified:true}
}
const sample=Buffer.from("<page><id>000012345678901234567890</id><t x='>'>hello &amp; goodbye</t><b/></page>\n<page><t>unfinished");
const fs=tree(sample),dict=train(sample,fs);
for(const mode of [0,1,2])check(sample,dict,mode);
// Explicit integer synthesis including leading zero byte and powers.
const l=Buffer.from([0,13,7]),r=Buffer.from([0,153]);
assert.equal(integer(B(l,r)),integer(l)*(256n**BigInt(r.length))+integer(r));
const nums=Buffer.from('<r><id>000012345678901234567890</id><x>'+String.fromCharCode(0)+'</x></r>','latin1');
const z=check(nums,[],2);assert(z.counts[4]>0,'decimal fixture must select arithmetic');
const product=Buffer.concat([Buffer.from('<r>'),fixed(2n**120n*3n,16),Buffer.from('</r>')]);
const p=check(product,[],2);assert(p.counts[5]>0,'factor fixture must select arithmetic');
console.log(JSON.stringify({event:'XML_TREE_FIXTURES',decimal:z,factor:p}));
const full=readFileSync(process.argv[2]);assert.equal(full.length,1000000000);assert.equal(sha(full),'159b85351e5f76e60cbe32e04c677847a9ecba3adc79addab6f4c6c7aa3744bc');
function region(offset){
 const start=full.indexOf('<page>',offset);assert(start>=0);
 const end=full.indexOf('</page>',start+1048576)+7;assert(end>start&&end-start<MAX);
 return {start,end,b:full.subarray(start,end)}
}
const training=region(0),shared=train(training.b,tree(training.b));
let totals={raw:0,gzip:0,deflate:0,structural:0,hybrid:0,arithmetic:0},arithmeticNodes=0;
for(const offset of [100000000,400000000,800000000]){
 const {start,end,b}=region(offset),tm=performance.now(),modes=[0,1,2].map(m=>check(b,shared,m));
 const gz=gzipSync(b,{level:9}),df=deflateRawSync(b,{level:6});
 assert(modes[2].archive_bytes<=modes[1].archive_bytes);
 const result={event:'XML_TREE_REGION',offset,start,end,input_sha256:sha(b),raw:b.length,gzip:gz.length,deflate:df.length,structural:modes[0],hybrid:modes[1],arithmetic:modes[2],seconds:(performance.now()-tm)/1000};
 console.log(JSON.stringify(result));
 totals.raw+=b.length;totals.gzip+=gz.length;totals.deflate+=df.length;totals.structural+=modes[0].archive_bytes;totals.hybrid+=modes[1].archive_bytes;totals.arithmetic+=modes[2].archive_bytes;
 arithmeticNodes+=modes[2].counts[4]+modes[2].counts[5];
}
console.log(JSON.stringify({event:'XML_TREE_SUMMARY',training_start:training.start,training_end:training.end,dictionary_entries:shared.length,...totals,arithmeticNodes}));
