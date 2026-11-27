// Dependency-free prefix-only search prototype; run in pinned Nix Node shell.
function experiment(){
const bits=x=>x===0n?0:x.toString(2).length,g=x=>2*bits(BigInt(x))-1;
function reduce(l,h,s,p){let d=Math.max(0,bits(h)-p);if(!d)return{l,h,s};let k=BigInt(d);return{l:l>>k,h:((h-1n)>>k)+1n,s:s+d}}
function multiply(a,b,p){return reduce(a.l*b.l,a.h*b.h,a.s+b.s,p)}
function shift(a,s){let d=s-a.s;if(!d)return a;if(d>=bits(a.h))return{l:0n,h:1n,s};let k=BigInt(d);return{l:a.l>>k,h:((a.h-1n)>>k)+1n,s}}
function compare(a,b){let s=Math.max(a.s,b.s);a=shift(a,s);b=shift(b,s);return a.h<b.l?-1:a.l>b.h?1:0}
function lower(a,b){let s=Math.max(a.s,b.s);a=shift(a,s);b=shift(b,s);let d=a.l>b.h?a.l-b.h:b.l>a.h?b.l-a.h:0n;return d?bits(d)+s:0}
function screen(prefix,bytes,p=80,cache=true){
if(!Number.isSafeInteger(bytes)||bytes<1||prefix.length<1||prefix.length>bytes||prefix.length>32)throw Error("prefix shape");
let l=0n;for(let v of prefix)l=(l<<8n)|BigInt(v);
let s=(bytes-prefix.length)*8;if(!l&&s)return{status:"unresolved-leading-zero",survivors:[],counts:{}};
let t=reduce(l,l+(s?1n:0n),s,p),k=bits(l)+s,log=Math.log2(Number(l>>BigInt(Math.max(0,bits(l)-53))))+Math.max(0,bits(l)-53)+s;
if(l===0n)return{status:"raw-certified",survivors:[],counts:{candidates:0,pruned:0,interval_multiplies:0,cache_hits:0}};
let counts={candidates:0,pruned:0,interval_multiplies:0,cache_hits:0,bracket_probes:0},survivors=[],raw=g(bytes)+1+8*bytes,cutoff=(Math.ceil(raw/8)-1)*8;
for(let b=2n;b<=64n;b++){
let memo=new Map(),squares=[{l:b,h:b,s:0}];
function mul(a,b){counts.interval_multiplies++;return multiply(a,b,p)}
function power(e){if(cache&&memo.has(e)){counts.cache_hits++;return memo.get(e)}let a={l:1n,h:1n,s:0},q={l:b,h:b,s:0},j=0,z=e;while(z){if(cache){while(j>=squares.length){let x=squares.at(-1);squares.push(mul(x,x))}q=squares[j]}if(z%2)a=mul(a,q);z=Math.floor(z/2);j++;if(z&&!cache)q=mul(q,q)}if(cache)memo.set(e,a);return a}
let guess=Math.max(0,Math.floor(log/Math.log2(Number(b)))),lo=guess,hi=guess,steps=0;
function cmp(e){counts.bracket_probes++;return compare(power(e),t)}
while(lo>0&&cmp(lo)>=0){lo--;if(++steps>128)return{status:"unresolved-bracket",survivors,counts}}
while(cmp(hi)<=0){hi++;if(++steps>128)return{status:"unresolved-bracket",survivors,counts}}
if(hi<1)hi=1;
for(let a=1;a<=hi;a*=2){let z=Math.min(2*a-1,hi),clip=x=>Math.max(a,Math.min(z,x));let set=new Set();for(let e=lo;e<=hi;e++)set.add(clip(e));
for(let e of set){counts.candidates++;let d=lower(t,power(e)),cost=g(bytes)+1+g(b)+g(e)+1+g(d+1)+d;if(cost>cutoff)counts.pruned++;else survivors.push({b:Number(b),e,lower_cost:cost})}}
}
return{status:survivors.length?"needs-exact":"raw-certified",survivors,counts}
}
let seed=0xea080001n,M=(1n<<64n)-1n;function rng(){seed=(seed+0x9e3779b97f4a7c15n)&M;let z=seed;z=((z^(z>>30n))*0xbf58476d1ce4e5b9n)&M;z=((z^(z>>27n))*0x94d049bb133111ebn)&M;return z^(z>>31n)}
function bytesPrefix(n,w){let hex=n.toString(16).padStart(w*2,"0").slice(0,32);return Uint8Array.from(hex.match(/../g).map(x=>parseInt(x,16)))}
function exactCost(n,w,b,e){let r=n-b**BigInt(e);if(r<0n)r=-r;return g(w)+1+g(b)+g(e)+1+g(bits(r)+1)+bits(r)}
function oracle(n,w){let best=g(w)+1+w*8;for(let b=2n;b<=64n;b++){for(let e=1,q=b;;e++,q*=b){let r=n-q;if(r<0n)r=-r;best=Math.min(best,g(w)+1+g(b)+g(e)+1+g(bits(r)+1)+bits(r));if(q>=n)break}}return Math.ceil(best/8)}
let rows=[],checks=0;for(let w of [8,32,128,1024]){let stats={bytes:w,targets:0,raw_certificates:0,unresolved:0,exact_survivors:0,uncached_multiplies:0,cached_multiplies:0,cache_hits:0,elapsed_uncached_ms:0,elapsed_cached_ms:0};for(let j=0;j<8;j++){let n=0n;if(j%2===0){for(let i=0;i<w;i+=8)n=(n<<64n)|rng();n|=1n<<BigInt(w*8-1)}else{let b=3n+rng()%60n,e=Math.floor((w*8-2)/Math.log2(Number(b)));n=b**BigInt(e)+123n}let pref=bytesPrefix(n,w);let start=Date.now(),a=screen(pref,w,80,false);stats.elapsed_uncached_ms+=Date.now()-start;start=Date.now();let c=screen(pref,w,80,true);stats.elapsed_cached_ms+=Date.now()-start;if(a.status!==c.status||JSON.stringify(a.survivors)!==JSON.stringify(c.survivors))throw Error("cache disagreement");let best=Math.ceil((g(w)+1+w*8)/8);for(let {b,e} of c.survivors)best=Math.min(best,Math.ceil(exactCost(n,w,BigInt(b),e)/8));if(best!==oracle(n,w))throw Error("oracle mismatch");checks++;stats.targets++;stats.raw_certificates+=Number(c.status==="raw-certified");stats.unresolved+=Number(c.status.startsWith("unresolved"));stats.exact_survivors+=c.survivors.length;stats.uncached_multiplies+=a.counts.interval_multiplies;stats.cached_multiplies+=c.counts.interval_multiplies;stats.cache_hits+=c.counts.cache_hits}rows.push(stats)}
let virtual=[];for(let bytes of [131072,1000000,1000000000]){let pref=Uint8Array.from({length:16},()=>Number(rng()&255n));pref[0]|=128;let start=Date.now(),a=screen(pref,bytes,80,true);virtual.push({declared_bytes:bytes,prefix_bytes:pref.length,prefix_hex:Array.from(pref,x=>x.toString(16).padStart(2,"0")).join(""),status:a.status,survivors:a.survivors.length,elapsed_ms:Date.now()-start,...a.counts})}
return{checks,rows,virtual,screenSource:screen.toString()};
}
const result=experiment();delete result.screenSource;console.log(JSON.stringify(result,null,2));
