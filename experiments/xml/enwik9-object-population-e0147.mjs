import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {performance} from 'node:perf_hooks';

const sha=b=>createHash('sha256').update(b).digest('hex');
const startTime=performance.now();

// Keep this byte-span hierarchy definition in parity with factor-inventory-e0144.mjs.
function textTree(b,start,end){
 function part(s,e,kind,children=null){return {start:s,end:e,kind,children}}
 function split(s,e,re,kind,child){
  const x=b.subarray(s,e).toString('latin1'),out=[];let at=0;
  for(const m of x.matchAll(re)){const j=m.index+m[0].length;if(j>at){out.push(child(s+at,s+j));at=j}}
  if(at<x.length)out.push(child(s+at,e));return part(s,e,kind,out)
 }
 function words(s,e){
  const x=b.subarray(s,e).toString('latin1'),tokens=[];
  for(const m of x.matchAll(/[A-Za-z]+|[0-9]+|[^A-Za-z0-9]+/g)){
   const a=s+m.index,z=a+m[0].length;
   if(z-a<=32)tokens.push(part(a,z,'word'));
   else{const chunks=[];for(let p=a;p<z;p+=32)chunks.push(part(p,Math.min(e,p+32),'fragment'));tokens.push(part(a,z,'word',chunks))}
  }
  const phrases=[];
  for(let i=0;i<tokens.length;i+=6){const c=tokens.slice(i,i+6);phrases.push(part(c[0].start,c.at(-1).end,'phrase',c))}
  return part(s,e,'sentence',phrases)
 }
 const para=(s,e)=>split(s,e,/[.!?]+(?:[ \t\r\n]+|$)/g,'paragraph',words);
 return split(start,end,/\n+/g,'article',para)
}

function objectTree(b){
 const root={start:0,end:b.length,children:[]},stack=[root];let p=0;
 function leaf(s,e){if(e>s)stack.at(-1).children.push({start:s,end:e,children:null})}
 while(p<b.length){
  const lt=b.indexOf(60,p);
  if(lt!==p){const e=lt<0?b.length:lt;if(stack.at(-1).name==='text')stack.at(-1).children.push(textTree(b,p,e));else leaf(p,e);p=e;continue}
  let e=-1,opaque=false;
  for(const [pre,suf] of [['<!--','-->'],['<![CDATA[',']]>'],['<?','?>']]){
   if(b.subarray(p,p+pre.length).toString('latin1')===pre){opaque=true;const j=b.indexOf(suf,p+pre.length);e=j<0?b.length:j+suf.length;break}
  }
  if(opaque){leaf(p,e);p=e;continue}
  assert.notEqual(b[p+1],33,'unsupported declaration inside a page');
  let q=p+1,quote=0;
  for(;q<b.length;q++){const c=b[q];if(quote){if(c===quote)quote=0}else if(c===34||c===39)quote=c;else if(c===62)break;else assert.notEqual(c,60)}
  if(q===b.length){leaf(p,q);p=q;continue}
  e=q+1;const tag=b.subarray(p,e).toString('latin1'),m=/^<(\/)?([A-Za-z0-9_:.-]+)(?=[\s/>])/.exec(tag);assert(m,`unrecognized tag at page byte ${p}`);
  if(m[1]){assert(stack.length>1&&stack.at(-1).name===m[2],`mismatched close tag ${m[2]}`);leaf(p,e);stack.pop().end=e}
  else if(/\/\s*>$/.test(tag))leaf(p,e);
  else{const n={name:m[2],start:p,end:0,children:[]};stack.at(-1).children.push(n);stack.push(n);assert(stack.length<=32,'XML depth exceeded existing object model') ;leaf(p,e)}
  p=e;
 }
 while(stack.length>1)stack.pop().end=b.length;
 function verify(n){if(n.children===null)return;let pos=n.start;for(const c of n.children){assert.equal(c.start,pos);verify(c);pos=c.end}assert.equal(pos,n.end)}
 verify(root);return root
}

function scanTag(buf,lt){
 let i=lt+1;
 if(buf[i]===33){
  if(buf.subarray(i,i+3).toString('latin1')==='!--'){const j=buf.indexOf('-->',i+3);assert(j>=0,'unterminated XML comment');return {end:j+3,kind:'opaque'};}
  if(buf.subarray(i,i+8).toString('latin1')==='![CDATA['){const j=buf.indexOf(']]>',i+8);assert(j>=0,'unterminated CDATA');return {end:j+3,kind:'opaque'};}
  let quote=0,brackets=0;
  for(;i<buf.length;i++){const c=buf[i];if(quote){if(c===quote)quote=0}else if(c===34||c===39)quote=c;else if(c===91)brackets++;else if(c===93)brackets--;else if(c===62&&brackets===0)return {end:i+1,kind:'declaration'};}
  assert.fail('unterminated XML declaration');
 }
 if(buf[i]===63){const j=buf.indexOf('?>',i+1);assert(j>=0,'unterminated processing instruction');return {end:j+2,kind:'opaque'};}
 const close=buf[i]===47;if(close)i++;
 const nameStart=i;
 while(i<buf.length&&!/[\s/>]/.test(String.fromCharCode(buf[i])))i++;
 assert(i>nameStart,'empty XML element name');
 const name=buf.toString('ascii',nameStart,i);
 let quote=0;
 for(;i<buf.length;i++){const c=buf[i];if(quote){if(c===quote)quote=0}else if(c===34||c===39)quote=c;else if(c===62)break}
 assert(i<buf.length,'unterminated XML tag');
 let j=i-1;while(j>lt&&[9,10,13,32].includes(buf[j]))j--;
 return {end:i+1,kind:close?'close':buf[j]===47?'empty':'open',name};
}

const corpus=readFileSync(process.argv[2]);
assert.equal(corpus.length,1_000_000_000,'unexpected enwik9 byte length');
const corpusHash=sha(corpus);
assert.equal(corpusHash,'159b85351e5f76e60cbe32e04c677847a9ecba3adc79addab6f4c6c7aa3744bc','unexpected enwik9 SHA-256');

// Validate the object-tree definition against every page previously inventoried.
const manifest=JSON.parse(readFileSync('inventory/manifest.json','utf8'));
const checked=new Set();let validationPages=0,validationNodes=0;
for(const batch of manifest.batches){
 const record=JSON.parse(readFileSync(batch.record,'utf8'));
 for(const page of record.pages){
  assert(!checked.has(page.offset),`duplicate sampled page offset ${page.offset}`);checked.add(page.offset);
  const shards=batch.shards.filter(s=>s.offset===page.offset);assert(shards.length>0,`no indexed shards for ${batch.id} page ${page.offset}`);
  const expectedNodes=shards.reduce((n,s)=>n+s.rows,0);
  assert(shards.every(s=>s.width===page.width&&s.sha256===page.sha256),`manifest page metadata mismatch for ${batch.id}`);
  const bytes=corpus.subarray(page.offset,page.offset+page.width);assert.equal(bytes.length,page.width);assert.equal(sha(bytes),page.sha256);
  let nodes=0;const root=objectTree(bytes);(function walk(n){nodes++;if(n.children)for(const c of n.children)walk(c)})(root);
  assert.equal(nodes,expectedNodes,`parser population differs for ${batch.id} page offset ${page.offset}`);
  validationPages++;validationNodes+=nodes;
 }
}
assert.equal(validationPages,checked.size);assert.equal(validationNodes,manifest.indexed_nodes);

// Stream the full corpus lexically, respecting comments, CDATA, quotes and declarations,
// and build the identical per-page IntegraX object tree without doing any factorization.
const stack=[];let pageStart=-1,position=0,pages=0,pageBytes=0,candidateObjects=0,pageXmlElements=0,allXmlElements=0;
const byKind=Object.create(null),pageElementCounts=Object.create(null),allElementCounts=Object.create(null);
function countPage(start,end){
 const b=corpus.subarray(start,end),root=objectTree(b);let nodes=0;
 (function walk(n){
  nodes++;const kind=n.kind??n.name??(n===root?'page-root':'lexical');byKind[kind]=(byKind[kind]??0)+1;
  if(n.name){pageXmlElements++;pageElementCounts[n.name]=(pageElementCounts[n.name]??0)+1}
  if(n.children)for(const c of n.children)walk(c);
 })(root);
 candidateObjects+=nodes;pages++;pageBytes+=end-start;
 if(pages%10000===0)console.log(JSON.stringify({event:'E0147_PROGRESS',pages,page_bytes:pageBytes,candidate_objects:candidateObjects,page_xml_elements:pageXmlElements,source_offset:end}));
}
while(position<corpus.length){
 const lt=corpus.indexOf(60,position);if(lt<0)break;
 const token=scanTag(corpus,lt);position=token.end;
 if(token.kind==='open'){
  allXmlElements++;allElementCounts[token.name]=(allElementCounts[token.name]??0)+1;
  if(token.name==='page'){assert.equal(pageStart,-1,'nested page element');pageStart=lt}
  stack.push(token.name);
 }else if(token.kind==='empty'){
  allXmlElements++;allElementCounts[token.name]=(allElementCounts[token.name]??0)+1;
  if(token.name==='page')countPage(lt,token.end);
 }else if(token.kind==='close'){
  assert.equal(stack.at(-1),token.name,`mismatched XML close tag ${token.name} at ${lt}`);
  stack.pop();if(token.name==='page'){assert(pageStart>=0,'page close without open');countPage(pageStart,token.end);pageStart=-1}
 }
}
assert.equal(pageStart,-1,'unclosed page at EOF');assert.equal(stack.length,0,'unclosed XML elements at EOF');assert(pages>0);
assert.equal(pages,pageElementCounts.page,'page count differs from parsed page element count');
const inventoryCoverage=candidateObjects?100*manifest.indexed_nodes/candidateObjects:0;
console.log(JSON.stringify({event:'E0147_XML_OBJECT_POPULATION',experiment:'E0147',corpus_sha256:corpusHash,corpus_bytes:corpus.length,enumeration:'all <page> elements; exact per-page IntegraX objectTree/textTree hierarchy; no factorization',parser_validation:{pages:validationPages,objects:validationNodes,manifest_indexed_nodes:manifest.indexed_nodes,all_sampled_page_object_counts_matched:true},total_xml_pages:pages,total_xml_element_objects:allXmlElements,total_page_xml_element_objects:pageXmlElements,total_integrax_candidate_objects:candidateObjects,indexed_pages:validationPages,indexed_page_coverage_percent:100*validationPages/pages,indexed_objects:manifest.indexed_nodes,indexed_object_coverage_percent:inventoryCoverage,page_payload_bytes:pageBytes,page_payload_coverage_percent:100*pageBytes/corpus.length,objects_by_kind:byKind,all_xml_elements_by_name:allElementCounts,page_xml_elements_by_name:pageElementCounts,wall_seconds:(performance.now()-startTime)/1000,peak_rss_kib:process.resourceUsage().maxRSS,interpretation:'Coverage denominator is the full XML population under the persisted IntegraX per-page object-tree definition. All document XML elements and page-local XML elements are counted separately. Indexed numerator is the exact current inventory manifest; every sampled page object count is checked against its batch rows before full enumeration.'}));
