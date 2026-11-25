// Independent BigInt arithmetic interval reference. Brute parsing and sparse model maps.
function oracle(){
 const TOP=(1n<<32n)-1n, HALF=1n<<31n,Q=1n<<30n,TQ=3n*Q;
 function eq(a,b){return a.length===b.length&&a.every((x,i)=>x===b[i])}
 function expansions(rules){const e=Array.from({length:256},(_,i)=>[i]);for(const [a,b] of rules){if(!e[a]||!e[b])throw Error("reference");e.push([...e[a],...e[b]])}return e}
 function compare(a,b){for(let i=0;i<Math.min(a.length,b.length);i++){if(a[i]!==b[i])return a[i]-b[i]}return a.length-b.length}
 function order(e,mode){const ids=e.map((_,i)=>i);if(mode===6||mode===7||mode>=9)ids.sort((a,b)=>compare(e[a],e[b])||a-b);const rank=[];ids.forEach((v,i)=>rank[v]=i);return {ids,rank}}
 function tree(e,mode){const {ids}=order(e,mode),k=e.length,paths=Array.from({length:k},()=>[]),branches=[null];let serial=0;
 function build(lo,hi,depth,path){if(hi-lo===1){const id=ids[lo];paths[id]=path;return k+id}const p=++serial;let cut=lo+Math.floor((hi-lo)/2);if(mode===11&&depth<8){cut=lo;while(cut<hi&&!(e[ids[cut]][0]&(128>>depth)))cut++}if(cut<=lo||cut>=hi)throw Error("tree split");branches[p]=[build(lo,cut,depth+1,[...path,[p,0]]),build(cut,hi,depth+1,[...path,[p,1]])];return p}
 const root=build(0,k,0,[]);if(serial!==k-1)throw Error("tree cardinality");for(let id=0;id<k;id++){let p=root;for(const [q,b] of paths[id]){if(p!==q)throw Error("path");p=branches[q][b]}if(p!==k+id)throw Error("leaf");if(mode===11&&paths[id].slice(0,8).reduce((v,[,b])=>2*v+b,0)!==e[id][0])throw Error("leading digit")}return {paths,branches,root,k}}
 function roots(x,e){const out=[];for(let i=0;i<x.length;){let best=x[i];for(let j=256;j<e.length;j++){const p=e[j];if(p.length>e[best].length&&i+p.length<=x.length&&p.every((v,k)=>x[i+k]===v))best=j}out.push(best);i+=e[best].length}return out}
 function model(k,mode){const w=Math.ceil(Math.log2(k)),stride=2**w,local=new Map(),global=new Map(),tagged=new Map(),deep=new Map();let last=mode>=4?256:0,older=256,oldest=256,previous=k;
 function pair(m,k){return m.get(k)??[1,1]}
 function inc(m,k,b){let c=pair(m,k).slice();c[b]++;if(c[0]+c[1]>=4096)c=c.map(v=>Math.ceil(v/2));m.set(k,c)}
 function tag(p){const key=(older*257+last)*stride+p+1;let z=key>>>0;z^=z>>>16;z=Math.imul(z,0x7feb352d);z^=z>>>15;z=Math.imul(z,0x846ca68b);z^=z>>>16;return [key,z&((1<<21)-1)]}
 function deepTag(p){const context=mode===9||mode>=11?(oldest*257+older)*257+last:previous,key=BigInt(context*stride+p+1);let z=key;z=BigInt.asUintN(64,(z^(z>>30n))*0xbf58476d1ce4e5b9n);z=BigInt.asUintN(64,(z^(z>>27n))*0x94d049bb133111ebn);z^=z>>31n;return [key,Number(z&1048575n)]}
 function weights(p){let [z,o]=pair(local,last*stride+p),n=z+o;if(mode===5){let[g,h]=pair(global,p);return [z*(g+h)+32*g,(n+32)*(g+h)]}if(mode>=7){let[key,slot]=tag(p),e=tagged.get(slot);if(e&&e.key===key){let[a,b]=e.c;[z,n]=[a*n+8*z,(a+b+8)*n]}if(mode>=9){let[key,slot]=deepTag(p),e=deep.get(slot);if(e&&e.key===key){let[a,b]=e.c;let q=Math.max(1,Math.min(4095,Math.floor(z*4096/n)));return[a*4096+8*q,(a+b+8)*4096]}}}return[z,n]}
 function update(p,b){if(mode>=9){let[key,slot]=deepTag(p),e=deep.get(slot),c=e&&e.key===key?e.c.slice():[1,1];c[b]++;if(c[0]+c[1]>=4096)c=c.map(v=>Math.ceil(v/2));deep.set(slot,{key,c})}if(mode>=7){let[key,slot]=tag(p),e=tagged.get(slot);let c=e&&e.key===key?e.c.slice():[1,1];c[b]++;if(c[0]+c[1]>=4096)c=c.map(v=>Math.ceil(v/2));tagged.set(slot,{key,c})}inc(local,last*stride+p,b);if(mode===5)inc(global,p,b)}
 function advance(e,id){if(mode>=9){for(const b of e.slice(-3)){oldest=older;older=last;last=b}}else if(mode>=7&&e.length>=2){older=e.at(-2);last=e.at(-1)}else if(mode>=4){older=last;last=e.at(-1)}previous=id}
 return {w,weights,update,advance}}
 function encode(x,rules,mode){const e=expansions(rules),{rank}=order(e,mode),m=model(e.length,mode),rs=roots(x,e),t=mode>=11?tree(e,mode):null;let lo=0n,hi=TOP,pending=0,bits=[];
 function emit(b){bits.push(b);while(pending>0){bits.push(b^1);pending--}}
 for(const id of rs){let p=1;const path=t?t.paths[id]:Array.from({length:m.w},(_,j)=>{let b=(rank[id]>>(m.w-1-j))&1,q=p;p=2*p+b;return[q,b]});for(const [p,b] of path){let [z,n]=m.weights(p),mid=lo+(hi-lo+1n)*BigInt(z)/BigInt(n);if(b===0)hi=mid-1n;else lo=mid;
 for(;;){if(hi<HALF)emit(0);else if(lo>=HALF){emit(1);lo-=HALF;hi-=HALF}else if(lo>=Q&&hi<TQ){pending++;lo-=Q;hi-=Q}else break;lo*=2n;hi=hi*2n+1n}m.update(p,b)}m.advance(e[id],id)}
 if(rs.length){pending++;emit(lo>=Q?1:0)}while(bits.length%8)bits.push(0);
 const header=[73,88,71,50,mode];let n=BigInt(x.length);for(let j=7;j>=0;j--)header.push(Number(n>>BigInt(8*j)&255n));header.push(rules.length>>8,rules.length&255);for(const [a,b] of rules)header.push(a>>8,a&255,b>>8,b&255);
 const out=Uint8Array.from([...header,...Array.from({length:bits.length/8},(_,i)=>bits.slice(i*8,i*8+8).reduce((a,b)=>a*2+b,0))]);return {archive:out,roots:rs.length}}
 function decode(a){if(a.length<15||[73,88,71,50].some((v,i)=>v!==a[i]))throw Error("header");let mode=a[4],l=0;for(let i=5;i<13;i++)l=l*256+a[i];let count=a[13]*256+a[14],rules=[];for(let i=15;i<15+4*count;i+=4)rules.push([a[i]*256+a[i+1],a[i+2]*256+a[i+3]]);let e=expansions(rules),{ids}=order(e,mode),m=model(e.length,mode),t=mode>=11?tree(e,mode):null,pos=(15+4*count)*8,virtual=0,lo=0n,hi=TOP,code=0n,out=[];
 function bit(){if(pos>=a.length*8){if(++virtual>32)throw Error("padding");return 0n}const b=(a[pos>>3]>>(7-(pos&7)))&1;pos++;return BigInt(b)}
 if(!l)return Uint8Array.of();for(let i=0;i<32;i++)code=2n*code+bit();
 while(out.length<l){let rank=0,p=1;function take(p){let[z,n]=m.weights(p),mid=lo+(hi-lo+1n)*BigInt(z)/BigInt(n),b=code<mid?0:1;if(b===0)hi=mid-1n;else lo=mid;
 for(;;){if(hi<HALF){}else if(lo>=HALF){lo-=HALF;hi-=HALF;code-=HALF}else if(lo>=Q&&hi<TQ){lo-=Q;hi-=Q;code-=Q}else break;lo*=2n;hi=hi*2n+1n;code=2n*code+bit()}m.update(p,b);return b}
 let id;if(t){p=t.root;while(p<t.k)p=t.branches[p][take(p)];id=p-t.k}else{for(let j=0;j<m.w;j++){let b=take(p);rank=rank*2+b;p=p*2+b}if(rank>=ids.length)throw Error("invalid rank");id=ids[rank]}const expansion=e[id];out.push(...expansion);m.advance(expansion,id)}
 if(out.length!==l)throw Error("length");return Uint8Array.from(out)}
 function fixture(l,kind){let state=0x12345678;return Uint8Array.from({length:l},(_,i)=>{state^=state<<13;state^=state>>>17;state^=state<<5;return kind==="constant"?97:kind==="periodic"?[97,98,97,99,97,98,100][i%7]:state&255})}
 function experiment(){const rules=[[97,98],[97,97],[256,97],[98,100],[258,99],[97,98]],rows=[];for(const l of [0,1,7,64,4096])for(const kind of ["constant","periodic","xorshift"])for(let mode=3;mode<=12;mode++){let x=fixture(l,kind),e=encode(x,rules,mode);if(!eq(decode(e.archive),x))throw Error("oracle inverse");rows.push({kind,bytes:l,mode,archive_bytes:e.archive.length,roots:e.roots,byte_equal:true})}return {rules,rows}}
 return {encode,decode,fixture,experiment}
}
export const {encode,decode,fixture,experiment}=oracle();
