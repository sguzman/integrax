import assert from 'node:assert/strict';
import {createReadStream,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
function parseHex(x){return x.startsWith('-')?-BigInt('0x'+x.slice(1)):BigInt('0x'+x);}
function update(r,x,len,k,m){
  let y=(r<<BigInt(8*len))+x;
  y=(y&m)+(y>>k);
  return y>=m?y-m:y;
}
for(const k of [8n,16n,24n,64n]){
 const m=(1n<<k)-1n;
 for(let a=0n;a<m&&a<256n;a++){
  assert.equal(update(a,255n,1,k,m),((a<<8n)+255n)%m);
 }
}
const [path,exp,witness]=process.argv.slice(2);
assert(['720720','12252240','232792560'].includes(exp));
const k=BigInt(exp),m=(1n<<k)-1n;
const proof=readFileSync(witness,'utf8');
const parts=proof.trim().split('\n');
assert.equal(parts.length,4);
const [expected,d,s,t]=parts.map(parseHex);
let r=0n,bytes=0;
const start=performance.now();
// Different chunk widths and independent BigInt shift-and-mask reduction.
for await(const buf of createReadStream(path,{highWaterMark:Number(k)/16})){
 assert(buf.length<=Number(k)/8);
 r=update(r,BigInt('0x'+buf.toString('hex')),buf.length,k,m);
 bytes+=buf.length;
}
assert.equal(bytes,1_000_000_000);
assert.equal(r,expected);
assert(r>=0n&&r<m);
assert(d>0n&&d<=m&&r%d===0n&&m%d===0n);
assert.equal(s*r+t*m,d,'Bezout identity');
assert.equal(d%2n,1n);
assert(d.toString(2).length<=4096);
console.log(JSON.stringify({event:'MERSENNE_GCD_VERIFIED',exponent:Number(k),bytes,gcd_hex:d.toString(16),gcd_bits:d.toString(2).length,residue_sha256:createHash('sha256').update(parts[0]).digest('hex'),witness_sha256:createHash('sha256').update(proof).digest('hex'),seconds:(performance.now()-start)/1000}));
