import {readFileSync,writeFileSync,openSync,readSync,closeSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
import {encode,decode,fixture} from './arithmetic-dag.mjs';
const hash=x=>createHash('sha256').update(x).digest('hex');
const dir=mkdtempSync(join(tmpdir(),'ixg1-'));
const bin=process.argv[3]??'target/release/ixg1';
function measure(x,meta){const t=performance.now(),greedy=encode(x),gm=performance.now()-t;const u=performance.now(),look=encode(x,true),lm=performance.now()-u;
if(look.archive.length>greedy.archive.length||!Buffer.from(decode(look.archive)).equals(x))throw Error('lookahead regression');
for(const e of [greedy,look]){const a=join(dir,'archive.ix'),o=join(dir,'restored');writeFileSync(a,e.archive);execFileSync(bin,[a,o]);if(!readFileSync(o).equals(x))throw Error('Rust decoder mismatch')}
console.log('DAG_LOOK '+JSON.stringify({...meta,bytes:x.length,greedy_bytes:greedy.archive.length,lookahead_bytes:look.archive.length,gzip_bytes:gzipSync(x,{level:9}).length,greedy_rules:greedy.rules,lookahead_rules:look.rules,explored_rules:look.explored_rules??0,greedy_ms:gm,lookahead_ms:lm,sha256:hash(x),greedy_archive_sha256:hash(greedy.archive),lookahead_archive_sha256:hash(look.archive),byte_equal:true,rust_verified:true}));}
function stream(l){const b=Buffer.alloc(l);for(let i=0;i<Math.ceil(l/32);i++){const c=Buffer.alloc(4);c.writeUInt32BE(i);createHash('sha256').update('integrax:C07:negative:').update(c).digest().copy(b,i*32)}return b}
try{for(const l of [256,1024,4096,16384]){for(const kind of ['periodic','repeated_text','dictionary','fibonacci'])measure(Buffer.from(fixture(l,kind)),{scope:'synthetic',kind});measure(stream(l),{scope:'synthetic',kind:'sha256-counter'})}
const fd=openSync(process.argv[2]??'data/enwik8','r');try{for(const offset of [0,1000000,50000000])for(const len of [64,256,1024,4096,16384]){const x=Buffer.alloc(len);if(readSync(fd,x,0,len,offset)!==len)throw Error('short input');measure(x,{scope:'authentic',offset})}}finally{closeSync(fd)}}finally{rmSync(dir,{recursive:true,force:true})}
console.log('PEAK_RSS '+process.resourceUsage().maxRSS*1024);
