// Independent BigInt benchmark, no dependencies. Execute in Node from the pinned Nix shell.
function experiment(){
 const U=(1n<<128n)-1n,M=(1n<<64n)-1n;
 const bits=n=>n===0n?0:n.toString(2).length, g=n=>2*bits(n)-1, abs=n=>n<0n?-n:n;
 const raw=w=>g(BigInt(w))+1+w*8;
 function score(n,w,b,e,p){let r=abs(n-p);return {b,e,r,neg:p>n,cost:g(BigInt(w))+1+g(b)+g(BigInt(e))+1+g(BigInt(bits(r)+1))+bits(r)}}
 function better(a,b){return !b||a.cost<b.cost||(a.cost===b.cost&&(a.r<b.r||(a.r===b.r&&(a.b<b.b||(a.b===b.b&&a.e<b.e)))))}
 const same=(a,b)=>a.cost===b.cost&&a.r===b.r&&a.b===b.b&&a.e===b.e;
 function exhaustive(n,w,max){let best=null,calls=0;for(let b=2n;b<=max;b++)for(let p=b,e=1;p<=U;p*=b,e++){const c=score(n,w,b,e,p);calls++;if(better(c,best))best=c;if(p>=n)break}return {best,calls}}
 function root(n,e,max){let lo=1n,hi=max+1n;while(hi-lo>1n){const m=(lo+hi)>>1n;if(m**BigInt(e)<=n)lo=m;else hi=m}return lo}
 function search(n,w,max,mode){let best=null,calls=0;for(let e=1;e<=127;e++){const lim=root(U,e,max);if(lim<2n)break;const f=root(n,e,lim);const candidates=new Set();
 const add=(x)=>{if(x>=2n&&x<=lim)candidates.add(x)};
 if(mode==="adjacent"){add(f);add(f+1n);add(2n)}
 else {for(let lo=2n;lo<=lim;lo*=2n){let hi=2n*lo-1n;if(hi>lim)hi=lim;const clip=x=>x<lo?lo:x>hi?hi:x;add(clip(f));add(clip(f+1n))}}
 for(const b of candidates){let p=b**BigInt(e);const c=score(n,w,b,e,p);calls++;if(better(c,best))best=c}
 }return {best,calls}}
 const bin=(x,w)=>w===0?"":x.toString(2).padStart(w,"0"),gamma=x=>"0".repeat(bits(x)-1)+x.toString(2);
 function packed(n,w,c){const use=Math.ceil(c.cost/8)<Math.ceil(raw(w)/8);let s=gamma(BigInt(w))+(use?"1"+gamma(c.b)+gamma(BigInt(c.e))+(c.neg?"1":"0")+gamma(BigInt(bits(c.r)+1))+bin(c.r,bits(c.r)):"0"+bin(n,w*8));if(s.length!==(use?c.cost:raw(w)))throw Error("cost");s=s.padEnd(Math.ceil(s.length/8)*8,"0");const bytes=Uint8Array.from(s.match(/.{8}/g).map(x=>parseInt(x,2)));const t=Array.from(bytes,x=>x.toString(2).padStart(8,"0")).join("");let i=0;const get=k=>{if(i+k>t.length)throw Error("short");let v=k?BigInt("0b"+t.slice(i,i+k)):0n;i+=k;return v};const gg=()=>{let z=0;while(get(1)===0n)z++;return (1n<<BigInt(z))|get(z)};const width=Number(gg());let out;if(get(1)){let b=gg(),e=gg(),sgn=get(1),r=get(Number(gg())-1);out=b**e+(sgn?-r:r)}else out=get(width*8);if(out!==n||width!==w||Math.ceil(i/8)!==bytes.length||get(t.length-i)!==0n)throw Error("roundtrip");return bytes.length}
 let seed=0xea020001n;function rng(){seed=(seed+0x9e3779b97f4a7c15n)&M;let z=seed;z=((z^(z>>30n))*0xbf58476d1ce4e5b9n)&M;z=((z^(z>>27n))*0x94d049bb133111ebn)&M;return z^(z>>31n)}
 const rows=[];
 for(const w of [8,16]){
 const mask=(1n<<BigInt(w*8))-1n,random=[],near=[];
 for(let i=0;i<64;i++){random.push(((rng()<<64n)|rng())&mask);const b=65n+rng()%192n;let p=b;while(p*b<=mask)p*=b;const d=rng()%256n;near.push(p+d<=mask?p+d:p-d)}
 for(const [group,inputs] of [["uniform",random],["new_base_near_power",near]]){
 let row={group,width_bytes:w,count:inputs.length,original_bytes:w*inputs.length,base64_bytes:0,base256_bytes:0,base65536_bytes:0,base64_wins:0,base256_wins:0,base65536_wins:0,oracle_candidates:0,bucket_candidates:0,adjacent_candidates:0,adjacent_rank_misses:0,adjacent_packed_misses:0};
 for(const n of inputs){let old=exhaustive(n,w,64n),oracle=exhaustive(n,w,256n),bucket=search(n,w,256n,"bucket"),adj=search(n,w,256n,"adjacent"),wide=search(n,w,65536n,"bucket");if(!same(oracle.best,bucket.best))throw Error("oracle mismatch");if(wide.best.cost>bucket.best.cost)throw Error("monotonic");const a=packed(n,w,old.best),b=packed(n,w,bucket.best),c=packed(n,w,wide.best),d=packed(n,w,adj.best);row.base64_bytes+=a;row.base256_bytes+=b;row.base65536_bytes+=c;row.base64_wins+=Number(a<w);row.base256_wins+=Number(b<w);row.base65536_wins+=Number(c<w);row.oracle_candidates+=oracle.calls;row.bucket_candidates+=bucket.calls;row.adjacent_candidates+=adj.calls;row.adjacent_rank_misses+=Number(!same(adj.best,bucket.best));row.adjacent_packed_misses+=Number(d>b)}
 rows.push(row)
 }}
 return rows;
}
console.log(JSON.stringify(experiment(),null,2));
