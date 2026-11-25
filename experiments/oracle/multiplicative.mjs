// IXM1 bounded prime-power multiplier reference, no dependencies.
function api(){
const primes=[2,3,5,7,11,13,17,19,23,29,31];
function mag(n){if(n<0n)throw Error("negative");let s=n.toString(16);if(s.length%2)s="0"+s;return Uint8Array.from(s.match(/../g),h=>parseInt(h,16))}
function num(x){let n=0n;for(const a of x)n=(n<<8n)|BigInt(a);return n}
function width(n){return n===0n?1:Math.ceil(n.toString(2).length/8)}
function v(n){const a=[];do{const z=n%128;n=Math.floor(n/128);a.push(z+(n?128:0))}while(n);return a}
function read(a,c){let n=0,m=1;for(let i=0;i<5;i++){if(c.i>=a.length)throw Error("truncation");const z=a[c.i++];n+=(z&127)*m;if(z<128){if(i&&z===0)throw Error("noncanonical");return n}m*=128}throw Error("varint")}
function val(n,p,cap){if(n%p!==0n)return 0;let lo=1,hi=2;while(hi<=cap&&n%p**BigInt(hi)===0n){lo=hi;hi*=2}hi=Math.min(hi,cap);while(lo<hi){let m=Math.floor((lo+hi+1)/2);if(n%p**BigInt(m)===0n)lo=m;else hi=m-1}return lo}
function encode(x){if(x.length>16384)throw Error("cap");const n=num(x),head=[73,88,77,49,...v(x.length)];let best=Uint8Array.from([...head,0,...x]),choice=null;
for(let r=-8;r<=8;r++){let z=n-BigInt(r);if(z<=0n)continue;for(let i=0;i<primes.length;i++){const p=BigInt(primes[i]),e=val(z,p,8*x.length+4);if(!e)continue;const es=[e];for(const edge of [127,16383])if(edge<e)es.push(edge);for(const k of es){const q=z/p**BigInt(k);const size=head.length+1+1+1+v(k).length+width(q);if(size<best.length){best=Uint8Array.from([...head,1,i,r+8,...v(k),...mag(q)]);choice={p:primes[i],e:k,residual:r,quotient_bytes:width(q)};}}}}
return {archive:best,choice}}
function decode(a){if(a.length<6||[73,88,77,49].some((x,i)=>a[i]!==x))throw Error("magic");const c={i:4},len=read(a,c);if(len>16384||c.i>=a.length)throw Error("length");const mode=a[c.i++];if(mode===0){if(a.length-c.i!==len)throw Error("raw");return a.slice(c.i)}if(mode!==1||c.i+2>=a.length)throw Error("mode");const i=a[c.i++],r=a[c.i++]-8,e=read(a,c);if(i>=primes.length||r < -8||r>8||e===0||e>8*len+4||c.i>=a.length||a[c.i]===0||a.length-c.i>len+1)throw Error("operands");const q=num(a.slice(c.i)),n=q*BigInt(primes[i])**BigInt(e)+BigInt(r);if(n<0n||n>=1n<<BigInt(8*len))throw Error("range");return fixed(n,len)}
function fixed(n,len){if(n===0n)return new Uint8Array(len);const m=mag(n);if(m.length>len)throw Error("overflow");const out=new Uint8Array(len);out.set(m,len-m.length);return out}
function random(l,seed){let s=seed>>>0;const x=new Uint8Array(l);for(let i=0;i<l;i++){s^=s<<13;s^=s>>>17;s^=s<<5;x[i]=s&255}return x}
function equal(a,b){return a.length===b.length&&a.every((x,i)=>x===b[i])}
function fixture(len,kind){const seed=0x9e3779b9+len,q=num(random(Math.floor(len/2),seed))|1n,e=Math.floor(len*4/Math.log2(3))-4;switch(kind){case"random":return random(len,seed);case"power_two":return fixed(q*2n**BigInt(len*4),len);case"power_three":return fixed(q*3n**BigInt(e),len);case"near_three":return fixed(q*3n**BigInt(e)-7n,len);case"periodic":return Uint8Array.from({length:len},(_,i)=>"Arithmetic structure is not free information. ".charCodeAt(i%46)||32);}}
function experiment(){const rows=[];for(const len of [64,256,1024,4096])for(const kind of ["random","power_two","power_three","near_three","periodic"]){const x=fixture(len,kind),e=encode(x);if(!equal(x,decode(e.archive)))throw Error("roundtrip");rows.push({kind,bytes:len,archive_bytes:e.archive.length,choice:e.choice,byte_equal:true});}
let exhaustive=0;for(let n=0;n<512;n++){const x=fixed(BigInt(n),2),a=encode(x).archive;if(!equal(x,decode(a)))throw Error("small roundtrip");exhaustive++}
for(const x of [new Uint8Array(0),new Uint8Array(16),Uint8Array.from([0,0,255])])if(!equal(x,decode(encode(x).archive)))throw Error("edge");
let malformed=0;const a=encode(fixture(64,"near_three")).archive;for(let n=0;n<a.length;n++){let accepted=false;try{decode(a.slice(0,n));accepted=true}catch{}if(!accepted)malformed++} // truncation of quotient can yield another valid number; count observed rejects, do not require all.
return {rows,exhaustive,edge_cases:3,truncated_prefix_rejections:malformed,truncated_prefix_tests:a.length};
}
return {encode,decode,experiment,fixture};
}
export const {encode,decode,experiment,fixture}=api();
