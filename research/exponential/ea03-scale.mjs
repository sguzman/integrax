// Run in pinned Nix Node shell; independent BigInt prototype.
function scale(){
const bits=x=>x===0n?0:x.toString(2).length,g=x=>2*bits(BigInt(x))-1,abs=x=>x<0n?-x:x;
const raw=w=>g(w)+1+8*w;
function reduce(l,h,s,p){let d=Math.max(0,bits(h)-p);if(!d)return{l,h,s};let k=BigInt(d);return{l:l>>k,h:((h-1n)>>k)+1n,s:s+d}}
function power(b,e,p){let a={l:1n,h:1n,s:0},q={l:b,h:b,s:0};let mul=(a,b)=>reduce(a.l*b.l,a.h*b.h,a.s+b.s,p);while(e){if(e%2)a=mul(a,q);e=Math.floor(e/2);if(e)q=mul(q,q)}return a}
function prefix(n,k,p){let s=Math.max(0,k-p),l=n>>BigInt(s);return{l,h:s?l+1n:l,s}}
function shift(i,s){let d=s-i.s;if(!d)return i;if(d>=bits(i.h))return{l:0n,h:1n,s};let k=BigInt(d);return{l:i.l>>k,h:((i.h-1n)>>k)+1n,s}}
function compare(a,b){let s=Math.max(a.s,b.s);a=shift(a,s);b=shift(b,s);return a.h<b.l?-1:a.l>b.h?1:0}
function lower(a,b){let s=Math.max(a.s,b.s);a=shift(a,s);b=shift(b,s);let d=a.l>b.h?a.l-b.h:b.l>a.h?b.l-a.h:0n;return d?bits(d)+s:0}
function search(n,k,w,p){
let t=prefix(n,k,p),best=null,c={candidate_count:0,pruned:0,exact_candidates:0,floor_probes:0,floor_exact:0};
let top=Number(n>>BigInt(Math.max(0,k-53))),log=Math.log2(top)+Math.max(0,k-53);
for(let b=2n;b<=64n;b++){
let e=Math.max(0,Math.floor(log/Math.log2(Number(b))));
function cmp(e){c.floor_probes++;let v=compare(power(b,e,p),t);if(v)return v;c.floor_exact++;let q=b**BigInt(e);return q<n?-1:q>n?1:0}
while(e>0&&cmp(e)>0)e--;while(cmp(e+1)<=0)e++;
let f=e,cap=Math.max(1,f+1);
for(let lo=1;lo<=cap;lo*=2){let hi=Math.min(2*lo-1,cap),clip=x=>Math.max(lo,Math.min(hi,x));for(let e of new Set([clip(f),clip(f+1)])){
c.candidate_count++;let d=lower(t,power(b,e,p)),cost=g(w)+1+g(b)+g(e)+1+g(d+1)+d;
if(cost>Math.min(raw(w),best?.cost??Infinity)){c.pruned++;continue}
c.exact_candidates++;let q=b**BigInt(e),r=abs(n-q);cost=g(w)+1+g(b)+g(e)+1+g(bits(r)+1)+bits(r);
let a={b,e,r,neg:q>n,cost};
if(!best||cost<best.cost||cost===best.cost&&(r<best.r||r===best.r&&(b<best.b||b===best.b&&e<best.e)))best=a;
}}
}
return{best,c}
}
const bin=(x,w)=>w?x.toString(2).padStart(w,"0"):"",gamma=x=>{x=BigInt(x);return "0".repeat(bits(x)-1)+x.toString(2)};
function pack(n,w,c){let use=!!c&&Math.ceil(c.cost/8)<Math.ceil(raw(w)/8);let s=gamma(w)+(use?"1"+gamma(c.b)+gamma(c.e)+(c.neg?"1":"0")+gamma(bits(c.r)+1)+bin(c.r,bits(c.r)):"0"+bin(n,w*8));if(s.length!==(use?c.cost:raw(w)))throw Error("cost");s=s.padEnd(Math.ceil(s.length/8)*8,"0");let a=new Uint8Array(s.length/8);for(let i=0;i<a.length;i++)a[i]=parseInt(s.slice(i*8,i*8+8),2);let t=Array.from(a,x=>x.toString(2).padStart(8,"0")).join(""),i=0;let get=k=>{if(i+k>t.length)throw Error("short");let v=k?BigInt("0b"+t.slice(i,i+k)):0n;i+=k;return v};let gg=()=>{let z=0;while(get(1)===0n)z++;return (1n<<BigInt(z))|get(z)};let width=Number(gg()),v;if(get(1)){let b=gg(),e=gg(),neg=get(1),r=get(Number(gg())-1);v=b**e+(neg?-r:r)}else v=get(width*8);if(width!==w||v!==n||Math.ceil(i/8)!==a.length||get(t.length-i)!==0n)throw Error("roundtrip");return a.length}
let seed=0xea030002n,M=(1n<<64n)-1n;function rng(){seed=(seed+0x9e3779b97f4a7c15n)&M;let z=seed;z=((z^(z>>30n))*0xbf58476d1ce4e5b9n)&M;z=((z^(z>>27n))*0x94d049bb133111ebn)&M;return z^(z>>31n)}
function random(k){let s="";for(let i=0;i<k;i+=64)s+=rng().toString(16).padStart(16,"0");return BigInt("0x"+s)|(1n<<BigInt(k-1))}
let checks=0;
for(let b=2n;b<=64n;b+=3n)for(let e of [3,127,1024])for(let p of [24,48,80,128]){let q=b**BigInt(e),i=power(b,e,p);if((i.l<<BigInt(i.s))>q||(i.h<<BigInt(i.s))<q)throw Error("enclosure");for(let n of [q-1n,q,q+1n,q>>1n,q*2n]){let t=prefix(n,bits(n),p),c=compare(i,t);if(c<0&&q>=n||c>0&&q<=n||lower(i,t)>bits(abs(q-n)))throw Error("bound");checks++}}
let rows=[];
for(let k of [8192,1048576]){
let w=k/8,b=37n,e=Math.floor((k-1)/Math.log2(Number(b))),q=b**BigInt(e),near=q+123456789n;
for(let [group,n] of [["uniform",random(k)],["near_power",near]]){
let nb=bits(n),expected;
for(let p of [24,48,80,128]){
let {best,c}=search(n,nb,w,p),size=pack(n,w,best);let signature=size<Math.ceil(raw(w)/8)?[size,best.b.toString(),best.e,best.r.toString(),best.neg].join(":"):String(size);
if(expected!==undefined&&signature!==expected)throw Error("precision discrepancy");expected=signature;
if(group==="near_power"){let r=123456789n,known=g(w)+1+g(b)+g(e)+1+g(bits(r)+1)+bits(r);if(!best||best.cost>known)throw Error("known witness");}
rows.push({width_bits:k,group,precision:p,packed_bytes:size,original_bytes:w,...c})
}
}}
return{certificate_checks:checks,rows};
}
console.log(JSON.stringify(scale(),null,2));
