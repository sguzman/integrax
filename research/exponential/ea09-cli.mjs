// Run under nix develop; no dependencies beyond pinned Node and standard codecs.
import {encode,decode,fixtures,selftest} from "./ea09-codec.mjs";
import {readFileSync,writeFileSync} from "node:fs";
import {execFileSync} from "node:child_process";
import {createHash} from "node:crypto";
import {performance} from "node:perf_hooks";
const hash=x=>createHash("sha256").update(x).digest("hex");
const [cmd,input,output]=process.argv.slice(2);
if(cmd==="encode"||cmd==="decode"){
 if(!input||!output)throw Error("input and output paths required");
 const a=readFileSync(input),b=cmd==="encode"?encode(a):decode(a);
 writeFileSync(output,b);
}else if(cmd==="test"){
 console.log(JSON.stringify(selftest(),null,2));
}else if(cmd==="compare"){
 const rows=[];
 for(const [name,data] of fixtures()){
  const start=performance.now(),a=encode(data),encode_ms=performance.now()-start,t=performance.now(),b=decode(a),decode_ms=performance.now()-t;
  if(hash(data)!==hash(b))throw Error("arithmetic mismatch");
  const row={name,input_bytes:data.length,input_sha256:hash(data),archive_bytes:a.length,archive_sha256:hash(a),encode_ms,decode_ms};
  for(const [program,args,dec] of [["gzip",["-n","-9","-c"],["-dc"]],["xz",["-9","-c"],["-dc"]],["zstd",["-19","-q","-c"],["-qdc"]]]){
   const t=performance.now(),packed=execFileSync(program,args,{input:data}),elapsed=performance.now()-t;
   if(hash(execFileSync(program,dec,{input:packed}))!==row.input_sha256)throw Error(program+" mismatch");
   row[program+"_bytes"]=packed.length;row[program+"_encode_ms"]=elapsed;
  }
  rows.push(row);
 }
 console.log(JSON.stringify({node:process.version,versions:Object.fromEntries(["gzip","xz","zstd"].map(p=>[p,execFileSync(p,["--version"],{encoding:"utf8"}).split("\n")[0]])),rows},null,2));
}else throw Error("usage: ea09-cli.mjs encode INPUT OUTPUT | decode INPUT OUTPUT | test | compare");
