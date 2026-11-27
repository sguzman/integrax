// IntegraX EA09 experimental versioned standalone codec. AI-assisted; not security audited.
const bits=x=>x===0n?0:x.toString(2).length,g=x=>2*bits(BigInt(x))-1,abs=x=>x<0n?-x:x;
const term=(b,e)=>g(b)+g(e),tail=r=>g(bits(abs(r))+1)+bits(abs(r)),header=w=>g(w)+3;
const primes=[2n,3n,5n,7n,11n,13n,17n,19n,23n,29n,31n,37n,41n,43n,47n,53n,59n,61n];
function floor(n,b){if(n<b)return null;let k=bits(n),s=Math.max(0,k-53),e=Math.max(1,Math.floor((Math.log2(Number(n>>BigInt(s)))+s)/Math.log2(Number(b)))),p=b**BigInt(e);while(p>n){p/=b;e--}while(p*b<=n){p*=b;e++}return{b,e,p}}
function single(n,w){let best=null;for(let b=2n;b<=64n;b++){let f=floor(n,b),cap=f?f.e+1:1;for(let lo=1;lo<=cap;lo*=2){let hi=Math.min(lo*2-1,cap),clip=x=>Math.max(lo,Math.min(hi,x));for(let e of new Set([clip(f?.e??0),clip((f?.e??0)+1)])){let r=n-b**BigInt(e),cost=header(w)+term(b,e)+1+tail(r);if(!best||cost<best.cost||cost===best.cost&&abs(r)<abs(best.r))best={mode:1,b,e,r,cost}}}}return best}
function sums(n,w,kind,strict=false){let r=n,terms=[],t=0,best=null,prev=header(w)+w*8;for(let depth=1;depth<=(kind==="signed"?8:16)&&abs(r)>=2n;depth++){let chosen=null,neg=r<0n;for(let b=2n;b<=64n;b++){let f=floor(abs(r),b);let options=kind==="signed"?(f?[f,{b,e:f.e+1,p:f.p*b}]:[{b,e:1,p:b}]):(f?[f]:[]);for(let {e,p} of options){let rem=r+(neg?p:-p);if(abs(rem)>=abs(r))continue;let cost=term(b,e)+(kind==="signed"?1:0)+tail(rem),c={b,e,p,rem,cost};if(!chosen||(kind==="largest"?(p>chosen.p||p===chosen.p&&cost<chosen.cost):(cost<chosen.cost||cost===chosen.cost&&abs(rem)<abs(chosen.rem))))chosen=c}}if(!chosen)break;let signed=kind==="signed",next=header(w)+g(depth)+t+term(chosen.b,chosen.e)+(signed?2:0)+tail(chosen.rem);if(strict&&next>=prev)break;prev=next;terms.push({b:chosen.b,e:chosen.e,neg});t+=term(chosen.b,chosen.e)+(signed?1:0);r=chosen.rem;if(!best||next<best.cost)best={mode:signed?3:2,terms:terms.slice(),r,cost:next}}return best}
function product(n,w,r){let q=n-r;if(q<1n)return null;let terms=[],t=0;for(let b of primes){let e=0;while(q%b===0n){q/=b;e++}if(e){terms.push({b,e});t+=term(b,e)}}if(!terms.length)return null;return{mode:4,terms,q,r,cost:header(w)+g(terms.length)+t+tail(q)+1+tail(r)}}
function offsets(n){let a=new Set([0n]);for(let b of primes){let p=b;while(p<=131072n)p*=b;let r=n%p;a.add(r);if(r)a.add(r-p)}return a}
function select(...a){return a.filter(Boolean).reduce((x,y)=>Math.ceil(y.cost/8)<Math.ceil(x.cost/8)?y:x)}
const bin=(n,w)=>w?n.toString(2).padStart(w,"0"):"",gg=n=>{n=BigInt(n);return "0".repeat(bits(n)-1)+n.toString(2)},mag=n=>gg(bits(abs(n))+1)+bin(abs(n),bits(abs(n)));

const lit=n=>({op:0,n}),pow=(a,e)=>({op:1,a,e}),op=(o,a,b)=>({op:o,a,b});
function treeCost(t){return 3+(t.op===0?tail(t.n):t.op===1?treeCost(t.a)+g(t.e):treeCost(t.a)+treeCost(t.b))}
function treeBits(t){return bin(BigInt(t.op),3)+(t.op===0?mag(t.n):t.op===1?treeBits(t.a)+gg(t.e):treeBits(t.a)+treeBits(t.b))}
function evalTree(t){if(t.op===0)return t.n;if(t.op===1)return evalTree(t.a)**BigInt(t.e);let a=evalTree(t.a),b=evalTree(t.b);return t.op===2?a+b:t.op===3?a-b:a*b}
function offset(t,r){return r===0n?t:op(r>0n?2:3,t,lit(abs(r)))}
function treeFrom(n,c){if(c.mode===0)return lit(n);if(c.mode===1)return offset(pow(lit(c.b),c.e),c.r);let t=null;for(let a of c.terms){let p=pow(lit(a.b),a.e);if(c.mode===4)t=t?op(4,t,p):p;else t=t?op(a.neg?3:2,t,p):a.neg?op(3,lit(0n),p):p}if(c.mode===4&&c.q!==1n)t=op(4,t,lit(c.q));return offset(t,c.r)}
function flat(n,w){return [ {mode:0,cost:header(w)+w*8},single(n,w),sums(n,w,"cost",true),sums(n,w,"cost"),sums(n,w,"largest"),sums(n,w,"signed"),...Array.from(offsets(n),r=>product(n,w,r))].filter(Boolean)}
function integerRoot(n,e){let E=BigInt(e);if(n<2n)return n;let x=1n<<BigInt(Math.ceil(bits(n)/e));for(;;){let y=((E-1n)*x+n/(x**(E-1n)))/E;if(y>=x)break;x=y}while(x**E>n)x--;while((x+1n)**E<=n)x++;return x}
function nested(n,w,inc){let best=inc,roots=0,screened=0,trees=0;
for(let e=2;e<=12;e++){let f=integerRoot(n,e),E=BigInt(e);if(f**E>n||(f+1n)**E<=n)throw Error("root certificate");for(let b of [f,f+1n]){if(b<2n)continue;roots++;let r=n-b**E;let overhead=header(w)+3+g(e)+4+(r===0n?0:3+3+tail(r));if(overhead>best.cost+7){screened++;continue}let bw=Math.ceil(bits(b)/8);let candidates=flat(b,bw).map(c=>treeFrom(b,c));let bt=candidates.reduce((x,y)=>treeCost(y)<treeCost(x)?y:x);let t=offset(pow(bt,e),r);if(evalTree(t)!==n)throw Error("tree reconstruction");trees++;let c={mode:5,tree:t,cost:header(w)+treeCost(t)};best=select(best,c)}}
return{best,roots,screened,trees}}

// EA09 v1: magic "IEX1", gamma byte width, three-bit mode, MSB-first payload and zero padding.
// Encoder limit deliberately bounded until corpus-scale search is ready.
const MAX_ENCODE=8192,MAX_DECODE=1048576,MAGIC=[73,69,88,49];
function readInteger(bytes){let s="";for(let b of bytes)s+=b.toString(16).padStart(2,"0");return s?BigInt("0x"+s):0n}
function writeInteger(n,w){if(n<0n||bits(n)>8*w)throw Error("output range");let s=n.toString(16).padStart(w*2,"0");let a=new Uint8Array(w);for(let i=0;i<w;i++)a[i]=parseInt(s.slice(2*i,2*i+2),16);return a}
function frame(n,w,c){
let s=gg(w)+bin(BigInt(c.mode),3);
if(c.mode===0)s+=bin(n,w*8);
else if(c.mode===1)s+=gg(c.b)+gg(c.e)+(c.r<0n?"1":"0")+mag(c.r);
else if(c.mode===5)s+=treeBits(c.tree);
else{s+=gg(c.terms.length);for(let a of c.terms)s+=(c.mode===3?(a.neg?"1":"0"):"")+gg(a.b)+gg(a.e);if(c.mode===4)s+=mag(c.q);if(c.mode===3||c.mode===4)s+=c.r<0n?"1":"0";s+=mag(c.r)}
if(s.length!==c.cost)throw Error("cost mismatch");s=s.padEnd(Math.ceil(s.length/8)*8,"0");let a=new Uint8Array(4+s.length/8);a.set(MAGIC);for(let i=0;i<s.length/8;i++)a[4+i]=parseInt(s.slice(i*8,i*8+8),2);return a
}
function decode(a,limit=MAX_DECODE){
if(!(a instanceof Uint8Array)||!Number.isSafeInteger(limit)||limit<1||limit>MAX_DECODE||a.length<5||a.length>limit+64||MAGIC.some((b,i)=>a[i]!==b))throw Error("header");
let pos=32,total=a.length*8;
function bit(){if(pos>=total)throw Error("truncated");let x=(a[pos>>3]>>(7-pos%8))&1;pos++;return x}
function integer(k){if(!Number.isSafeInteger(k)||k<0||pos+k>total)throw Error("bit length");let h="",v=0,j=0;for(let i=0;i<k;i++){v=(v<<1)|bit();if(++j===4){h+=v.toString(16);v=0;j=0}}if(j)h+=((v<<(4-j))).toString(16);return h?BigInt("0x"+h)>>BigInt((4-k%4)%4):0n}
function gammaRead(max){let z=0;while(!bit()){if(++z>Math.floor(Math.log2(max)))throw Error("gamma limit")}let v=(1n<<BigInt(z))|integer(z);if(v>BigInt(max))throw Error("gamma range");return Number(v)}
let w=gammaRead(limit),budget=8*w+64,mode=Number(integer(3));
function bounded(n){if(bits(abs(n))>budget)throw Error("intermediate budget");return n}
function mul(a,b){if(a&&b&&bits(abs(a))+bits(abs(b))-1>budget)throw Error("multiply budget");return bounded(a*b)}
function power(a,e){if(a<0n||e<1||e>budget)throw Error("power range");let q=1n;while(e){if(e%2)q=mul(q,a);e=Math.floor(e/2);if(e)a=mul(a,a)}return q}
function magnitude(){let k=gammaRead(budget+1)-1,v=integer(k);if(bits(v)!==k)throw Error("noncanonical magnitude");return v}
function signed(){let neg=bit(),v=magnitude();if(neg&&!v)throw Error("negative zero");return neg?-v:v}
function flatPower(){let b=gammaRead(64),e=gammaRead(budget);if(b<2)throw Error("base");return power(BigInt(b),e)}
let n=0n;
if(mode===0)n=integer(w*8);
else if(mode===1)n=bounded(flatPower()+signed());
else if(mode>=2&&mode<=4){let count=gammaRead(mode===4?18:16);n=mode===4?1n:0n;for(let i=0;i<count;i++){let neg=mode===3&&bit(),q=flatPower();n=mode===4?mul(n,q):bounded(n+(neg?-q:q))}if(mode===4){let q=magnitude();if(!q)throw Error("zero cofactor");n=mul(n,q)}n=bounded(n+(mode===2?magnitude():signed()))}
else if(mode===5){let nodes=0;function readTree(depth=0){if(++nodes>256||depth>64)throw Error("tree budget");let op=Number(integer(3));if(op===0)return magnitude();if(op===1){let a=readTree(depth+1),e=gammaRead(budget);return power(a,e)}if(op>=2&&op<=4){let a=readTree(depth+1),b=readTree(depth+1);return op===2?bounded(a+b):op===3?bounded(a-b):mul(a,b)}throw Error("tree opcode")}n=readTree()}
else throw Error("mode");
if(Math.ceil(pos/8)!==a.length)throw Error("trailing data");while(pos<total)if(bit())throw Error("padding");return writeInteger(n,w)
}
function encode(bytes){if(!(bytes instanceof Uint8Array)||!bytes.length||bytes.length>MAX_ENCODE)throw Error("encoder input limit");let w=bytes.length,n=readInteger(bytes),raw={mode:0,cost:header(w)+w*8};let c=select(...flat(n,w));let best=nested(n,w,c).best;let a=frame(n,w,best);try{let b=decode(a);if(b.length!==w||b.some((v,i)=>v!==bytes[i]))throw Error("verification");return a}catch(e){let a=frame(n,w,raw),b=decode(a);if(b.some((v,i)=>v!==bytes[i]))throw e;return a}}
function fixtures(){let w=1024,seed=0xea090001n,M=(1n<<64n)-1n;function rng(){seed=(seed+0x9e3779b97f4a7c15n)&M;let z=seed;z=((z^(z>>30n))*0xbf58476d1ce4e5b9n)&M;z=((z^(z>>27n))*0x94d049bb133111ebn)&M;return z^(z>>31n)}let n=0n;for(let i=0;i<128;i++)n=(n<<64n)|rng();return [["uniform",writeInteger(n,w)],["repetitive",Uint8Array.from({length:w},(_,i)=>"IntegraX arithmetic codec\n".charCodeAt(i%26))],["near_power",writeInteger(37n**1500n+123n,w)],["positive_sum",writeInteger(37n**1500n+19n**800n+123n,w)],["signed_sum",writeInteger(37n**1500n-19n**800n+123n,w)],["product",writeInteger(3n**1700n*5n**1700n+123n,w)],["nested",writeInteger((37n**500n+19n**250n+123n)**3n-123n,w)],["zeros",new Uint8Array(w)]]}
function selftest(){let rows=[],roundtrips=0,rejected=0;function eq(a,b){return a.length===b.length&&!a.some((v,i)=>v!==b[i])}function rejects(a,limit){try{decode(a,limit)}catch{return rejected++}throw Error("malformed accepted")}
for(let [name,input] of fixtures()){let a=encode(input),b=decode(a);if(!eq(b,input))throw Error("roundtrip");roundtrips++;rows.push({name,input_bytes:input.length,archive_bytes:a.length,archive_hex:a.length<128?Array.from(a,x=>x.toString(16).padStart(2,"0")).join(""):null});rejects(a.slice(0,-1));let x=new Uint8Array(a.length+1);x.set(a);rejects(x);x=a.slice();x[0]^=1;rejects(x);rejects(a,input.length-1)}
for(let w of [1,2,8])for(let n of [0n,1n,2n,(1n<<BigInt(w*8))-1n]){let a=writeInteger(n,w),b=decode(encode(a));if(!eq(a,b))throw Error("boundary");roundtrips++}
let bad=(w,payload)=>{let s=gg(w)+payload;s=s.padEnd(Math.ceil(s.length/8)*8,"0");return Uint8Array.from([...MAGIC,...s.match(/.{8}/g).map(x=>parseInt(x,2))])};
rejects(bad(1,"111"));rejects(bad(1,"001"+gg(2)+gg(1000000000)+"0"+mag(0n)));rejects(bad(1,"101"+"001"+"001"+"000"+mag(2n)+gg(64)+gg(64)));rejects(bad(1,"001"+gg(2)+gg(1)+"1"+mag(0n)));return{roundtrips,rejected,rows}}

export {encode,decode,fixtures,selftest};
