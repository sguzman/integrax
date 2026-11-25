import {readFileSync,writeFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {deepStrictEqual} from 'node:assert';
import {createHash} from 'node:crypto';
import {specs,transform,frame,unframe} from './transforms.mjs';
function longChecks(api){
const num=x=>x.reduce((n,b)=>(n<<8n)|BigInt(b),0n);
let count=0,nontrivial=0,roundtrips=0,rows=[];
for(const l of [3,7,17,33,64,127,256,1024])for(let k=0;k<8;k++){
 let state=(0x9e3779b9+l*97+k)>>>0;
 const x=Uint8Array.from({length:l},(_,i)=>{state^=state<<13;state^=state>>>17;state^=state<<5;return k===0?255:k===1?(i===l-1?1:0):k===2?i&255:state&255});
 const N=num(x),S=1n<<BigInt(8*l);
 for(const spec of api.specs){const y=api.transform(x,spec),z=api.transform(y,spec,true);if(!z.every((v,i)=>v===x[i]))throw Error("roundtrip");roundtrips++;if(spec.kind==="integer"){const a=(1n-(256n**BigInt(spec.lag)))**BigInt(spec.order),expect=(N*a%S+S)%S;if(num(y)!==expect)throw Error("BigInt mismatch");count++;if(spec.lag<l)nontrivial++;}}
 rows.push({bytes:l,fixture:k});
}
return {integer_identities:count,nontrivial_lag_identities:nontrivial,roundtrips,fixtures:rows}}
const actual=longChecks({specs,transform});
deepStrictEqual(actual,JSON.parse(readFileSync('experiments/records/E0036.json','utf8')).observations);
console.log('LONG BIGINT REPLAY PASSED '+JSON.stringify({integer_identities:actual.integer_identities,nontrivial_lag_identities:actual.nontrivial_lag_identities,roundtrips:actual.roundtrips}));
const dir=mkdtempSync(join(tmpdir(),'ixt1-')),bin=process.argv[2]??'target/release/ixt1';
let count=0;try{for(const l of [0,1,2,33,64,1024,65536]){const x=Buffer.alloc(l);for(let i=0;i<Math.ceil(l/32);i++){const c=Buffer.alloc(4);c.writeUInt32BE(i);createHash('sha256').update('IXT1 independent control:').update(c).digest().copy(x,i*32)}const input=join(dir,'input'),a=join(dir,'a'),b=join(dir,'b'),out=join(dir,'out');writeFileSync(input,x);for(const s of specs){const js=frame(x,s);writeFileSync(a,js);execFileSync(bin,['encode',String(s.id),input,b]);deepStrictEqual(readFileSync(b),Buffer.from(js));execFileSync(bin,['decode',a,out]);deepStrictEqual(readFileSync(out),x);deepStrictEqual(Buffer.from(unframe(readFileSync(b))),x);count++}}}finally{rmSync(dir,{recursive:true,force:true})}
console.log('INDEPENDENT CROSS CODEC PASSED '+count);
