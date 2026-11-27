// EA11/E003: shared-framing shortest path over authenticated hierarchy spans; decoder needs only archive.
import {encode,decode,writeInteger} from './ea09-codec.mjs';
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

const HM=[73,69,88,72],IM=[73,69,88,49],MAX_PAGE=8192;
function varint(n){if(!Number.isSafeInteger(n)||n<1||n>MAX_PAGE+64)throw Error("length");let a=[];while(n>=128){a.push(n%128+128);n=Math.floor(n/128)}a.push(n);return a}
function join(parts){let out=new Uint8Array(parts.reduce((s,a)=>s+a.length,0)),i=0;for(let a of parts){out.set(a,i);i+=a.length}return out}
function equal(a,b){return a.length===b.length&&!a.some((v,i)=>v!==b[i])}
function recover(row){let n=BigInt("0x"+row.cofactor);for(let f of row.factors){let p=BigInt("0x"+f.p);if(p<2n||!Number.isSafeInteger(f.e)||f.e<1||f.e>row.width*8)throw Error("factor");n*=p**BigInt(f.e)}let a=writeInteger(n,row.width);if(sha256(a)!==row.byte_sha256)throw Error("hash");return a}
function decodePage(a){
 if(a.length<6||!equal(a.slice(0,4),Uint8Array.from(HM))||a.length>MAX_PAGE+64)throw Error("header");let i=4;
 function len(){let n=0,m=1,k=0;while(i<a.length&&k++<3){let b=a[i++];n+=(b&127)*m;if(b<128){if(n<1||n>MAX_PAGE+64||varint(n).length!==k)throw Error("length");return n}m*=128}throw Error("length")}
 let w=len();if(w>MAX_PAGE)throw Error("output cap");let out=new Uint8Array(w),p=0;
 while(p<w){if(i>=a.length)throw Error("truncated");let tag=a[i++],n=len();if(i+n>a.length)throw Error("truncated payload");let b=a.slice(i,i+n);i+=n;if(tag===1)b=decode(join([IM,b]),w-p);else if(tag!==0)throw Error("tag");if(!b.length||p+b.length>w)throw Error("output size");out.set(b,p);p+=b.length}
 if(i!==a.length)throw Error("trailing");return out
}
function record(tag,payload){return join([[tag],varint(payload.length),payload])}
function pageHeader(w){return join([HM,varint(w)])}
function optimize(page,nodes,withArithmetic=true){
 const w=page.length,positions=[...new Set([0,w,...nodes.flatMap(x=>[x.start,x.end])])].sort((a,b)=>a-b),index=new Map(positions.map((x,i)=>[x,i])),edges=new Map();let tried=0,competitive=0;
 if(withArithmetic){for(let x of nodes){let key=x.start+":"+x.end;if(edges.has(key))continue;let data=page.slice(x.start,x.end),a=encode(data),payload=a.slice(4),r=record(1,payload),raw=1+varint(data.length).length+data.length;tried++;if(r.length<raw){competitive++;edges.set(key,r)}else edges.set(key,null)}}
 let dp=Array(positions.length).fill(Infinity),prev=Array(positions.length);dp[0]=0;
 for(let j=1;j<positions.length;j++)for(let i=0;i<j;i++){let n=positions[j]-positions[i],cost=1+varint(n).length+n,key=positions[i]+":"+positions[j],a=edges.get(key),use=!!a&&a.length<cost;if(use)cost=a.length;if(dp[i]+cost<dp[j]){dp[j]=dp[i]+cost;prev[j]={i,a:use?a:null}}}
 let parts=[],arith=0,raw=0;for(let j=positions.length-1;j>0;){let {i,a}=prev[j];if(a){parts.push(a);arith++}else{parts.push(record(0,page.slice(positions[i],positions[j])));raw++}j=i}
 let archive=join([pageHeader(w),...parts.reverse()]);if(archive.length!==pageHeader(w).length+dp.at(-1)||!equal(decodePage(archive),page))throw Error("DP cost or replay");return{archive,tried,competitive,arith,raw,boundaries:positions.length}
}
function experiment(shards){let rows=[],checks=0,rejected=0;
 function verify(page,nodes,id,group){let t=Date.now(),flat=encode(page),raw=join([pageHeader(page.length),record(0,page)]),baseline=optimize(page,nodes,false),opt=optimize(page,nodes,true);for(let a of [raw,baseline.archive,opt.archive]){if(!equal(decodePage(a),page))throw Error("replay");checks++}if(!equal(decode(flat),page))throw Error("flat");checks++;
 function reject(a){try{decodePage(a)}catch{rejected++;return}throw Error("malformed accepted")}
 reject(opt.archive.slice(0,-1));reject(join([opt.archive,[0]]));let bad=opt.archive.slice();bad[0]^=1;reject(bad);
 rows.push({id,group,width:page.length,sha256:sha256(page),flat_bytes:flat.length,shared_raw_bytes:raw.length,partition_raw_bytes:baseline.archive.length,hierarchical_bytes:opt.archive.length,arithmetic_records:opt.arith,raw_records:opt.raw,unique_intervals_tested:opt.tried,competitive_intervals:opt.competitive,boundaries:opt.boundaries,elapsed_ms:Date.now()-t})
 }
 for(let shard of shards){let root=shard.rows.find(r=>r.parent===null),page=recover(root),byId=new Map(shard.rows.map(r=>[r.id,r])),nodes=[];for(let r of shard.rows){let start=r.offset-root.offset,end=start+r.width;if(start<0||end>page.length||r.width<1)throw Error("span");if(sha256(page.slice(start,end))!==r.byte_sha256)throw Error("child hash");if(r.children.length){let p=start;for(let id of r.children){let c=byId.get(id);if(!c||c.parent!==r.id||c.offset-root.offset!==p)throw Error("partition");p+=c.width}if(p!==end)throw Error("coverage")}nodes.push({start,end})}verify(page,nodes,root.id,"enwik9")}
 // Positive control: two structured integer spans with unstructured separator, leading zeros preserved.
 let a=writeInteger(37n**120n+123n,96),b=writeInteger(19n**150n-7n,96),gap=Uint8Array.from({length:37},(_,i)=>(i*73+19)%256),page=join([a,gap,b]);
 verify(page,[{start:0,end:96},{start:96,end:133},{start:133,end:229},{start:0,end:229}],"two-power-segments","synthetic");
 return{checks,rejected,rows}
}

console.log(JSON.stringify(experiment(process.argv.slice(2).map(p=>JSON.parse(readFileSync(p,'utf8')))),null,2));
