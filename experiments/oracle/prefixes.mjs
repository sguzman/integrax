// Authentic enwik8/enwik9 prefix slices; only run after published digest verification.
import {openSync,readSync,closeSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gzipSync,gunzipSync} from 'node:zlib';
import {performance} from 'node:perf_hooks';
import {encode,decode} from './near-power.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex');
const f=openSync(process.argv[2]??'data/enwik8','r');
try{
  for(const offset of [0,1000000,50000000])for(const len of [256,1024,4096,16384]){
    const b=Buffer.alloc(len);if(readSync(f,b,0,len,offset)!==len)throw Error('short read');
    const t=performance.now();const {archive,choice}=encode(b);const ms=performance.now()-t;
    const restored=decode(archive),gz=gzipSync(b,{level:9});
    if(!restored.equals(b)||!gunzipSync(gz).equals(b))throw Error('roundtrip mismatch');
    console.log(JSON.stringify({offset,bytes:len,sha256:hash(b),archive_bytes:archive.length,archive_sha256:hash(archive),decoded_sha256:hash(restored),gzip9_bytes:gz.length,choice,encode_ms:ms,byte_equal:true}));
  }
}finally{closeSync(f);}
console.log('peak_rss_bytes='+process.resourceUsage().maxRSS*1024);
