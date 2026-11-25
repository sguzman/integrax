import {readFileSync,openSync,readSync,closeSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {deepStrictEqual} from 'node:assert';
import {encode,decode,experiment} from './multiplicative-dp.mjs';
import {encode as single} from './multiplicative.mjs';
const actual=experiment(),expected=JSON.parse(readFileSync('experiments/records/E0011.json','utf8')).observations;deepStrictEqual(actual,expected);console.log('MULTI REPLAY PASSED '+JSON.stringify(actual));
const fd=openSync(process.argv[2]??'data/enwik8','r');const hash=x=>createHash('sha256').update(x).digest('hex');try{for(const offset of [0,1000000,50000000])for(const len of [64,256,1024,4096,16384]){const x=Buffer.alloc(len);if(readSync(fd,x,0,len,offset)!==len)throw Error('short input');const t=performance.now(),e=encode(x),ms=performance.now()-t,d=decode(e.archive);if(!Buffer.from(d).equals(x))throw Error('mismatch');console.log('MULTI_AUTH '+JSON.stringify({offset,bytes:len,archive_bytes:e.archive.length,single_archive_bytes:single(x).archive.length,choice:e.choice,sha256:hash(x),archive_sha256:hash(e.archive),decoded_sha256:hash(d),encode_ms:ms,byte_equal:true}));}}finally{closeSync(fd)}console.log('PEAK_RSS '+process.resourceUsage().maxRSS*1024);
