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
 function encode(x,m){let [p,l]=bwt(x);if(m>=1)l=mtf(l);if(m===2)l=runs(l);return [73,88,66,49,m,0,0,0,0,(x.length>>>24)&255,(x.length>>>16)&255,(x.length>>>8)&255,x.length&255,(p>>>24)&255,(p>>>16)&255,(p>>>8)&255,p&255,...l]}
 function decode(a){const n=a.slice(5,13).reduce((x,b)=>256*x+b,0),p=a.slice(13,17).reduce((x,b)=>256*x+b,0),m=a[4];let l=a.slice(17);if(m===2)l=unruns(l,n);if(l.length!==n)throw Error("length");if(m>=1)l=mtf(l,true);return inverse(p,l)}
 function experiment(){let cases=0,frames=0;for(let n=0;n<=8;n++)for(let v=0;v<3**n;v++){let x=Array.from({length:n},(_,i)=>Math.floor(v/3**i)%3);for(let m=0;m<=2;m++){let a=encode(x,m);if(JSON.stringify(x)!==JSON.stringify(decode(a)))throw Error("inverse");frames++}cases++}return {cases,frames}}
 return {encode,decode,experiment}
}
const api=oracle();console.log('REFERENCE '+JSON.stringify(api.experiment()));const dir=mkdtempSync(join(tmpdir(),'ixb1-')),bin=process.argv[2]??'target/release/ixb1',hash=x=>createHash('sha256').update(x).digest('hex');let rows=0;try{for(const n of [0,1,7,64,512])for(const kind of ['constant','periodic','xorshift']){let z=0x12345678;const x=Buffer.from(Array.from({length:n},(_,i)=>{z^=z<<13;z^=z>>>17;z^=z<<5;return kind==='constant'?97:kind==='periodic'?[97,98,97,99,0][i%5]:z&255}));for(let m=0;m<3;m++){const a=Buffer.from(api.encode([...x],m)),i=join(dir,'input'),r=join(dir,'ref'),o=join(dir,'archive'),d=join(dir,'decoded');writeFileSync(i,x);writeFileSync(r,a);execFileSync(bin,['encode',String(m),i,o]);deepStrictEqual(readFileSync(o),a);execFileSync(bin,['decode',r,d]);deepStrictEqual(readFileSync(d),x);deepStrictEqual(Buffer.from(api.decode([...readFileSync(o)])),x);console.log('BWT_CROSS '+JSON.stringify({bytes:n,kind,mode:m,archive_bytes:a.length,input_sha256:hash(x),archive_sha256:hash(a),decoded_sha256:hash(readFileSync(d)),byte_equal:true,archive_equal:true}));rows++}}}finally{rmSync(dir,{recursive:true,force:true})}console.log('BWT CROSS PASSED '+rows);
