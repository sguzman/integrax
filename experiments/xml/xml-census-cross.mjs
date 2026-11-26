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
  if(bin===2||bin===3){
   const k=key+'|'+bin;let list=samples.get(k);if(!list){list=[];samples.set(k,list)}
   const count=st.buckets[bin],j=count<=8?count-1:mix(count+bin*1234567)%count;
   if(j<8)list[j]={path,kind,offset:start,width:n};
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
const fixture=Buffer.from("<r><a x='>'>a&amp;b</a><b/><c><![CDATA[<x>]]></c><d>");
const f=census(fixture);assert.equal(f.profile.complete_elements,3);assert.deepEqual(f.profile.open_tail,['/r','/r/d']);assert.equal(f.stats.get('/r/a|leaf-body').bytes,7);assert(!f.stats.has('/r/c|leaf-body'));
const gcd=(a,b)=>{while(b)[a,b]=[b,a%b];return a};
function pow(a,e,n){let r=1n;while(e){if(e&1n)r=r*a%n;a=a*a%n;e>>=1n}return r}
const small=[];for(let p=2;p<=997;p++)if(!small.some(q=>q*q<=p&&p%q===0))small.push(p);
function probable(n){
 if(n<2n)return false;
 for(const p of small.slice(0,12)){let q=BigInt(p);if(n%q===0n)return n===q}
 let d=n-1n,s=0;while(!(d&1n)){d>>=1n;s++}
 outer:for(const base of [2n,3n,5n,7n,11n,13n,17n,19n,23n,29n,31n,37n]){
  let a=base%n;if(!a)continue;let x=pow(a,d,n);if(x===1n||x===n-1n)continue;
  for(let i=1;i<s;i++){x=x*x%n;if(x===n-1n)continue outer}return false;
 }return true
}
function split(n,budget,terms){
 if(n===1n)return;
 if(probable(n)){terms.push({n,kind:'probable-prime'});return}
 for(let c=1n;c<=4n&&budget.left>0;c++){
  let x=2n,y=2n;const step=z=>(z*z+c)%n;
  for(let i=0;i<4096&&budget.left>0;i++){
   budget.left--;x=step(x);y=step(step(y));const d=gcd(x>y?x-y:y-x,n);
   if(d===n)break;
   if(d>1n){split(d,budget,terms);split(n/d,budget,terms);return}
  }
 }
 terms.push({n,kind:'unfactored'});
}
function termsFor(n){
 const terms=[],budget={left:16384};let q=n;
 for(const p of small){const d=BigInt(p);while(q%d===0n){terms.push({n:d,kind:'proven-small-prime'});q/=d;}}
 split(q,budget,terms);terms.sort((a,b)=>a.n<b.n?-1:a.n>b.n?1:0);
 assert.equal(terms.reduce((p,t)=>p*t.n,1n),n);
 return {terms,steps:16384-budget.left}
}
// Exact self-delimiting payload: count byte, each distinct factor width, BE bytes, exponent byte.
function bytes(n){let h=n.toString(16);return Buffer.from(h.length%2?'0'+h:h,'hex')}
function encode(terms){
 const pairs=[];for(const t of terms){if(pairs.length&&pairs.at(-1).n===t.n)pairs.at(-1).e++;else pairs.push({n:t.n,e:1})}
 return Buffer.concat([Buffer.from([pairs.length]),...pairs.flatMap(({n,e})=>{const b=bytes(n);return [Buffer.from([b.length]),b,Buffer.from([e])]})]);
}
function decode(b,width){
 let p=1,n=1n,prev=1n;assert(b[0]>0);
 for(let i=0;i<b[0];i++){const w=b[p++];assert(w>0&&w<=32&&p+w<b.length);assert(b[p]!==0);const q=BigInt('0x'+b.subarray(p,p+w).toString('hex'));p+=w;assert(q>prev);prev=q;const e=b[p++];assert(e>0);n*=q**BigInt(e)}
 assert.equal(p,b.length);const out=bytes(n);assert(out.length<=width);return Buffer.concat([Buffer.alloc(width-out.length),out])
}
for(const n of [2n**96n,1000003n*1000033n,(1n<<128n)-1n]){const t=termsFor(n);assert.equal(BigInt('0x'+decode(encode(t.terms),32).toString('hex')),n)}
const [file,recordPath]=process.argv.slice(2),old=JSON.parse(readFileSync(recordPath,'utf8')),b=readFileSync(file);
assert.equal(b.length,old.corpus.bytes);assert.equal(createHash('sha256').update(b).digest('hex'),old.corpus.sha256);
const targets=new Map();for(const row of old.factors){if(!targets.has(row.offset))targets.set(row.offset,[]);targets.get(row.offset).push(row)}
const start=performance.now(),c=census(b,targets),elapsed=(performance.now()-start)/1000;
const {scan_seconds,...expected}=old.profile;assert.deepEqual(c.profile,expected);assert.equal(c.stats.size,old.spans.length);
for(const row of old.spans){const {eligible,samples,...st}=row;assert.deepEqual(c.stats.get(row.path+'|'+row.kind),st)}
assert.equal(c.seen.size,old.factors.length);
for(const row of old.factors){
 const n=BigInt('0x'+b.subarray(row.offset,row.offset+row.width).toString('hex'));assert.equal(n,BigInt(row.n));
 if(row.status==='complete'){const factors=row.factors.map(BigInt);assert(factors.every(probable));assert.equal(factors.reduce((a,p)=>a*p,1n),n);}
}
console.log(JSON.stringify({event:'XML_CENSUS_INDEPENDENT',profile:c.profile,span_classes:c.stats.size,prior_factors_checked:c.seen.size,seconds:elapsed}));
let tested=0,unresolved=0,complete_probable=0,wins=0,saved=0,nontrivial=0;
for(const key of [...c.samples.keys()].sort()){
 for(const row of c.samples.get(key)){
  if(tested>=512)break;
  const input=b.subarray(row.offset,row.offset+row.width),n=BigInt('0x'+input.toString('hex'));if(n<2n)continue;
  const {terms,steps}=termsFor(n),payload=encode(terms);assert.deepEqual(decode(payload,row.width),input);
  const unknown=terms.some(t=>t.kind==='unfactored');if(unknown)unresolved++;else complete_probable++;
  if(terms.length>1)nontrivial++;
  if(payload.length<row.width){wins++;saved+=row.width-payload.length}
  tested++;
  console.log(JSON.stringify({event:'XML_LARGE_FACTOR',...row,n:n.toString(),terms:terms.map(t=>({n:t.n.toString(),kind:t.kind})),steps,payload_bytes:payload.length,verified:true}));
 }
}
console.log(JSON.stringify({event:'XML_LARGE_SUMMARY',tested,unresolved,complete_probable,nontrivial,wins,saved}));
