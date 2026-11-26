import {writeFileSync,readFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {deepStrictEqual,throws} from 'node:assert';
import {createHash} from 'node:crypto';
import {encode,decode,fixture,dualExperiment} from './root-intervals.mjs';
const prior=dualExperiment(),expected=JSON.parse(readFileSync('experiments/records/E0061.json','utf8')).observations;
deepStrictEqual(prior,expected);
const rules=prior.rules,raw=Buffer.alloc(2+4*rules.length);raw.writeUInt16BE(rules.length);rules.forEach(([a,b],i)=>{raw.writeUInt16BE(a,2+4*i);raw.writeUInt16BE(b,4+4*i)});
const dir=mkdtempSync(join(tmpdir(),'ixg2-rootmix-')),bin=process.argv[2]??'target/release/ixg2';
const hash=x=>createHash('sha256').update(x).digest('hex');
let count=0;
try{
 const dict=join(dir,'dict'),input=join(dir,'input'),archive=join(dir,'archive'),ref=join(dir,'reference'),out=join(dir,'out');
 writeFileSync(dict,raw);
 for(const bytes of [0,1,64,4096,65537])for(const kind of ['constant','periodic','xorshift','alternate']){
  const x=Buffer.from(fixture(bytes,kind)),js=Buffer.from(encode(x,rules,20,16).archive);
  writeFileSync(input,x);writeFileSync(ref,js);
  execFileSync(bin,['rootmix16',input,archive,dict],{stdio:'pipe'});
  const rust=readFileSync(archive);deepStrictEqual(rust,js);
  deepStrictEqual(Buffer.from(decode(rust)),x);
  execFileSync(bin,['decode-strict',ref,out],{stdio:'pipe'});deepStrictEqual(readFileSync(out),x);
  writeFileSync(archive,Buffer.concat([rust,Buffer.from([0])]));
  throws(()=>execFileSync(bin,['decode-strict',archive,out],{stdio:'pipe'}));
  console.log('INTEGRAX_RESULT '+JSON.stringify({kind,mode:20,input_bytes:bytes,archive_bytes:rust.length,input_sha256:hash(x),archive_sha256:hash(rust),decoded_sha256:hash(x),byte_equal:true,archive_equal:true,append_rejected:true}));count++;
 }
}finally{rmSync(dir,{recursive:true,force:true})}
if(count!==20)throw Error('unexpected comparison count');
