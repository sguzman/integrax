// IXR2 exact continued-fraction rational residual reference.
function rational(){
const cap=16384, maxDenBits=1024, maxSteps=1024;
function varint(n){const a=[];do{const x=n%128;n=Math.floor(n/128);a.push(x+(n?128:0))}while(n);return a}
function read(a,c){let n=0,m=1;for(let i=0;i<5;i++){if(c.i>=a.length)throw Error("truncated");const z=a[c.i++];n+=(z&127)*m;if(z<128){if(i&&z===0)throw Error("noncanonical");return n}m*=128}throw Error("overflow")}
function num(x){let n=0n;for(const a of x)n=(n<<8n)|BigInt(a);return n}
function mag(n){if(n<0n)throw Error("negative");let h=n.toString(16);if(h.length%2)h="0"+h;return Uint8Array.from(h.match(/../g),x=>parseInt(x,16))}
function width(n){return Math.max(1,Math.ceil(n.toString(2).length/8))}
function gcd(a,b){while(b){[a,b]=[b,a%b]}return a}
function fixed(n,l){if(n===0n)return new Uint8Array(l);const b=mag(n);if(b.length>l)throw Error("overflow");const x=new Uint8Array(l);x.set(b,l-b.length);return x}
function convergents(n,s){let a=n,b=s,p0=0n,p1=1n,q0=1n,q1=0n;const out=[];for(let i=0;i<maxSteps&&b;i++){const k=a/b,r=a%b,p=k*p1+p0,q=k*q1+q0;if(q.toString(2).length>maxDenBits)break;out.push({p,q});[a,b]=[b,r];[p0,p1]=[p1,p];[q0,q1]=[q1,q]}return out}
function encode(x){const l=x.length;if(l>cap)throw Error("cap");const n=num(x),s=1n<<BigInt(8*l),head=[73,88,82,50,...varint(l)];let best=Uint8Array.from([...head,0,...x]),choice=null;
const cs=convergents(n,s);cs.push({p:1n,q:1n});for(const {p,q} of cs){const approx=s*p/q,r=n-approx,sign=r<0n?1:0,z=r<0n?-r:r;
const a=width(p),b=width(q),c=width(z),size=head.length+1+varint(a).length+a+varint(b).length+b+1+c;
if(size<best.length){best=Uint8Array.from([...head,1,...varint(a),...mag(p),...varint(b),...mag(q),sign,...mag(z)]);choice={numerator:p.toString(),denominator:q.toString(),residual:r.toString(),numerator_bytes:a,denominator_bytes:b,residual_bytes:c}}}
return {archive:best,choice,candidates:cs.length}}
function readMag(a,c){const l=read(a,c);if(l===0||l>a.length-c.i||l>129||(l>1&&a[c.i]===0))throw Error("magnitude");const n=num(a.slice(c.i,c.i+l));c.i+=l;return n}
function decode(a){if(a.length<6||[73,88,82,50].some((x,i)=>a[i]!==x))throw Error("magic");const c={i:4},l=read(a,c);if(l>cap||c.i>=a.length)throw Error("length");const m=a[c.i++];if(m===0){if(a.length-c.i!==l)throw Error("raw length");return a.slice(c.i)}if(m!==1)throw Error("mode");const p=readMag(a,c),q=readMag(a,c);if(q===0n||p>q||q.toString(2).length>maxDenBits||gcd(p,q)!==1n||c.i>=a.length)throw Error("fraction");const sign=a[c.i++];if(sign>1||c.i>=a.length||(a.length-c.i>1&&a[c.i]===0)||a.length-c.i>l+1)throw Error("residual");const z=num(a.slice(c.i));if(sign&&z===0n)throw Error("negative zero");const s=1n<<BigInt(8*l),n=s*p/q+(sign?-z:z);if(n<0n||n>=s)throw Error("range");return fixed(n,l)}
function rng(l,seed){let s=seed>>>0;const x=new Uint8Array(l);for(let i=0;i<l;i++){s^=s<<13;s^=s>>>17;s^=s<<5;x[i]=s&255}return x}
function fixture(l,kind){const s=1n<<BigInt(8*l),q=(1n<<127n)-1n,p=num(rng(15,0x6a09e667+l))|1n;switch(kind){case"random":return rng(l,0x6a09e667+l);case"third":return fixed(s/3n,l);case"fraction":return fixed(s*1234567n/982451653n,l);case"large_rational":return fixed(s*p/q,l);case"near_rational":return fixed(s*p/q-1234567n,l);case"repeated_text":return Uint8Array.from({length:l},(_,i)=>"Integrax studies exact arithmetic descriptions. ".charCodeAt(i%47)||32);}}
function eq(a,b){return a.length===b.length&&a.every((x,i)=>x===b[i])}
function experiment(){const rows=[];for(const l of [64,256,1024,4096])for(const kind of ["random","third","fraction","large_rational","near_rational","repeated_text"]){const x=fixture(l,kind),e=encode(x);if(!eq(x,decode(e.archive)))throw Error("roundtrip");rows.push({kind,bytes:l,archive_bytes:e.archive.length,choice:e.choice,candidates:e.candidates,byte_equal:true})}
let small=0,pairs=0;for(let n=0;n<1024;n++){const x=fixed(BigInt(n),2),e=encode(x);if(!eq(x,decode(e.archive)))throw Error("small");const cs=convergents(BigInt(n),65536n);for(let i=0;i<cs.length;i++){const {p,q}=cs[i];if(gcd(p,q)!==1n)throw Error("not reduced");if(i){const u=cs[i-1],d=p*u.q-u.p*q;if(d!==1n&&d!==-1n)throw Error("determinant");let z=BigInt(n)*u.q-65536n*u.p;if(z<0n)z=-z;if(z*q>65536n)throw Error("approximation bound");pairs++}}const last=cs.at(-1);if(last.p*65536n!==BigInt(n)*last.q)throw Error("inexact final convergent");small++}
for(const x of [new Uint8Array(0),new Uint8Array(32),new Uint8Array(32).fill(255),Uint8Array.from([0,0,255])])if(!eq(x,decode(encode(x).archive)))throw Error("edge");
return {rows,small_roundtrips:small,adjacent_convergent_checks:pairs,edge_cases:4}}
return {experiment,encode,decode,fixture,convergents}
}
export const {experiment,encode,decode,fixture,convergents}=rational();
