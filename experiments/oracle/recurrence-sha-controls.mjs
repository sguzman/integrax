import {createHash} from 'node:crypto';
import {encode as byteEncode,decode as byteDecode} from './recurrence.mjs';
import {encode as planeEncode,decode as planeDecode} from './bitplane-recurrence.mjs';
function stream(len){const out=Buffer.alloc(len);for(let i=0;i<Math.ceil(len/32);i++){const counter=Buffer.alloc(4);counter.writeUInt32BE(i);const h=createHash('sha256').update('integrax:C06:nonlinear:v1:').update(counter).digest();h.copy(out,i*32);}return out}
const hash=x=>createHash('sha256').update(x).digest('hex');
for(const len of [64,256,1024,4096,16384])for(const [kind,mask] of [['sha256-counter',255],['sha256-ascii',127],['sha256-nibble',15]]){const x=stream(len).map(v=>v&mask);for(const [codec,encode,decode] of [['IXL1',byteEncode,byteDecode],['IXL2',planeEncode,planeDecode]]){const t=performance.now(),e=encode(x),ms=performance.now()-t,d=decode(e.archive);if(!Buffer.from(d).equals(x))throw Error('roundtrip');console.log('SHA_CONTROL '+JSON.stringify({codec,kind,bytes:len,archive_bytes:e.archive.length,sha256:hash(x),archive_sha256:hash(e.archive),decoded_sha256:hash(d),encode_ms:ms,byte_equal:true,degree:e.degree??null,aborted:e.aborted??null,planes:e.planes??null,selected:e.selected??(e.choice!==null)}));}}
console.log('PEAK_RSS '+process.resourceUsage().maxRSS*1024);
