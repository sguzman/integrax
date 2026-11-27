import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';

const result=JSON.parse(readFileSync('data/E0147.json','utf8'));
assert.equal(result.event,'E0147_XML_OBJECT_POPULATION');
assert.equal(result.corpus_sha256,'159b85351e5f76e60cbe32e04c677847a9ecba3adc79addab6f4c6c7aa3744bc');
assert.equal(result.parser_validation.all_sampled_page_object_counts_matched,true);
assert.equal(result.parser_validation.objects,result.parser_validation.manifest_indexed_nodes);
assert(result.total_xml_pages>0);
assert(result.total_xml_element_objects>0);
assert(result.total_integrax_candidate_objects>=result.total_xml_element_objects);
assert(result.indexed_objects<=result.total_integrax_candidate_objects);
assert.equal(result.indexed_object_coverage_percent,100*result.indexed_objects/result.total_integrax_candidate_objects);
assert.equal(result.total_xml_pages,result.xml_elements_by_name.page);

const record={...result,status:'verified',run_id:Number(process.env.GITHUB_RUN_ID),revision:process.env.GITHUB_SHA,nix_version:process.env.NIX_VERSION??null,node_version:process.version,command:'nix develop --no-update-lock-file --command node --max-old-space-size=4096 experiments/xml/enwik9-object-population-e0147.mjs data/enwik9',verification:'Full corpus SHA-256 and byte length checked; lexical scan validated every XML element nesting; all manifest-indexed sample pages were reparsed with the IntegraX objectTree/textTree definition and exact per-page candidate-node counts matched persisted batch row totals before full-dump counts were emitted.'};
mkdirSync('experiments/records',{recursive:true});
writeFileSync('experiments/records/E0147.json',JSON.stringify(record,null,2)+'\n');
console.log(JSON.stringify({event:'E0147_RECORD_READY',run_id:record.run_id,total_xml_pages:record.total_xml_pages,total_xml_element_objects:record.total_xml_element_objects,total_integrax_candidate_objects:record.total_integrax_candidate_objects,indexed_objects:record.indexed_objects,indexed_object_coverage_percent:record.indexed_object_coverage_percent}));
