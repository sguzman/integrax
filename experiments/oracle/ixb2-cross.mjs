import {mkdtempSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync,spawnSync} from 'node:child_process';
import {deepStrictEqual} from 'node:assert';
import {createHash} from 'node:crypto';
function oracle(){
 function bwt(x){if(!x.length)return [0,[]];const n=x.length,o=Array.from({length:n},(_,i)=>i);o.sort((a,b)=>{for(let j=0;j<n;j++){const d=x[(a+j)%n]-x[(b+j)%n];if(d)return d}return a-b});return [o.indexOf(0),o.map(i=>x[(i+n-1)%n])]}
 function inverse(p,l){if(!l.length){if(p)throw Error("primary");return []}if(p<0||p>=l.length)throw Error("primary");const f=l.map((b,i)=>[b,i]).sort((a,b)=>a[0]-b[0]||a[1]-b[1]);let r=p,x=[];for(let i=0;i<l.length;i++){r=f[r][1];x.push(l[r])}return x}
 function mtf(x,inv=false){let a=Array.from({length:256},(_,i)=>i);return x.map(b=>{let p=inv?b:a.indexOf(b),v=a.splice(p,1)[0];a.unshift(v);return inv?v:p})}
 function runs(x){const y=[];for(let i=0;i<x.length;){if(x[i])y.push(x[i++]);else{let start=i;while(i<x.length&&!x[i])i++;let n=i-start;y.push(0);while(n>=128){y.push((n&127)|128);n>>=7}y.push(n)}}return y}
 function unruns(x,n){const y=[];for(let i=0;i<x.length;){let b=x[i++];if(b)y.push(b);else{if(y.at(-1)===0)throw Error("adjacent");let v=0,s=0;do{if(i>=x.length||s>21)throw Error("run");b=x[i++];v+=(b&127)*2**s;s+=7}while(b&128);if(!v||s>7&&b===0||v>n-y.length)throw Error("run");for(let j=0;j<v;j++)y.push(0)}if(y.length>n)throw Error("length")}if(y.length!==n)throw Error("length");return y}

 function arithmetic(x,n,mode,inv=false){const counts=new Map();let c=0,lo=0n,hi=4294967295n,code=0n,pending=0,bits=[],at=0,virtual=0;
 const half=2147483648n,q=1073741824n,tq=3221225472n;
 function emit(b){bits.push(b);for(;pending>0;pending--)bits.push(b^1)}
 function next(){if(at>=8*x.length){if(++virtual>32)throw Error("padding");return 0n}let i=at++;return BigInt((x[i>>3]>>(7-(i&7)))&1)}
 if(inv){if(!n){if(x.length)throw Error("empty payload");return []}for(let j=0;j<32;j++)code=2n*code+next()}
 function step(b,key=null){let [a,d]=key===null?[1,1]:(counts.get(key)??[1,1]);const mid=lo+(hi-lo+1n)*BigInt(a)/BigInt(a+d);if(inv)b=Number(code>=mid);if(b)lo=mid;else hi=mid-1n;
 for(;;){if(hi<half){if(!inv)emit(0)}else if(lo>=half){if(!inv)emit(1);lo-=half;hi-=half;if(inv)code-=half}else if(lo>=q&&hi<tq){if(!inv)pending++;lo-=q;hi-=q;if(inv)code-=q}else break;lo*=2n;hi=hi*2n+1n;if(inv)code=2n*code+next()}
 if(key!==null){if(b)d++;else a++;if(a+d>=4096){a=Math.ceil(a/2);d=Math.ceil(d/2)}counts.set(key,[a,d])}return b}
 function rank(v){let p=1,r=0;for(let j=7;j>=0;j--){let b=step((v>>j)&1,"rank/"+c+"/"+p);p=2*p+b;r=2*r+b}return r}
 function run(v){let k=inv?0:Math.floor(Math.log2(v));if(inv){while(!step(0,"run/"+c+"/"+k)){if(++k>24)throw Error("exponent")}}else for(let j=0;j<=k;j++)step(Number(j===k),"run/"+c+"/"+j);let r=1;for(let j=k-1;j>=0;j--)r=2*r+step((v>>j)&1);return r}
 function advance(b){c=b===0?0:1+Math.floor(Math.log2(b))}
 const y=[];for(let i=0;i<n;){if(mode===4){let flag=step(Number(!x[i]),"flag/"+c);if(flag){let len;if(inv){if(y.at(-1)===0)throw Error("adjacent");len=run(0);if(len>n-i)throw Error("overshoot");for(let j=0;j<len;j++)y.push(0)}else{let end=i;while(end<n&&!x[end])end++;len=end-i;run(len)}i+=len;advance(0);continue}}
 const v=rank((x[i]??0)-(mode===4?1:0))+(mode===4?1:0);if(v>255)throw Error("rank");if(inv)y.push(v);advance(v);i++}
 if(inv){if(JSON.stringify(arithmetic(y,n,mode))!==JSON.stringify(x))throw Error("canonical");return y}
 if(n){pending++;emit(Number(lo>=q))}while(bits.length%8)bits.push(0);return Array.from({length:bits.length/8},(_,i)=>bits.slice(8*i,8*i+8).reduce((a,b)=>2*a+b,0))
 }
 function encode(x,m){let [p,l]=bwt(x);if(m>=1)l=mtf(l);if(m===2)l=runs(l);if(m>=3)l=arithmetic(l,l.length,m);return [73,88,66,49,m,0,0,0,0,(x.length>>>24)&255,(x.length>>>16)&255,(x.length>>>8)&255,x.length&255,(p>>>24)&255,(p>>>16)&255,(p>>>8)&255,p&255,...l]}
 function decode(a){const n=a.slice(5,13).reduce((x,b)=>256*x+b,0),p=a.slice(13,17).reduce((x,b)=>256*x+b,0),m=a[4];let l=a.slice(17);if(m===2)l=unruns(l,n);if(m>=3)l=arithmetic(l,n,m,true);if(l.length!==n)throw Error("length");if(m>=1)l=mtf(l,true);return inverse(p,l)}
 function experiment(){let cases=0,frames=0;for(let n=0;n<=8;n++)for(let v=0;v<3**n;v++){let x=Array.from({length:n},(_,i)=>Math.floor(v/3**i)%3);for(let m=0;m<=2;m++){let a=encode(x,m);if(JSON.stringify(x)!==JSON.stringify(decode(a)))throw Error("inverse");frames++}cases++}return {cases,frames}}
 return {encode,decode,experiment,arithmetic}
}
function blocks(api){
 const cap=16777216,limit=1000000000,magic=[73,88,66,50],inner=[73,88,66,49];
 function be(v,n){let x=BigInt(v);const a=Array(n);for(let i=n-1;i>=0;i--){a[i]=Number(x&255n);x>>=8n}if(x)throw Error("integer range");return a}
 function num(a){return Number(a.reduce((v,b)=>v*256n+BigInt(b),0n))}
 function eq(a,b){return a.length===b.length&&a.every((v,i)=>v===b[i])}
 function encode(x,block){if(!Number.isInteger(block)||block<1||block>cap||x.length>limit)throw Error("cap");let out=[...magic,...be(x.length,8),...be(block,4)],tags=[];for(let i=0;i<x.length;i+=block){const raw=x.slice(i,i+block),frame=api.encode(raw,4),tag=Number(frame.length<raw.length),payload=tag?frame:raw;out.push(tag,...be(payload.length,4),...payload);tags.push(tag)}return {out,tags}}
 function decode(a){let pos=0;function take(n){if(!Number.isSafeInteger(n)||n<0||pos+n>a.length)throw Error("truncated");const x=a.slice(pos,pos+n);pos+=n;return x}if(!eq(take(4),magic))throw Error("magic");const n=num(take(8)),block=num(take(4));if(n>limit||block<1||block>cap)throw Error("cap");const y=[];for(let left=n;left>0;){let len=Math.min(left,block),tag=take(1)[0],k=num(take(4));if(!(tag===0&&k===len||tag===1&&k>=17&&k<len))throw Error("descriptor");const payload=take(k);if(tag){if(!eq(payload.slice(0,4),inner)||payload[4]!==4||num(payload.slice(5,13))!==len)throw Error("inner");const x=api.decode(payload);if(x.length!==len)throw Error("output");y.push(...x)}else y.push(...payload);left-=len}if(pos!==a.length)throw Error("trailing");return y}
 function fixture(kind,n){let z=0x12345678;return Array.from({length:n},(_,i)=>{z^=z<<13;z^=z>>>17;z^=z<<5;return kind==="constant"?97:kind==="periodic"?[97,98,0,99,97][i%5]:kind==="mixed"?i<128?97:i<256?i-128:[101,110,100][(i-256)%3]:z&255})}
 function mutations(a){const out=[["trailing",[...a,0]],["magic",a.map((b,i)=>i===0?0:b)],["zero-block",a.map((b,i)=>i>=12&&i<16?0:b)],["over-cap",a.map((b,i)=>i===12?2:b)],["oversize-total",a.map((b,i)=>i===4?1:b)]];if(a.length>16){out.push(["tag",a.map((b,i)=>i===16?2:b)],["length",a.map((b,i)=>i>=17&&i<21?255:b)]);if(a[16]===1)out.push(["inner-mode",a.map((b,i)=>i===25?3:b)],["inner-length",a.map((b,i)=>i===33?b^1:b)])}return out}
 function trial(){let rows=[],truncations=0,malformed=0;for(const [n,kind] of [[0,"constant"],[1,"constant"],[64,"constant"],[129,"periodic"],[259,"mixed"],[259,"xorshift"]])for(const block of [17,64,128,256,16777216]){const x=fixture(kind,n),{out,tags}=encode(x,block);if(!eq(x,decode(out)))throw Error("inverse");for(let j=0;j<out.length;j++){let rejected=false;try{decode(out.slice(0,j))}catch{rejected=true}if(!rejected)throw Error("prefix accepted");truncations++}for(const [name,b]of mutations(out)){let rejected=false;try{decode(b)}catch{rejected=true}if(!rejected)throw Error("mutation accepted "+name);malformed++}rows.push({bytes:n,kind,block,archive_bytes:out.length,tags,byte_equal:true})}if(!rows.some(r=>r.tags.includes(0)&&r.tags.includes(1)))throw Error("no mixed");return {rows,truncations,malformed}}
 return {encode,decode,fixture,mutations,trial}
}
const api=blocks(oracle()),result=api.trial(),expected=JSON.parse(readFileSync('experiments/records/E0075.json','utf8')).observations;
deepStrictEqual(result,expected);
const dir=mkdtempSync(join(tmpdir(),'ixb2-')),bin=process.argv[2]??'target/release/ixb1',hash=x=>createHash('sha256').update(x).digest('hex');
let rejects=0;
try{const input=join(dir,'input'),ref=join(dir,'ref'),archive=join(dir,'archive'),out=join(dir,'out'),bad=join(dir,'bad');
 for(const r of result.rows){const x=api.fixture(r.kind,r.bytes),a=api.encode(x,r.block).out;writeFileSync(input,Buffer.from(x));writeFileSync(ref,Buffer.from(a));execFileSync(bin,['encode-blocks',input,archive,String(r.block)],{stdio:'pipe'});deepStrictEqual(readFileSync(archive),Buffer.from(a));execFileSync(bin,['decode-blocks',ref,out]);deepStrictEqual(readFileSync(out),Buffer.from(x));deepStrictEqual(api.decode([...readFileSync(archive)]),x);const decodedHash=hash(readFileSync(out));
 for(const [name,b] of [...api.mutations(a),['truncated',a.slice(0,-1)]]){writeFileSync(bad,Buffer.from(b));const p=spawnSync(bin,['decode-blocks',bad,out]);if(p.status!==1||p.signal)throw Error('bad rejection '+name+' '+p.status+' '+p.signal);rejects++}
 console.log('BLOCK_CROSS '+JSON.stringify({...r,archive_equal:true,input_sha256:hash(Buffer.from(x)),archive_sha256:hash(Buffer.from(a)),decoded_sha256:decodedHash}));}
}finally{rmSync(dir,{recursive:true,force:true})}
console.log('BLOCK CROSS PASSED '+result.rows.length+' malformed_rejects='+rejects);
