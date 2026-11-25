import {readFileSync,writeFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {deepStrictEqual} from 'node:assert';
import {createHash} from 'node:crypto';
import {encode,decode,fixture,experiment} from './root-intervals.mjs';
const all=experiment(),actual={rules:all.rules,rows:all.rows.filter(r=>r.mode>=9&&r.mode<=10)},expected=JSON.parse(readFileSync('experiments/records/E0046.json','utf8')).observations;
deepStrictEqual(actual,expected);
const names=['adaptive','context','backoff','lexcontext','lexorder2','order2','lexorder3','lexprevroot'],dir=mkdtempSync(join(tmpdir(),'ixg2-cross-')),bin=process.argv[2]??'target/release/ixg2';
const hash=x=>createHash('sha256').update(x).digest('hex');
let count=0;try{const dict=join(dir,'dict'),input=join(dir,'input'),archive=join(dir,'archive'),ref=join(dir,'reference'),out=join(dir,'out');const rules=actual.rules,raw=Buffer.alloc(2+4*rules.length);raw.writeUInt16BE(rules.length);rules.forEach(([a,b],i)=>{raw.writeUInt16BE(a,2+4*i);raw.writeUInt16BE(b,4+4*i)});writeFileSync(dict,raw);
 for(const r of actual.rows){const x=Buffer.from(fixture(r.bytes,r.kind)),js=Buffer.from(encode(x,rules,r.mode).archive);writeFileSync(input,x);writeFileSync(ref,js);execFileSync(bin,[names[r.mode-3],input,archive,dict],{stdio:'pipe'});const rust=readFileSync(archive);deepStrictEqual(rust,js);deepStrictEqual(Buffer.from(decode(rust)),x);execFileSync(bin,['decode',ref,out]);deepStrictEqual(readFileSync(out),x);console.log('ROOT_CROSS '+JSON.stringify({...r,input_sha256:hash(x),archive_sha256:hash(js),decoded_sha256:hash(readFileSync(out)),archive_equal:true}));count++}
 }finally{rmSync(dir,{recursive:true,force:true})}console.log('ROOT INTERVAL CROSS PASSED '+count);
