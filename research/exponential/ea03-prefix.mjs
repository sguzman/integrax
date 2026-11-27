// Dependency-free arbitrary-precision prototype; run with Node inside pinned Nix.
function experiment(){
 const bits=x=>x===0n?0:x.toString(2).length, gamma=x=>2*bits(BigInt(x))-1,abs=x=>x<0n?-x:x;
 const raw=w=>gamma(w)+1+w*8, precision=80;
 function normalize(l,h,s){const d=Math.max(0,bits(h)-precision);if(!d)return {l,h,s};const k=BigInt(d),mask=(1n<<k)-1n;return {l:l>>k,h:(h+mask)>>k,s:s+k}}
 function mul(a,b){return normalize(a.l*b.l,a.h*b.h,a.s+b.s)}
 function interval(b,e){let a={l:1n,h:1n,s:0n},p={l:b,h:b,s:0n};while(e){if(e%2)a=mul(a,p);e=Math.floor(e/2);if(e)p=mul(p,p)}return a}
 function cmp(n,i){const q=n>>i.s;if(q<i.l)return 1;if(q>i.h || (q===i.h && (n-(q<<i.s))>0n))return -1;return 0}
 function distanceBits(n,i){const q=n>>i.s;const d=q<i.l?i.l-q-1n:q>i.h?q-i.h:0n;return d===0n?0:bits(d)+Number(i.s)}
 function exact(n,b,e,w){const p=b**BigInt(e),r=abs(n-p);return {b,e,r,negative:p>n,cost:gamma(w)+1+gamma(b)+gamma(e)+1+gamma(bits(r)+1)+bits(r)}}
 const better=(a,b)=>!b||a.cost<b.cost||(a.cost===b.cost&&(a.r<b.r||(a.r===b.r&&(a.b<b.b||(a.b===b.b&&a.e<b.e)))));
 function floor(n,b,screen,counts){
   if(n<b)return 0;
   const k=bits(n),shift=Math.max(0,k-53),top=Number(n>>BigInt(shift));
   let e=Math.max(0,Math.floor((Math.log2(top)+shift)/Math.log2(Number(b))));
   const compare=e=>{counts.floor_probes++;if(screen){const c=cmp(n,interval(b,e));if(c)return c}counts.floor_exact++;const p=b**BigInt(e);return p>n?1:p<n?-1:0};
   while(e>0&&compare(e)>0)e--;while(compare(e+1)<=0)e++;return e;
 }
 function search(n,w,screen){
   let best=null;const counts={floor_probes:0,floor_exact:0,candidates:0,screened:0,exact_candidates:0};
   for(let b=2n;b<=64n;b++){
     const f=floor(n,b,screen,counts),cap=Math.max(1,f+1);
     for(let lo=1;lo<=cap;lo*=2){
       const hi=Math.min(2*lo-1,cap),clip=x=>Math.max(lo,Math.min(hi,x));
       for(const e of new Set([clip(f),clip(f+1)])){
         counts.candidates++;
         if(screen){const d=distanceBits(n,interval(b,e));const lower=gamma(w)+1+gamma(b)+gamma(e)+1+gamma(d+1)+d;const cutoff=Math.min(raw(w),best?.cost??Infinity);if(lower>cutoff){counts.screened++;continue}}
         counts.exact_candidates++;const c=exact(n,b,e,w);if(better(c,best))best=c;
       }
     }
   }return {best,counts}
 }
 const bin=(x,w)=>w===0?"":x.toString(2).padStart(w,"0"),g=x=>{x=BigInt(x);return "0".repeat(bits(x)-1)+x.toString(2)};
 function roundtrip(n,w,c){
   const use=!!c&&Math.ceil(c.cost/8)<Math.ceil(raw(w)/8);
   let s=g(w)+(use?"1"+g(c.b)+g(c.e)+(c.negative?"1":"0")+g(bits(c.r)+1)+bin(c.r,bits(c.r)):"0"+bin(n,w*8));
   if(s.length!==(use?c.cost:raw(w)))throw Error("size");
   s=s.padEnd(Math.ceil(s.length/8)*8,"0");
   const a=Uint8Array.from(s.match(/.{8}/g).map(x=>parseInt(x,2)));
   let t=Array.from(a,x=>x.toString(2).padStart(8,"0")).join(""),i=0;
   const get=k=>{if(i+k>t.length)throw Error("truncation");const v=k?BigInt("0b"+t.slice(i,i+k)):0n;i+=k;return v};
   const gg=()=>{let z=0;while(get(1)===0n)z++;return (1n<<BigInt(z))|get(z)};
   const width=Number(gg());let out;if(get(1)){const b=gg(),e=gg(),sgn=get(1),d=get(Number(gg())-1);out=b**e+(sgn?-d:d)}else out=get(width*8);
   if(out!==n||width!==w||Math.ceil(i/8)!==a.length||get(t.length-i)!==0n)throw Error("roundtrip");
   return {bytes:a.length,use};
 }
 let seed=0xea030001n,M=(1n<<64n)-1n;
 function rng(){seed=(seed+0x9e3779b97f4a7c15n)&M;let z=seed;z=((z^(z>>30n))*0xbf58476d1ce4e5b9n)&M;z=((z^(z>>27n))*0x94d049bb133111ebn)&M;return z^(z>>31n)}
 let checks=0;
 for(let b=2n;b<=64n;b++)for(const e of [1,2,3,7,31,127,1024]){const i=interval(b,e),p=b**BigInt(e);if((i.l<<i.s)>p||(i.h<<i.s)<p)throw Error("interval");for(const n of [p-1n,p,p+1n,p>>1n,p*2n]){const c=cmp(n,i);if(c===1&&p<=n||c===-1&&p>=n||distanceBits(n,i)>bits(abs(p-n)))throw Error("certificate");checks++}}
 const rows=[];
 for(const k of [1024,8192,65536]){
   const w=k/8,mask=(1n<<BigInt(k))-1n,random=[],near=[];
   for(let j=0;j<(k===65536?2:4);j++){
     let n=0n;for(let i=0;i<k;i+=64)n=(n<<64n)|rng();random.push(n|(1n<<BigInt(k-1)));
     const b=3n+rng()%60n;let e=Math.floor((k-1)/Math.log2(Number(b)));let p=b**BigInt(e);while(p>mask)p/=b;const d=rng();near.push(p+d<=mask?p+d:p-d)
   }
   for(const [group,inputs] of [["uniform",random],["near_power",near]]){
     const row={width_bits:k,group,count:inputs.length,input_bytes:w*inputs.length,packed_bytes:0,net_wins:0,exact_oracle_candidates:0,screened_candidates:0,finalist_exact_candidates:0,oracle_floor_exact:0,screen_floor_exact:0,screen_floor_probes:0};
     for(const n of inputs){const o=search(n,w,false),s=search(n,w,true),a=roundtrip(n,w,o.best),b=roundtrip(n,w,s.best);if(a.bytes!==b.bytes||a.use!==b.use||(a.use&&(o.best.cost!==s.best.cost||o.best.b!==s.best.b||o.best.e!==s.best.e||o.best.r!==s.best.r)))throw Error("oracle divergence");
     row.packed_bytes+=b.bytes;row.net_wins+=Number(b.bytes<w);row.exact_oracle_candidates+=o.counts.exact_candidates;row.screened_candidates+=s.counts.screened;row.finalist_exact_candidates+=s.counts.exact_candidates;row.oracle_floor_exact+=o.counts.floor_exact;row.screen_floor_exact+=s.counts.floor_exact;row.screen_floor_probes+=s.counts.floor_probes}
     rows.push(row)
   }
 }return {certificate_checks:checks,rows}
}
console.log(JSON.stringify(experiment(),null,2));
