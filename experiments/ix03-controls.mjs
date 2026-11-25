import {readFileSync,writeFileSync,mkdirSync,openSync,readSync,closeSync,statSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {gzipSync,gunzipSync} from 'node:zlib';
import {performance} from 'node:perf_hooks';
const bin=process.argv[2]??'target/release/ix03',corpus=process.argv[3]??'data/enwik8';
const out='results-local/ix03';mkdirSync(out,{recursive:true});
const hash=b=>createHash('sha256').update(b).digest('hex');
function seeded(len,seed){let s=seed>>>0;const b=Buffer.alloc(len);for(let i=0;i<len;i++){s^=s<<13;s^=s>>>17;s^=s<<5;b[i]=s&255;}return b;}
function call(...args){const r=spawnSync(bin,args,{encoding:'utf8'});if(r.status!==0)throw Error(r.stderr||String(r.error));}
function run(kind,b,meta){
    const inFile=out+'/input',archiveFile=out+'/archive',restoredFile=out+'/restored';
    writeFileSync(inFile,b);
    const t=performance.now();call('encode',inFile,archiveFile);const enc_ms=performance.now()-t;
    const a=readFileSync(archiveFile);const d=performance.now();call('decode',archiveFile,restoredFile);const dec_ms=performance.now()-d;
    const restored=readFileSync(restoredFile),gz=gzipSync(b,{level:9});
    if(!restored.equals(b)||!gunzipSync(gz).equals(b))throw Error('roundtrip failure');
    let p=null,k=null;
    if(a[4]===1){let i=13;const read=()=>{let x=0,s=1,v;do{v=a[i++];x+=(v&127)*s;s*=128;}while(v&128);return x;};p=read();i+=p;k=read();}
    console.log(JSON.stringify({kind,...meta,bytes:b.length,sha256:hash(b),archive_bytes:a.length,archive_sha256:hash(a),decoded_sha256:hash(restored),gzip9_bytes:gz.length,mode:a[4],p,k,encode_ms:enc_ms,decode_ms:dec_ms,byte_equal:true}));
}
const text=Buffer.from('A short mathematical description is not automatically a shorter lossless encoding. Exact reconstruction requires every necessary bit.\n');
for(const len of [256,1024,4096,16384,65536]){
    const seed=0x5eed1234+len;
    const a=Buffer.alloc(len);for(let i=0;i<len;i++)a[i]=text[i%text.length];
    run('repeated_text',a,{seed:null});
    const b=Buffer.from(a);for(let i=0;i<len;i+=257)b[i]^=255;
    run('sparse_mutations',b,{seed:null,mutation_stride:257});
    run('random',seeded(len,seed),{seed});
}
const fd=openSync(corpus,'r');
try{for(const offset of [0,1000000,50000000])for(const len of [256,1024,4096,16384,65536]){
    const b=Buffer.alloc(len);if(readSync(fd,b,0,len,offset)!==len)throw Error('short read');run('enwik8_slice',b,{offset});
}}finally{closeSync(fd);}
console.log('binary_bytes='+statSync(bin).size);
