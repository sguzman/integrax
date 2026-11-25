// Reconstruct E0001 input and archive artifacts from the persisted record.
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {encode,decode} from './near-power.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex');
function seeded(len,seed){let s=seed>>>0;const b=Buffer.alloc(len);for(let i=0;i<len;i++){s^=s<<13;s^=s>>>17;s^=s<<5;b[i]=s&255;}return b;}
function fixed(n,len){let h=n.toString(16);if(h.length%2)h='0'+h;const m=Buffer.from(h,'hex');const b=Buffer.alloc(len);m.copy(b,len-m.length);return b;}
const text=Buffer.from('A short mathematical description is not automatically a shorter lossless encoding. Exact reconstruction requires every necessary bit.\n');
const out=process.argv[2]??'results-local/cross';mkdirSync(out,{recursive:true});
const rows=readFileSync(new URL('../records/E0001.csv',import.meta.url),'utf8').trim().split('\n').slice(1);
for(const row of rows){
    const [kind,l,s,digest,size,archiveDigest]=row.split(',');const len=+l,seed=+s;let input;
    if(kind==='random')input=seeded(len,seed);
    else if(kind==='repeated_text'){input=Buffer.alloc(len);for(let i=0;i<len;i++)input[i]=text[i%text.length];}
    else{
        const n=len/4-1;
        const base=BigInt('0x'+seeded(n,seed).toString('hex'))|(1n<<BigInt(8*n-1));
        input=fixed(base**4n+(kind==='near_power'?123456789n:0n),len);
    }
    const a=encode(input).archive;
    if(hash(input)!==digest||hash(a)!==archiveDigest||a.length!==+size||!decode(a).equals(input))throw Error('record mismatch: '+kind+' '+len);
    const path=out+'/'+kind+'-'+len;
    writeFileSync(path+'.bin',input);writeFileSync(path+'.ix',a);
}
console.log('E0001: all '+rows.length+' original input and archive SHA-256 values reproduced');
