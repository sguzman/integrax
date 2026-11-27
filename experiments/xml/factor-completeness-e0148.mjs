import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {performance} from 'node:perf_hooks';

const started=performance.now();
const sha=b=>createHash('sha256').update(b).digest('hex');
const readJson=p=>JSON.parse(readFileSync(p,'utf8'));
const hexInt=s=>BigInt(`0x${s||'0'}`);
const bitLength=n=>n===0n?0:n.toString(2).length;
const product=xs=>xs.reduce((n,x)=>n*hexInt(x.p)**BigInt(x.e),1n);
const manifestBytes=readFileSync('inventory/manifest.json');
const manifest=JSON.parse(manifestBytes);
const population=readJson('experiments/records/E0147.json');
const prior=readJson('experiments/records/E0144.json');
assert.equal(population.status,'verified');
assert.equal(population.corpus_sha256,manifest.corpus_sha256);
assert.equal(population.indexed_objects,manifest.indexed_nodes);
assert.equal(population.parser_validation.all_sampled_page_object_counts_matched,true);
assert.equal(prior.status,'verified');
assert.equal(manifest.index.distinct_factors,prior.summary.distinct_factors);

const rows=new Map(),factorQuality=new Map();
const qualityCounts=Object.create(null),baseStatusCounts={complete:0,partial:0,trivial:0};
const baseBits={residual:0},finalBits={residual:0};
const byKind=Object.create(null);let batchRowCount=0,baseComplete=0,basePartial=0,baseTrivial=0;
let factorEntries=0,factorExponents=0;
function noteFactors(list){
 for(const f of list){
  assert(Number.isSafeInteger(f.e)&&f.e>0,`invalid exponent for ${f.p}`);
  const p=f.p.toLowerCase(),old=factorQuality.get(p);
  if(old!==undefined)assert.equal(old,f.quality,`factor quality changed for ${p}`);
  factorQuality.set(p,f.quality);qualityCounts[f.quality]=(qualityCounts[f.quality]??0)+1;
  factorEntries++;factorExponents+=f.e;
 }
}

for(const batch of manifest.batches){
 for(const shard of batch.shards){
  const data=readJson(shard.path);assert.equal(data.rows.length,shard.rows,`row count mismatch in ${shard.path}`);
  for(const row of data.rows){
   assert(!rows.has(row.id),`duplicate object ID ${row.id}`);
   assert(['complete','partial','trivial'].includes(row.status),`unknown base status for ${row.id}`);
   const q=hexInt(row.cofactor);
   if(row.status==='complete'){assert.equal(q,1n);baseComplete++}
   else if(row.status==='partial'){assert(q>1n);basePartial++}
   else baseTrivial++;
   noteFactors(row.factors);
   rows.set(row.id,{id:row.id,kind:row.kind,status:row.status,nBits:row.n_bits,baseQ:q,q,factors:row.factors.map(f=>f.quality)});
   batchRowCount++;baseStatusCounts[row.status]=(baseStatusCounts[row.status]??0)+1;
   baseBits.residual+=row.cofactor_bits;
   const k=byKind[row.kind]??={objects:0,base_complete:0,final_complete:0,final_partial:0,trivial:0,base_residual_bits:0,final_residual_bits:0};
   k.objects++;k[`base_${row.status}`]=(k[`base_${row.status}`]??0)+1;k.base_residual_bits+=row.cofactor_bits;
  }
 }
}
assert.equal(batchRowCount,manifest.indexed_nodes);
assert.equal(rows.size,manifest.indexed_nodes);

let overlayRows=0,overlayObjects=0;
for(const refFile of manifest.refinements??[]){
 const data=readJson(refFile.path);assert.equal(data.rows.length,refFile.rows,`row count mismatch in ${refFile.path}`);
 for(const ref of data.rows){
  const row=rows.get(ref.id);assert(row,`overlay references unindexed object ${ref.id}`);
  assert.equal(row.q,hexInt(ref.old_cofactor),`overlay chain mismatch for ${ref.id} in ${refFile.id}`);
  assert.equal(product(ref.factors)*hexInt(ref.remaining),row.q,`overlay factor product mismatch for ${ref.id}`);
  assert.equal(ref.unresolved_parts.map(hexInt).reduce((a,b)=>a*b,1n),hexInt(ref.remaining),`overlay cofactor partition mismatch for ${ref.id}`);
  noteFactors(ref.factors);row.factors.push(...ref.factors.map(f=>f.quality));row.q=hexInt(ref.remaining);
  overlayRows++;if(!row.overlayCount)overlayObjects++;row.overlayCount=(row.overlayCount??0)+1;
 }
}

const finalCounts={complete:0,partial:0,trivial:0,proven_prime_only_complete:0,complete_with_probable_prime:0,complete_with_other_factor_quality:0};
for(const row of rows.values()){
 const finalStatus=row.status==='trivial'?'trivial':row.q===1n?'complete':'partial';
 finalCounts[finalStatus]++;
 const kinds=byKind[row.kind];
 kinds[`final_${finalStatus}`]=(kinds[`final_${finalStatus}`]??0)+1;
 finalBits.residual+=bitLength(row.q);
 const hadNonPrime64=row.factors.some(q=>q!=='prime64');
 if(finalStatus==='complete'&&row.status!=='trivial'){
  assert(row.factors.length>0,`nontrivial complete object has no factor entries: ${row.id}`);
  if(!hadNonPrime64)finalCounts.proven_prime_only_complete++;
  else if(row.factors.includes('probable-prime')&&!row.factors.some(q=>q!=='prime64'&&q!=='probable-prime'))finalCounts.complete_with_probable_prime++;
  else finalCounts.complete_with_other_factor_quality++;
 }
 kinds.final_residual_bits+=bitLength(row.q);
}
assert.equal(finalCounts.complete+finalCounts.partial+finalCounts.trivial,manifest.indexed_nodes);
assert.equal(finalCounts.proven_prime_only_complete+finalCounts.complete_with_probable_prime+finalCounts.complete_with_other_factor_quality,finalCounts.complete);
assert.equal(baseComplete+basePartial+baseTrivial,manifest.indexed_nodes);
assert.equal(overlayRows,(manifest.refinements??[]).reduce((n,x)=>n+x.rows,0));
assert(finalCounts.complete>=baseComplete,'refinements cannot make a complete object partial');

const indexedFactorSet=new Map();let factorIndexEntries=0,factorIndexDuplicateEntries=0;
for(const shard of manifest.index.shards){
 const data=readJson(shard.path);assert.equal(data.factors.length,shard.count,`factor index row mismatch in ${shard.path}`);
 for(const f of data.factors){const p=f.p.toLowerCase(),old=indexedFactorSet.get(p);if(old!==undefined){assert.equal(old,f.quality,`factor quality changed across index entries for ${p}`);factorIndexDuplicateEntries++}else indexedFactorSet.set(p,f.quality);factorIndexEntries++}
}
assert.equal(indexedFactorSet.size,manifest.index.distinct_factors);
assert(factorQuality.size<=indexedFactorSet.size,'object rows contain more distinct factors than the inventory index');
for(const [p,q] of factorQuality){assert(indexedFactorSet.has(p),`object factor missing from inventory index: ${p}`);assert.equal(indexedFactorSet.get(p),q,`factor-index quality mismatch for ${p}`)}
const unusedIndexFactorValues=indexedFactorSet.size-factorQuality.size;

const objectPaths=[...new Set(manifest.batches.flatMap(b=>b.shards.map(s=>s.path)))];
const snapshotPaths=[...new Set(manifest.batches.map(b=>b.snapshots).filter(Boolean))];
const factorPaths=[...new Set(manifest.index.shards.map(s=>s.path))];
const refinementPaths=[...new Set((manifest.refinements??[]).map(r=>r.path))];
const inventoryBytes=[...new Set([...objectPaths,...snapshotPaths,...factorPaths,...refinementPaths])].reduce((n,p)=>n+statSync(p).size,0);
assert.equal(inventoryBytes,602202383);
const covered=100*manifest.indexed_nodes/population.total_integrax_candidate_objects;
const completeCoverage=100*finalCounts.complete/population.total_integrax_candidate_objects;
const provenCoverage=100*finalCounts.proven_prime_only_complete/population.total_integrax_candidate_objects;

console.log(JSON.stringify({event:'E0148_FACTOR_COMPLETENESS_AUDIT',experiment:'E0148',manifest_sha256:sha(manifestBytes),e0147_record_run_id:population.run_id,e0147_record_revision:population.revision,e0147_corpus_sha256:population.corpus_sha256,indexed_objects:rows.size,candidate_population:population.total_integrax_candidate_objects,indexed_candidate_coverage_percent:covered,base_status_counts:baseStatusCounts,base_complete_objects:baseComplete,final_status_counts:finalCounts,refinement_rows:overlayRows,refined_objects:overlayObjects,distinct_indexed_factors:indexedFactorSet.size,distinct_factor_values_in_object_rows:factorQuality.size,unused_index_factor_values:unusedIndexFactorValues,factor_index_entries:factorIndexEntries,factor_index_duplicate_entries:factorIndexDuplicateEntries,factor_entries_across_objects:factorEntries,factor_exponent_total:factorExponents,factor_quality_entry_counts:qualityCounts,by_kind:byKind,base_residual_bits_sum_overlapping:baseBits.residual,final_residual_bits_sum_overlapping:finalBits.residual,complete_indexed_object_percent:100*finalCounts.complete/rows.size,proven_prime_only_indexed_object_percent:100*finalCounts.proven_prime_only_complete/rows.size,complete_candidate_population_lower_bound_percent:completeCoverage,proven_prime_candidate_population_lower_bound_percent:provenCoverage,cumulative_inventory_json_bytes:inventoryBytes,archive_bytes:null,interpretation:'Complete means the exact cofactor is 1 after applying every ordered verified refinement overlay. Proven-prime-only requires every stored factor quality to be prime64; probable-prime and other qualities are reported separately. Index shard entries may repeat a factor; repeated entries are counted as storage overhead and reconciled by exact factor value and quality. Distinct index factors absent from all current object factor rows are reported as unused inventory entries. Candidate-population percentages are lower bounds because unindexed candidates have no factorization record. Residual-bit sums overlap in the object hierarchy and are not archive savings; inventory JSON is side information, not a decoder or archive.',nix_version:process.env.NIX_VERSION??null,node_version:process.version,revision:process.env.GITHUB_SHA??null,run_id:Number(process.env.GITHUB_RUN_ID),wall_seconds:(performance.now()-started)/1000,peak_rss_kib:process.resourceUsage().maxRSS}));
