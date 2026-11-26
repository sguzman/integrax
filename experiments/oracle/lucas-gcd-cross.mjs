import assert from 'node:assert/strict';
import {createReadStream,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
function lucas(k){
 let a=2n,b=3n;
 for(const bit of k.toString(2)){
  const c=a*a-2n,d=a*b-3n,e=b*b-2n;
  [a,b]=bit==='0'?[c,d]:[d,e];
 }
 return a;
}
let a=2n,b=3n;
for(let k=0;k<=40;k++){assert.equal(lucas(k),a);[a,b]=[b,3n*b-a];}
function parseHex(x){return x.startsWith('-')?-BigInt('0x'+x.slice(1)):BigInt('0x'+x);}
const [path,witness]=process.argv.slice(2),k=720720,m=lucas(k)-2n;
const proof=readFileSync(witness,'utf8'),parts=proof.trim().split('\n');
assert.equal(parts.length,4);
const [expected,d,s,t]=parts.map(parseHex);
let r=0n,bytes=0;
const start=performance.now();
// Independent Lucas doubling and generic Horner reduction with different chunk size.
for await(const buf of createReadStream(path,{highWaterMark:2*1024*1024})){
 r=((r<<BigInt(8*buf.length))+BigInt('0x'+buf.toString('hex')))%m;
 bytes+=buf.length;
}
assert.equal(bytes,1_000_000_000);
assert.equal(r,expected);
assert(r>=0n&&r<m);
assert(d>0n&&d<=m&&r%d===0n&&m%d===0n);
assert.equal(s*r+t*m,d);
assert(d.toString(2).length<=4096);
console.log(JSON.stringify({event:'LUCAS_GCD_VERIFIED',exponent:k,bytes,modulus_bits:m.toString(2).length,gcd_hex:d.toString(16),gcd_bits:d.toString(2).length,residue_sha256:createHash('sha256').update(parts[0]).digest('hex'),witness_sha256:createHash('sha256').update(proof).digest('hex'),seconds:(performance.now()-start)/1000}));
