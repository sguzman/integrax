// EA08 prefix algorithm as reusable library; zero input requires exact cost check.
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
if(l===0n)return{status:"needs-exact",survivors:[{b:2,e:1,lower_cost:g(bytes)+1+g(2)+g(1)+1+g(3)+2}],counts:{candidates:1,pruned:0,interval_multiplies:0,cache_hits:0}};
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

export {screen};
