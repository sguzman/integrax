// EA11/E002: exact cost-bucket root search, wide bases in IEX1 tree mode.
import {encode,decode,frame,treeCost,lit,pow,op,header,writeInteger} from './ea09-codec.mjs';
import {readFileSync} from 'node:fs';
function sha256(data){
 const K=[0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
 const H=new Uint32Array([0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19]);
 const buf=new Uint8Array(Math.ceil((data.length+9)/64)*64);buf.set(data);buf[data.length]=128;
 let len=BigInt(data.length)*8n;for(let i=0;i<8;i++){buf[buf.length-1-i]=Number(len&255n);len>>=8n}
 const W=new Uint32Array(64),rr=(x,n)=>(x>>>n)|(x<<(32-n));
 for(let p=0;p<buf.length;p+=64){for(let i=0;i<16;i++){let j=p+4*i;W[i]=(buf[j]<<24)|(buf[j+1]<<16)|(buf[j+2]<<8)|buf[j+3]}for(let i=16;i<64;i++){let x=W[i-15],y=W[i-2];W[i]=(W[i-16]+(rr(x,7)^rr(x,18)^(x>>>3))+W[i-7]+(rr(y,17)^rr(y,19)^(y>>>10)))>>>0}
 let [a,b,c,d,e,f,g,h]=H;for(let i=0;i<64;i++){let t1=(h+(rr(e,6)^rr(e,11)^rr(e,25))+((e&f)^(~e&g))+K[i]+W[i])>>>0,t2=((rr(a,2)^rr(a,13)^rr(a,22))+((a&b)^(a&c)^(b&c)))>>>0;h=g;g=f;f=e;e=(d+t1)>>>0;d=c;c=b;b=a;a=(t1+t2)>>>0}
 [a,b,c,d,e,f,g,h].forEach((v,i)=>H[i]=(H[i]+v)>>>0)}
 return Array.from(H,x=>x.toString(16).padStart(8,"0")).join("")
}

function widePower(n,w,baseMax=65536,incBytes=w+Math.ceil((header(w))/8)+4){
 const B=BigInt(baseMax),P=80, k=n===0n?0:n.toString(2).length,shiftN=Math.max(0,k-P),tl=n>>BigInt(shiftN),t={l:tl,h:tl+(shiftN?1n:0n),s:shiftN};
 const bit=x=>x?x.toString(2).length:0,gam=x=>2*bit(BigInt(x))-1,magCost=x=>gam(bit(x)+1)+bit(x);
 const reduce=(l,h,s)=>{let d=Math.max(0,bit(h)-P);return d?{l:l>>BigInt(d),h:((h-1n)>>BigInt(d))+1n,s:s+d}:{l,h,s}};
 function align(a,s){let d=s-a.s;if(!d)return a;if(d>=bit(a.h))return{l:0n,h:a.h?1n:0n,s};return{l:a.l>>BigInt(d),h:a.h?((a.h-1n)>>BigInt(d))+1n:0n,s}}
 function dist(a,b){let s=Math.max(a.s,b.s);a=align(a,s);b=align(b,s);let d=a.l>b.h?a.l-b.h:b.l>a.h?b.l-a.h:0n;return d?bit(d)+s:0}
 function cmp(a,b){let s=Math.max(a.s,b.s);a=align(a,s);b=align(b,s);return a.h<b.l?-1:a.l>b.h?1:0}
 let counts={exponents:0,range_pruned:0,root_probes:0,root_exact:0,candidates:0,pruned:0,exact:0,interval_multiplies:0},best=null,limit=incBytes;
 function interval(b,e){let a={l:1n,h:1n,s:0},q={l:b,h:b,s:0};function mul(x,y){counts.interval_multiplies++;return reduce(x.l*y.l,x.h*y.h,x.s+y.s)}while(e){if(e%2)a=mul(a,q);e=Math.floor(e/2);if(e)q=mul(q,q)}return a}
 const cost=(b,e,d)=>header(w)+6+magCost(b)+gam(e)+(d?6+gam(d+1)+d:0);
 for(let e=1;e<=Math.ceil((8*w+1)/6)+1;e++){
  counts.exponents++;let min=interval(65n,e),max=interval(B,e);
  // Enclose every power of this exponent in a single interval before root work.
  let s=Math.max(min.s,max.s),a=align(min,s),z=align(max,s),d=dist(t,{l:a.l,h:z.h,s});
  if(4+Math.ceil(cost(65n,e,d)/8)>=limit){counts.range_pruned++;continue}
  let lo=64n,hi=B+1n;
  while(hi-lo>1n){let m=(hi+lo)>>1n,c=cmp(interval(m,e),t);counts.root_probes++;if(!c){counts.root_exact++;let q=m**BigInt(e);c=q<n?-1:q>n?1:0}if(c<=0)lo=m;else hi=m}
  for(let l=64n;l<=B;l*=2n){let a=l<65n?65n:l,z=(l*2n-1n)<B?l*2n-1n:B;if(a>z)continue;let clip=x=>x<a?a:x>z?z:x;
   for(let b of new Set([clip(lo),clip(lo+1n)])){counts.candidates++;let d=dist(t,interval(b,e));if(4+Math.ceil(cost(b,e,d)/8)>=limit){counts.pruned++;continue}counts.exact++;let q=b**BigInt(e),r=n-q,tree=pow(lit(b),e);if(r)tree=op(r>0n?2:3,tree,lit(r>0n?r:-r));let c=header(w)+treeCost(tree),size=4+Math.ceil(c/8);if(size<limit){limit=size;best={mode:5,tree,cost:c,b:b.toString(),e,residual_bits:bit(r<0n?-r:r)}}}
  }
 }
 return{best,bytes:limit,counts}
}
function experiment(shards){
 let rows=[],checks=0,oracleChecks=0;
 // Compare strict size improvement against exhaustive wide-base enumeration on small objects.
 for(let n of [0n,1n,65n**3n,251n**5n+7n,123456789012345n,2n**63n-1n]){
  let w=8,raw=4+Math.ceil((header(w)+8*w)/8),best=raw;
  for(let b=65n;b<=256n;b++)for(let e=1,p=b;e<=Math.ceil((8*w+1)/6)+1;e++,p*=b){let r=n-p,t=pow(lit(b),e);if(r)t=op(r>0n?2:3,t,lit(r>0n?r:-r));best=Math.min(best,4+Math.ceil((header(w)+treeCost(t))/8))}
  if(widePower(n,w,256,raw).bytes!==best)throw Error("wide oracle mismatch");oracleChecks++
 }
 function test(n,w,group,id,hash){let input=writeInteger(n,w);if(hash&&sha256(input)!==hash)throw Error("hash");let a=encode(input),t=Date.now(),r=widePower(n,w,65536,a.length),elapsed=Date.now()-t;let b=r.best?frame(n,w,r.best):a;for(let archive of [a,b]){let out=decode(archive);if(out.length!==input.length||out.some((v,i)=>v!==input[i]))throw Error("decode");checks++}rows.push({group,id,width:w,input_sha256:sha256(input),baseline_bytes:a.length,wide_bytes:b.length,elapsed_ms:elapsed,winner:r.best?{base:r.best.b,exponent:r.best.e,residual_bits:r.best.residual_bits}:null,...r.counts})}
 for(let shard of shards){let pool=shard.rows.filter(r=>r.width>=129&&r.width<=8192).sort((a,b)=>b.width-a.width||a.id.localeCompare(b.id));for(let row of pool.slice(0,4)){let n=BigInt("0x"+row.cofactor);for(let f of row.factors)n*=BigInt("0x"+f.p)**BigInt(f.e);test(n,row.width,"real",row.id,row.byte_sha256)}}
 for(let b of [251n,1021n,4093n,65521n]){let e=Math.floor(1020/Math.log2(Number(b))),n=b**BigInt(e)+123n;test(n,128,"wide_near_power",b.toString(),null)}
 return{oracleChecks,checks,rows}
}

console.log(JSON.stringify(experiment(process.argv.slice(2).map(p=>JSON.parse(readFileSync(p,'utf8')))),null,2));
