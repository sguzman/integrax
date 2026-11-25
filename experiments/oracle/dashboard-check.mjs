import {readFileSync} from 'node:fs';
async function checkDashboard(html,ledger){
 const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];if(!script)throw Error("missing script");
 function assert(v,m){if(!v)throw Error(m)}
 function element(){return {textContent:"",children:[],append(x){this.children.push(x)}}}
 async function execute(fail){const ids=Object.fromEntries(["target","reference","status","best","provisional","external","history"].map(id=>[id,element()]));const document={createElement:element,getElementById:id=>{if(!ids[id])throw Error("bad id "+id);return ids[id]}};const fetch=async url=>{assert(url==="frontier.json","ledger URL");return {ok:!fail,json:async()=>ledger}};
 await new Function("document","fetch",script.replace("fetch('frontier.json')","return fetch('frontier.json')"))(document,fetch);
 return ids}
 const d=await execute(false),fmt=x=>x.toLocaleString("en-US"),rows=k=>d[k].children.map(r=>r.children.map(c=>c.textContent)),entries=ledger.entries.filter(e=>!e.invalidated);
 assert(d.target.textContent===fmt(ledger.target.bytes)+" bytes · "+ledger.target.id,"target");assert(d.reference.textContent.includes(fmt(ledger.reference.contest_total_bytes)),"reference");assert(rows("history").length===entries.length,"history length");
 const expected=["whole","blockwise","hybrid","contest"].map((track,i)=>{const xs=entries.filter(e=>e.track===track&&e.metric===(track==="contest"?"contest_total_bytes":"archive_bytes")).map(e=>e.bytes);return [["Whole integer","Blockwise","Hybrid","Contest total"][i],xs.length?fmt(Math.min(...xs)):"Not established"]});
 assert(JSON.stringify(rows("best"))===JSON.stringify(expected),"track minima");assert(rows("external").length===(ledger.external_baselines??[]).length,"external baselines");assert(rows("provisional").length===(ledger.provisional_results??[]).length,"provisional");
 assert(JSON.stringify(rows("history"))===JSON.stringify(entries.map(e=>[e.date,e.track,fmt(e.bytes),e.experiment+" / "+e.verification])),"history values");const f=await execute(true);assert(f.target.textContent==="Ledger unavailable"&&f.status.textContent==="ledger unavailable","failure state");
 return {entries:entries.length,track_minima:expected,external:rows("external").length,provisional:rows("provisional").length,error_state:true}
}
console.log(JSON.stringify(await checkDashboard(readFileSync('docs/index.html','utf8'),JSON.parse(readFileSync('docs/frontier.json','utf8')))));
