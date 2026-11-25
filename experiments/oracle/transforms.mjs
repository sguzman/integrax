// IXT1 reversible integer/digit differences, bounded oracle.
function transforms(){
const specs=[{id:0,kind:"identity",lag:0,order:0},...["integer","digit","xor"].flatMap((kind,k)=>[1,2,4,8,16,32].map((lag,j)=>({id:1+k*6+j,kind,lag,order:1}))),...["integer","digit","xor"].flatMap((kind,k)=>[1,4,16].map((lag,j)=>({id:19+k*3+j,kind,lag,order:2})))];
function step(x,s,inverse){if(s.kind==="identity")return x.slice();const a=new Uint8Array(x.length);let carry=0;for(let i=x.length-1;i>=0;i--){const delayed=i+s.lag<x.length?(inverse?a:x)[i+s.lag]:0;if(s.kind==="xor"){a[i]=x[i]^delayed;continue}const z=x[i]+(inverse?delayed:-delayed)+(s.kind==="integer"?carry:0);a[i]=z&255;carry=s.kind==="integer"?Math.floor(z/256):0}return a}
function transform(x,s,inverse=false){let a=x;for(let i=0;i<s.order;i++)a=step(a,s,inverse);return s.order?a:a.slice()}
function num(x){let n=0n;for(const b of x)n=(n<<8n)|BigInt(b);return n}
function eq(a,b){return a.length===b.length&&a.every((x,i)=>x===b[i])}
function frame(x,s){let y=transform(x,s);return Uint8Array.from([73,88,84,49,s.id,...y])}
function unframe(a){if(a.length<5||[73,88,84,49].some((x,i)=>x!==a[i])||!specs[a[4]])throw Error("header");return transform(a.slice(5),specs[a[4]],true)}
function entropy(x){let h=new Uint32Array(256);for(const b of x)h[b]++;return x.length?Array.from(h,n=>n?-n*Math.log2(n/x.length):0).reduce((a,b)=>a+b,0)/x.length:0}
function rng(l,seed){let x=seed>>>0;return Uint8Array.from({length:l},()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x&255})}
function experiment(){let cases=0,integerChecks=0;for(let n=0;n<65536;n++){let x=Uint8Array.of(n>>8,n&255);for(const s of specs){let y=transform(x,s);if(!eq(x,transform(y,s,true)))throw Error("inverse");cases++;if(s.kind==="integer"){let p=1n-(256n**BigInt(s.lag)),expected=(BigInt(n)*p**BigInt(s.order))&65535n;if(num(y)!==expected)throw Error("modular identity");integerChecks++}}}let rows=[];for(const len of [64,1024,4096])for(const kind of ["xorshift","constant","ramp","periodic","text"]){let x=kind==="xorshift"?rng(len,123456+len):kind==="constant"?new Uint8Array(len).fill(97):kind==="ramp"?Uint8Array.from({length:len},(_,i)=>i&255):kind==="periodic"?Uint8Array.from({length:len},(_,i)=>[10,20,30,40][i%4]):Uint8Array.from({length:len},(_,i)=>"Arithmetic transformations preserve information. ".charCodeAt(i%49)||32);for(const s of specs){let y=frame(x,s);if(!eq(x,unframe(y)))throw Error("frame");rows.push({kind,bytes:len,transform:s.id,entropy_bits_per_byte:entropy(y.slice(5)),zero_digits:y.slice(5).filter(b=>b===0).length,byte_equal:true})}}
return {specs,exhaustive_roundtrips:cases,integer_identity_checks:integerChecks,synthetic:rows}}
return {specs,transform,frame,unframe,entropy,experiment}
}
export const {specs,transform,frame,unframe,entropy,experiment}=transforms();
