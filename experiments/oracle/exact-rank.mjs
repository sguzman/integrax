// Bounded exact multinomial rank oracle; no dependencies.
function study(){
const sizes=[64,256,1024,4096];
function hist(x){const h=new Array(256).fill(0);for(const v of x)h[v]++;return h}
function multinomial(h){let m=1n,k=0n;for(const n of h)for(let j=1n;j<=BigInt(n);j++){k++;m=m*k/j;}return m}
function width(m){return m<=1n?0:Math.ceil((m-1n).toString(2).length/8)}
function rank(x,h){h=h.slice();let m=multinomial(h),r=0n,l=BigInt(x.length);for(const v of x){let p=0;for(let i=0;i<v;i++)p+=h[i];r+=m*BigInt(p)/l;m=m*BigInt(h[v])/l;h[v]--;l--;}return r}
function unrank(r,h){h=h.slice();let m=multinomial(h),l=h.reduce((s,x)=>s+x,0),out=new Uint8Array(l);if(r<0n||r>=m)throw Error("rank range");for(let i=0;i<out.length;i++){const n=BigInt(l);let hit=false;for(let v=0;v<256;v++){if(!h[v])continue;const z=m*BigInt(h[v])/n;if(r<z){out[i]=v;m=z;h[v]--;l--;hit=true;break}r-=z}if(!hit)throw Error("unrank failed")}return out}
function varint(n,a){do{const q=n%128;n=Math.floor(n/128);a.push(q+(n?128:0))}while(n)}
function readVar(a,c){let n=0,m=1;for(let i=0;i<5;i++){if(c.i>=a.length)throw Error("truncated");const x=a[c.i++];n+=(x&127)*m;if(!(x&128)){if(i&&x===0)throw Error("noncanonical");return n}m*=128}throw Error("overflow")}
function encode(x){if(x.length>4096)throw Error("reference cap");const h=hist(x),m=multinomial(h),w=width(m),a=[73,88,82,49];varint(x.length,a);varint(h.filter(n=>n>0).length,a);for(let i=0;i<256;i++)if(h[i]){a.push(i);varint(h[i],a)}const metadata=a.length,r=rank(x,h);for(let i=w-1;i>=0;i--)a.push(Number((r>>BigInt(i*8))&255n));return {a:Uint8Array.from(a),metadata,rank_bytes:w,alphabet:h.filter(n=>n>0).length}}
function decode(a){if(a.length<6||a[0]!==73||a[1]!==88||a[2]!==82||a[3]!==49)throw Error("magic");const c={i:4},l=readVar(a,c),k=readVar(a,c);if(l>4096||k>256)throw Error("cap");const h=new Array(256).fill(0);let prev=-1,sum=0;for(let i=0;i<k;i++){if(c.i>=a.length)throw Error("truncated symbol");const v=a[c.i++],n=readVar(a,c);if(v<=prev||n===0||n>l-sum)throw Error("histogram");prev=v;h[v]=n;sum+=n}if(sum!==l)throw Error("length");const m=multinomial(h),w=width(m);if(a.length-c.i!==w)throw Error("rank length");let r=0n;for(;c.i<a.length;c.i++)r=(r<<8n)|BigInt(a[c.i]);return unrank(r,h)}
function eq(a,b){return a.length===b.length&&a.every((v,i)=>v===b[i])}
let exhaustive=0;for(let l=0;l<=7;l++){const byHist=new Map();for(let n=0;n<3**l;n++){let z=n;const x=new Uint8Array(l);for(let i=l-1;i>=0;i--){x[i]=z%3;z=Math.floor(z/3)}const h=hist(x),key=h.slice(0,3).join(","),r=rank(x,h);if(!byHist.has(key))byHist.set(key,new Set());const rs=byHist.get(key);if(rs.has(r.toString())||!eq(decode(encode(x).a),x))throw Error("bijection");rs.add(r.toString());exhaustive++}for(const [key,rs] of byHist){const h=key.split(",").map(Number);if(BigInt(rs.size)!==multinomial(h))throw Error("coverage")}}
const rows=[];const phrase="Arithmetic descriptions must count every bit of side information. ";
for(const l of sizes){let s=0x12345678;const rand=new Uint8Array(l);for(let i=0;i<l;i++){s^=s<<13;s^=s>>>17;s^=s<<5;rand[i]=s&255}for(const [kind,x] of [["random",rand],["binary",rand.map(v=>v&1)],["skewed",rand.map(v=>v<240?0:v)],["repeated_text",Uint8Array.from({length:l},(_,i)=>phrase.charCodeAt(i%phrase.length))],["constant",new Uint8Array(l)]]){const e=encode(x);if(!eq(x,decode(e.a)))throw Error("roundtrip");rows.push({kind,bytes:l,archive_bytes:e.a.length,header_bytes:e.metadata,rank_bytes:e.rank_bytes,alphabet:e.alphabet,byte_equal:true})}}
let malformed=0;const a=encode(Uint8Array.from([0,1,1,2,2,2])).a;for(let i=0;i<a.length;i++){let rejected=false;try{decode(a.slice(0,i))}catch{rejected=true}if(!rejected)throw Error("truncation accepted");malformed++}let rejected=false;try{decode(Uint8Array.from([...a,0]))}catch{rejected=true}if(!rejected)throw Error("trailing accepted");malformed++;
return {exhaustive,malformed,rows}
}
console.log(JSON.stringify(study(),null,2));
