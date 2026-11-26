import assert from 'node:assert/strict';
import {createReadStream, readFileSync} from 'node:fs';

function primesThrough(limit) {
  const composite = new Uint8Array(limit+1);
  const primes = [];
  for (let p=2; p<=limit; p++) {
    if (composite[p]) continue;
    primes.push(BigInt(p));
    for (let j=p*p; j<=limit; j+=p) composite[j]=1;
  }
  return primes;
}
const product = xs => xs.reduce((a,b)=>a*b, 1n);
function step(r, chunk, m) {
  if (!chunk.length) return r;
  return ((r << BigInt(8*chunk.length)) + BigInt('0x'+chunk.toString('hex'))) % m;
}
async function scan(path,m) {
  let r=0n, bytes=0;
  for await (const chunk of createReadStream(path,{highWaterMark:65536})) {
    r=step(r,chunk,m); bytes+=chunk.length;
  }
  return {r,bytes};
}
function primePower(p) {
  let m=p,k=1;
  while(m*p<=1n<<60n) {m*=p;k++;}
  return {m,k};
}
function valuation(p,r,k) {
  if(r===0n) return {exponent:k,exact:false};
  let exponent=0;
  while(r%p===0n) {r/=p;exponent++;}
  return {exponent,exact:true};
}
const primes=primesThrough(997);
assert.equal(primes.length,168);
assert.equal(primes.at(-1),997n);
const M=product(primes);
for(const n of [0n,1n,32n,2n**80n*97n,2n**127n-1n]){
  const hex=n.toString(16).padStart(32,'0');
  const b=Buffer.from(hex.length%2?'0'+hex:hex,'hex');
  for(let k=1;k<=b.length;k++){
    let r=0n;for(let i=0;i<b.length;i+=k)r=step(r,b.subarray(i,i+k),M);
    assert.equal(r,n%M);
  }
}
assert.deepEqual(valuation(2n,32n,60),{exponent:5,exact:true});
assert.deepEqual(valuation(2n,0n,60),{exponent:60,exact:false});
const [path,logPath]=process.argv.slice(2);
assert(path&&logPath,'usage: node factor-survey-cross.mjs CORPUS RUST_LOG');
const log=readFileSync(logPath,'utf8');
assert.match(log,/SURVEY bytes=1000000000 primes_tested=168 max_prime=997 group_count=\d+/);
const {r,bytes}=await scan(path,M);
assert.equal(bytes,1000000000);
const rustGroups=[...log.matchAll(/^GROUP modulus=(\d+) residue=(\d+)$/gm)];
assert(rustGroups.length>0);
assert.equal(product(rustGroups.map(x=>BigInt(x[1]))),M);
for(const [,m,x] of rustGroups)assert.equal(r%BigInt(m),BigInt(x));
const found=primes.filter(p=>r%p===0n);
const rustFactors=[...log.matchAll(/^FACTOR prime=(\d+) exponent=(\d+) exact=(true|false) modulus=(\d+) residue=(\d+)$/gm)];
assert.deepEqual(rustFactors.map(x=>BigInt(x[1])),found);
const powers=found.map(primePower);
if(found.length){
 const {r:pr,bytes:n}=await scan(path,product(powers.map(x=>x.m)));
 assert.equal(n,bytes);
 for(let i=0;i<found.length;i++){
  const p=found[i],{m,k}=powers[i],res=pr%m,v=valuation(p,res,k),f=rustFactors[i];
  assert.equal(BigInt(f[4]),m);assert.equal(BigInt(f[5]),res);
  assert.equal(Number(f[2]),v.exponent);assert.equal(f[3],String(v.exact));
  console.log(JSON.stringify({prime:String(p),...v,modulus:String(m),residue:String(res)}));
 }
}
assert.equal(r%614889782588491410n,528017007621775558n);
assert.equal(r%38655288426304091n,37966219630138036n);
assert.equal(r%97n,44n);
console.log(JSON.stringify({event:'INDEPENDENT_FACTOR_SURVEY_COMPLETE',bytes,primes_tested:primes.length,max_prime:997,group_count:rustGroups.length,factors:found.map(String),e0086_groups_reproduced:true}));
