// IXM2 bounded multi-prime exact cost optimizer.
function multi(){
const primes=[2,3,5,7,11,13,17,19,23,29,31];
function v(n){const a=[];do{const z=n%128;n=Math.floor(n/128);a.push(z+(n?128:0))}while(n);return a}
function read(a,c){let n=0,m=1;for(let i=0;i<5;i++){if(c.i>=a.length)throw Error("truncation");const z=a[c.i++];n+=(z&127)*m;if(z<128){if(i&&z===0)throw Error("noncanonical");return n}m*=128}throw Error("varint")}
function num(x){let n=0n;for(const a of x)n=(n<<8n)|BigInt(a);return n}
function mag(n){let s=n.toString(16);if(s.length%2)s="0"+s;return Uint8Array.from(s.match(/../g),h=>parseInt(h,16))}
function width(n){return Math.max(1,Math.ceil(n.toString(2).length/8))}
function fixed(n,l){if(n===0n)return new Uint8Array(l);const x=mag(n);if(x.length>l)throw Error("overflow");const b=new Uint8Array(l);b.set(x,l-x.length);return b}
function valuation(n,p,cap){if(n%p!==0n)return 0;let lo=1,hi=2;while(hi<=cap&&n%p**BigInt(hi)===0n){lo=hi;hi*=2}hi=Math.min(hi,cap);while(lo<hi){const m=Math.floor((lo+hi+1)/2);if(n%p**BigInt(m)===0n)lo=m;else hi=m-1}return lo}
function states(z,l){let dp=[{d:1n,exps:[]}];for(let i=0;i<primes.length;i++){const p=BigInt(primes[i]),e=valuation(z,p,8*l+4),ks=[0];if(e){ks.push(e);for(const k of [127,16383])if(k<e)ks.push(k)}
const next=[];for(let c=0;c<dp.length;c++){const st=dp[c];if(!st)continue;for(const k of ks){const cost=c+(k?v(k).length:0),d=st.d*(p**BigInt(k));if(!next[cost]||d>next[cost].d)next[cost]={d,exps:[...st.exps,k]}}}dp=next}return dp}
function encode(x){const l=x.length;if(l>16384)throw Error("cap");const n=num(x),h=[73,88,77,50,...v(l)];let best=Uint8Array.from([...h,0,...x]),choice=null;
for(let r=-8;r<=8;r++){const z=n-BigInt(r);if(z<=0n)continue;const dp=states(z,l);for(let c=1;c<dp.length;c++){const s=dp[c];if(!s)continue;const q=z/s.d;const size=h.length+1+1+2+c+width(q);if(size>=best.length)continue;let mask=0,ex=[];for(let i=0;i<s.exps.length;i++)if(s.exps[i]){mask|=1<<i;ex.push(...v(s.exps[i]))}best=Uint8Array.from([...h,1,r+8,mask>>8,mask&255,...ex,...mag(q)]);choice={residual:r,factors:s.exps.map((e,i)=>[primes[i],e]).filter(x=>x[1]),quotient_bytes:width(q)}}}return {archive:best,choice}}
function decode(a){if(a.length<6||[73,88,77,50].some((x,i)=>a[i]!==x))throw Error("magic");const c={i:4},l=read(a,c);if(l>16384||c.i>=a.length)throw Error("length");const mode=a[c.i++];if(mode===0){if(a.length-c.i!==l)throw Error("raw");return a.slice(c.i)}if(mode!==1||c.i+3>=a.length)throw Error("mode");const r=a[c.i++]-8,mask=a[c.i++]*256+a[c.i++];if(r < -8||r>8||mask===0||mask>=1<<primes.length)throw Error("mask");let d=1n;for(let i=0;i<primes.length;i++)if(mask&(1<<i)){const e=read(a,c);if(e<1||e>8*l+4)throw Error("exponent");d*=BigInt(primes[i])**BigInt(e);if(d> (1n<<BigInt(8*l))+8n)throw Error("divisor too large")}if(c.i>=a.length||a[c.i]===0||a.length-c.i>l+1)throw Error("quotient");const n=num(a.slice(c.i))*d+BigInt(r);if(n<0n||n>=1n<<BigInt(8*l))throw Error("range");return fixed(n,l)}
function rng(l,seed){let s=seed>>>0;const x=new Uint8Array(l);for(let i=0;i<l;i++){s^=s<<13;s^=s>>>17;s^=s<<5;x[i]=s&255}return x}
function fixture(l,kind){const q=num(rng(l/4,0x243f6a88+l))|1n;const d=2n**BigInt(2*l-4)*3n**BigInt(Math.floor(2*l/Math.log2(3))-4)*5n**BigInt(Math.floor(2*l/Math.log2(5))-4);switch(kind){case"random":return rng(l,0x243f6a88+l);case"smooth_product":return fixed(q*d,l);case"near_smooth":return fixed(q*d+5n,l);case"single_prime":return fixed((num(rng(l/2,0x243f6a88+l))|1n)*3n**BigInt(Math.floor(4*l/Math.log2(3))-4),l);case"constant":return new Uint8Array(l).fill(65)}}
function equal(a,b){return a.length===b.length&&a.every((x,i)=>x===b[i])}
function experiment(){const rows=[];for(const l of [64,256,1024,4096])for(const kind of ["random","smooth_product","near_smooth","single_prime","constant"]){const x=fixture(l,kind),e=encode(x);if(!equal(x,decode(e.archive)))throw Error("roundtrip");rows.push({kind,bytes:l,archive_bytes:e.archive.length,choice:e.choice,byte_equal:true})}
let brute=0;for(let z=1;z<=1024;z++){const n=BigInt(z),dp=states(n,2),vals=primes.map(p=>valuation(n,BigInt(p),20)),b=[];function enumerate(i,d,c){if(i===primes.length){if(!b[c]||d>b[c])b[c]=d;return}for(let e=0;e<=vals[i];e++)enumerate(i+1,d*BigInt(primes[i])**BigInt(e),c+(e?v(e).length:0))}
enumerate(0,1n,0);for(let c=0;c<Math.max(dp.length,b.length);c++)if(dp[c]?.d!==b[c])throw Error("DP optimum");brute++}
let small=0;for(let n=0;n<512;n++){const x=fixed(BigInt(n),2);if(!equal(x,decode(encode(x).archive)))throw Error("small");small++}
for(const x of [new Uint8Array(0),new Uint8Array(64),Uint8Array.from([0,0,255])])if(!equal(x,decode(encode(x).archive)))throw Error("edge");
return {rows,brute_force_dp_checks:brute,small_roundtrips:small,edge_cases:3}}
return {experiment,encode,decode,fixture}
}
export const {experiment,encode,decode,fixture}=multi();
