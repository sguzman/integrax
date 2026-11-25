import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {deepStrictEqual} from 'node:assert';
const actual=JSON.parse(execFileSync(process.execPath,['experiments/oracle/exact-rank.mjs'],{encoding:'utf8'}));
const expected=JSON.parse(readFileSync('experiments/records/E0006.json','utf8'));
deepStrictEqual(actual,{exhaustive:expected.exhaustive,malformed:expected.malformed,rows:expected.rows});
console.log('E0006 replay: '+actual.exhaustive+' exhaustive, '+actual.malformed+' malformed, '+actual.rows.length+' larger controls matched exactly');
