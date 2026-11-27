// EA10: verified corpus, exact offset samples; whole-stream certificate is single-power only.
import {openSync,readSync,closeSync,statSync,readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {createHash} from "node:crypto";
import {execFileSync} from "node:child_process";
import {performance} from "node:perf_hooks";
import {encode,decode} from "./ea09-codec.mjs";
import {screen} from "./ea10-prefix.mjs";
const [input,out]=process.argv.slice(2);
if(!input||!out)throw Error("usage: ea10-corpus.mjs enwik9 evidence-directory");
const length=statSync(input).size,expected="159b85351e5f76e60cbe32e04c677847a9ecba3adc79addab6f4c6c7aa3744bc";
const digest=execFileSync("sha256sum",[input],{encoding:"utf8"}).split(" ")[0];
if(length!==1000000000||digest!==expected)throw Error("corpus mismatch");
mkdirSync(out,{recursive:true});
const hash=a=>createHash("sha256").update(a).digest("hex");
const fd=openSync(input,"r");
function sample(offset,size){let a=Buffer.alloc(size);if(readSync(fd,a,0,size,offset)!==size)throw Error("short read");return a}
const pref=sample(0,32),t=performance.now(),whole=screen(pref,length,80,true),screen_ms=performance.now()-t;
const rows=[];
for(const offset of [0,30000000,33000000,90000000,500000000,999995904])for(const width of [128,1024,4096]){
 const data=sample(offset,width),start=performance.now(),archive=encode(data),encode_ms=performance.now()-start;
 const dt=performance.now(),decoded=decode(archive),decode_ms=performance.now()-dt;
 if(!data.equals(Buffer.from(decoded)))throw Error("arithmetic mismatch");
 const id=offset+"-"+width,base=out+"/"+id;
 writeFileSync(base+".iex",archive);writeFileSync(base+".sha256",hash(data)+"\n");
 const row={offset,width,input_sha256:hash(data),archive_sha256:hash(archive),arithmetic_bytes:archive.length,encode_ms,decode_ms,screen:screen(data.subarray(0,32),width).status};
 for(const [program,args,dec] of [["gzip",["-n","-9","-c"],["-dc"]],["xz",["-9","-c"],["-dc"]],["zstd",["-19","-q","-c"],["-qdc"]]]){
 const compressed=execFileSync(program,args,{input:data});if(!data.equals(execFileSync(program,dec,{input:compressed})))throw Error(program+" mismatch");row[program+"_bytes"]=compressed.length;
 }
 rows.push(row);console.log(JSON.stringify(row));
}
closeSync(fd);
writeFileSync(out+"/results.json",JSON.stringify({corpus:{bytes:length,sha256:digest},whole:{scope:"single powers, bases 2..64, EA08 one-bit mode; not full codec or corpus roundtrip",prefix_hex:pref.toString("hex"),screen_ms,...whole},node:process.version,rows},null,2)+"\n");
