// EA11 inventory-derived exact-object experiment; independent decoder uses only IEX1 archive.
import {encode,decode,frame,flat,treeFrom,treeCost,lit,pow,op,header,writeInteger} from './ea09-codec.mjs';
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
function experiment(shards){
 if(sha256(Uint8Array.of(97,98,99))!=="ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"||sha256(new Uint8Array())!=="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")throw Error("hash selftest");
 const stats={},records=[];let verified=0,checks=0,hybridFallbacks=0;
 const bucket=w=>w<=8?"1-8":w<=32?"9-32":w<=128?"33-128":"129-8192";
 for(let shard of shards){
  const groups=new Map();
  for(const row of shard.rows){if(row.width<1||row.width>8192)continue;let k=bucket(row.width);if(!groups.has(k))groups.set(k,[]);groups.get(k).push(row)}
  for(const [k,group] of groups){
   group.sort((a,b)=>a.offset-b.offset||a.width-b.width||a.id.localeCompare(b.id));
   const count=Math.min(8,group.length),selected=Array.from({length:count},(_,i)=>group[Math.floor(i*group.length/count)]);
   for(const row of selected){
    const w=row.width,q=BigInt("0x"+row.cofactor),factors=row.factors.map(f=>({b:BigInt("0x"+f.p),e:f.e}));
    let n=q;for(const f of factors){if(f.b<2n||!Number.isSafeInteger(f.e)||f.e<1||f.e>8*w)throw Error("bad factor");n*=f.b**BigInt(f.e)}
    const input=writeInteger(n,w);if(sha256(input)!==row.byte_sha256)throw Error("object hash "+row.id);verified++;
    const baseline=encode(input);let fact=baseline,combined=baseline,ft=null,ct=null;
    const equal=a=>{let d=decode(a);if(d.length!==w||d.some((x,i)=>x!==input[i]))throw Error("decode mismatch");checks++};
    equal(baseline);
    if(factors.length&&q>0n){
      let terms=factors.map(f=>f.e===1?lit(f.b):pow(lit(f.b),f.e));
      const product=terms.reduce((a,b)=>op(4,a,b));
      ft=q===1n?product:op(4,product,lit(q));
      let qt=lit(q);if(q>1n){let qw=Math.max(1,Math.ceil(q.toString(2).length/8));for(let cand of flat(q,qw)){let t=treeFrom(q,cand);if(treeCost(t)<treeCost(qt))qt=t}}
      ct=q===1n?product:op(4,product,qt);
      function candidate(t){let a=frame(n,w,{mode:5,tree:t,cost:header(w)+treeCost(t)});try{equal(a);return a}catch(e){hybridFallbacks++;return null}}
      let a=candidate(ft),b=candidate(ct);if(a&&a.length<fact.length)fact=a;if(fact.length<combined.length)combined=fact;if(b&&b.length<combined.length)combined=b;
    }
    const r=stats[k]??={count:0,input_bytes:0,baseline_bytes:0,factor_portfolio_bytes:0,hybrid_portfolio_bytes:0,factor_wins:0,hybrid_extra_wins:0,net_wins:0};
    r.count++;r.input_bytes+=w;r.baseline_bytes+=baseline.length;r.factor_portfolio_bytes+=fact.length;r.hybrid_portfolio_bytes+=combined.length;r.factor_wins+=Number(fact.length<baseline.length);r.hybrid_extra_wins+=Number(combined.length<fact.length);r.net_wins+=Number(combined.length<w);stats[k]=r;
    records.push({id:row.id,offset:row.offset,width:w,sha256:row.byte_sha256,baseline_bytes:baseline.length,factor_portfolio_bytes:fact.length,hybrid_portfolio_bytes:combined.length});
   }
  }
 }
 return{verified,checks,hybridFallbacks,stats,records}
}

console.log(JSON.stringify(experiment(process.argv.slice(2).map(p=>JSON.parse(readFileSync(p,'utf8')))),null,2));
