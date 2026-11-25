import {mkdtempSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {deepStrictEqual} from 'node:assert';
import {createHash} from 'node:crypto';
function oracle(){
 function bwt(x){if(!x.length)return [0,[]];const n=x.length,o=Array.from({length:n},(_,i)=>i);o.sort((a,b)=>{for(let j=0;j<n;j++){const d=x[(a+j)%n]-x[(b+j)%n];if(d)return d}return a-b});return [o.indexOf(0),o.map(i=>x[(i+n-1)%n])]}
 function inverse(p,l){if(!l.length){if(p)throw Error("primary");return []}if(p<0||p>=l.length)throw Error("primary");const f=l.map((b,i)=>[b,i]).sort((a,b)=>a[0]-b[0]||a[1]-b[1]);let r=p,x=[];for(let i=0;i<l.length;i++){r=f[r][1];x.push(l[r])}return x}
 function mtf(x,inv=false){let a=Array.from({length:256},(_,i)=>i);return x.map(b=>{let p=inv?b:a.indexOf(b),v=a.splice(p,1)[0];a.unshift(v);return inv?v:p})}
 function runs(x){const y=[];for(let i=0;i<x.length;){if(x[i])y.push(x[i++]);else{let start=i;while(i<x.length&&!x[i])i++;let n=i-start;y.push(0);while(n>=128){y.push((n&127)|128);n>>=7}y.push(n)}}return y}
 function unruns(x,n){const y=[];for(let i=0;i<x.length;){let b=x[i++];if(b)y.push(b);else{if(y.at(-1)===0)throw Error("adjacent");let v=0,s=0;do{if(i>=x.length||s>21)throw Error("run");b=x[i++];v+=(b&127)*2**s;s+=7}while(b&128);if(!v||s>7&&b===0||v>n-y.length)throw Error("run");for(let j=0;j<v;j++)y.push(0)}if(y.length>n)throw Error("length")}if(y.length!==n)throw Error("length");return y}

 function arithmetic(x,n,mode,inv=false){const counts=new Map();let c=0,last=0,lo=0n,hi=4294967295n,code=0n,pending=0,bits=[],at=0,virtual=0;
 const half=2147483648n,q=1073741824n,tq=3221225472n;
 function emit(b){bits.push(b);for(;pending>0;pending--)bits.push(b^1)}
 function next(){if(at>=8*x.length){if(++virtual>32)throw Error("padding");return 0n}let i=at++;return BigInt((x[i>>3]>>(7-(i&7)))&1)}
 if(inv){if(!n){if(x.length)throw Error("empty payload");return []}for(let j=0;j<32;j++)code=2n*code+next()}
 function step(b,key=null){let [a,d]=key===null?[1,1]:(counts.get(key)??[1,1]);const mid=lo+(hi-lo+1n)*BigInt(a)/BigInt(a+d);if(inv)b=Number(code>=mid);if(b)lo=mid;else hi=mid-1n;
 for(;;){if(hi<half){if(!inv)emit(0)}else if(lo>=half){if(!inv)emit(1);lo-=half;hi-=half;if(inv)code-=half}else if(lo>=q&&hi<tq){if(!inv)pending++;lo-=q;hi-=q;if(inv)code-=q}else break;lo*=2n;hi=hi*2n+1n;if(inv)code=2n*code+next()}
 if(key!==null){if(b)d++;else a++;if(a+d>=4096){a=Math.ceil(a/2);d=Math.ceil(d/2)}counts.set(key,[a,d])}return b}
 function rank(v){let p=1,r=0;for(let j=7;j>=0;j--){let b=step((v>>j)&1,"rank/"+c+"/"+p);p=2*p+b;r=2*r+b}return r}
 function run(v){let k=inv?0:Math.floor(Math.log2(v));if(inv){while(!step(0,"run/"+c+"/"+k)){if(++k>24)throw Error("exponent")}}else for(let j=0;j<=k;j++)step(Number(j===k),"run/"+c+"/"+j);let r=1;for(let j=k-1;j>=0;j--)r=2*r+step((v>>j)&1);return r}
 function advance(b){const bucket=b===0?0:1+Math.floor(Math.log2(b));c=mode===5?9*last+bucket:mode===6?b:bucket;last=bucket}
 const y=[];for(let i=0;i<n;){if(mode>=4){let flag=step(Number(!x[i]),"flag/"+c);if(flag){let len;if(inv){if(y.at(-1)===0)throw Error("adjacent");len=run(0);if(len>n-i)throw Error("overshoot");for(let j=0;j<len;j++)y.push(0)}else{let end=i;while(end<n&&!x[end])end++;len=end-i;run(len)}i+=len;advance(0);continue}}
 const v=rank((x[i]??0)-(mode>=4?1:0))+(mode>=4?1:0);if(v>255)throw Error("rank");if(inv)y.push(v);advance(v);i++}
 if(inv){if(JSON.stringify(arithmetic(y,n,mode))!==JSON.stringify(x))throw Error("canonical");return y}
 if(n){pending++;emit(Number(lo>=q))}while(bits.length%8)bits.push(0);return Array.from({length:bits.length/8},(_,i)=>bits.slice(8*i,8*i+8).reduce((a,b)=>2*a+b,0))
 }
 function encode(x,m){let [p,l]=bwt(x);if(m>=1)l=mtf(l);if(m===2)l=runs(l);if(m>=3)l=arithmetic(l,l.length,m);return [73,88,66,49,m,0,0,0,0,(x.length>>>24)&255,(x.length>>>16)&255,(x.length>>>8)&255,x.length&255,(p>>>24)&255,(p>>>16)&255,(p>>>8)&255,p&255,...l]}
 function decode(a){const n=a.slice(5,13).reduce((x,b)=>256*x+b,0),p=a.slice(13,17).reduce((x,b)=>256*x+b,0),m=a[4];let l=a.slice(17);if(m===2)l=unruns(l,n);if(m>=3)l=arithmetic(l,n,m,true);if(l.length!==n)throw Error("length");if(m>=1)l=mtf(l,true);return inverse(p,l)}
 function experiment(){let cases=0,frames=0;for(let n=0;n<=8;n++)for(let v=0;v<3**n;v++){let x=Array.from({length:n},(_,i)=>Math.floor(v/3**i)%3);for(let m=0;m<=2;m++){let a=encode(x,m);if(JSON.stringify(x)!==JSON.stringify(decode(a)))throw Error("inverse");frames++}cases++}return {cases,frames}}
 return {encode,decode,experiment,arithmetic}
}
function trial(api){const rows=[];for(const n of [0,1,7,64,512])for(const kind of ['constant','periodic','xorshift']){let z=0x12345678;const x=Array.from({length:n},(_,i)=>{z^=z<<13;z^=z>>>17;z^=z<<5;return kind==='constant'?97:kind==='periodic'?[97,98,97,99,0][i%5]:z&255});for(let m=3;m<=4;m++){const frame=api.encode(x,m);if(JSON.stringify(api.decode(frame))!==JSON.stringify(x))throw Error("inverse");let rejected=false;try{api.decode([...frame,0])}catch{rejected=true}if(!rejected)throw Error("append accepted");rows.push({bytes:n,kind,mode:m,archive_bytes:frame.length,byte_equal:true,append_rejected:true})}}let bounds=0;for(const n of [1,2,3,127,128,129,255,256,257,65535,65536,65537]){const x=Array(n).fill(0),a=api.arithmetic(x,n,4);if(api.arithmetic(a,n,4,true).some(Boolean))throw Error("run boundary");bounds++}return {rows,run_bounds:bounds}}
function contextTrial(api){const rows=[];for(const n of [0,1,7,64,512])for(const kind of ["constant","periodic","xorshift"]){let z=0x12345678;const x=Array.from({length:n},(_,i)=>{z^=z<<13;z^=z>>>17;z^=z<<5;return kind==="constant"?97:kind==="periodic"?[97,98,97,99,0][i%5]:z&255});for(let m=5;m<=6;m++){const frame=api.encode(x,m);if(JSON.stringify(api.decode(frame))!==JSON.stringify(x))throw Error("inverse");let rejected=false;try{api.decode([...frame,0])}catch{rejected=true}if(!rejected)throw Error("append accepted");rows.push({bytes:n,kind,mode:m,archive_bytes:frame.length,byte_equal:true,append_rejected:true})}}return {rows}}
const api=oracle(),result=contextTrial(api);deepStrictEqual(result,JSON.parse(readFileSync('experiments/records/E0077.json','utf8')).observations);console.log('CONTEXT_REFERENCE '+JSON.stringify(result));

const dir=mkdtempSync(join(tmpdir(),'ixb1-')),bin=process.argv[2]??'target/release/ixb1',hash=x=>createHash('sha256').update(x).digest('hex');let rows=0;try{for(const n of [0,1,7,64,512])for(const kind of ['constant','periodic','xorshift']){let z=0x12345678;const x=Buffer.from(Array.from({length:n},(_,i)=>{z^=z<<13;z^=z>>>17;z^=z<<5;return kind==='constant'?97:kind==='periodic'?[97,98,97,99,0][i%5]:z&255}));for(let m=5;m<=6;m++){const a=Buffer.from(api.encode([...x],m)),i=join(dir,'input'),r=join(dir,'ref'),o=join(dir,'archive'),d=join(dir,'decoded');writeFileSync(i,x);writeFileSync(r,a);execFileSync(bin,['encode',String(m),i,o]);deepStrictEqual(readFileSync(o),a);execFileSync(bin,['decode',r,d]);deepStrictEqual(readFileSync(d),x);deepStrictEqual(Buffer.from(api.decode([...readFileSync(o)])),x);console.log('CONTEXT_CROSS '+JSON.stringify({bytes:n,kind,mode:m,archive_bytes:a.length,input_sha256:hash(x),archive_sha256:hash(a),decoded_sha256:hash(readFileSync(d)),byte_equal:true,archive_equal:true}));rows++}}}finally{rmSync(dir,{recursive:true,force:true})}console.log('CONTEXT CROSS PASSED '+rows);
