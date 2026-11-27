// Reproduce EA11/E004; no corpus bytes committed. Run in pinned Nix shell.
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {execFileSync} from "node:child_process";
const sha=b=>createHash("sha256").update(b).digest("hex");
const programs=[["gzip",["-n","-9","-c"],["-dc"]],["xz",["-9","-c"],["-dc"]],["zstd",["-19","-q","-c"],["-qdc"]]];
const rows=[];
for(const path of process.argv.slice(2)){
 const root=JSON.parse(readFileSync(path,"utf8")).rows.find(x=>x.parent===null);
 let n=BigInt("0x"+root.cofactor);
 for(const f of root.factors)n*=BigInt("0x"+f.p)**BigInt(f.e);
 const data=Buffer.from(n.toString(16).padStart(root.width*2,"0"),"hex");
 if(data.length!==root.width||sha(data)!==root.byte_sha256)throw Error("input mismatch");
 const row={id:root.id,width:root.width,input_sha256:sha(data)};
 for(const [p,args,dec] of programs){
  let a=execFileSync(p,args,{input:data});
  if(!data.equals(execFileSync(p,dec,{input:a})))throw Error(p+" roundtrip");
  row[p+"_bytes"]=a.length;row[p+"_sha256"]=sha(a);
 }
 rows.push(row);
}
console.log(JSON.stringify({versions:Object.fromEntries(programs.map(([p])=>[p,execFileSync(p,["--version"],{encoding:"utf8"}).split("\n")[0]])),rows},null,2));
