// IXC1 fixed three-modulus CRT reference.
function crtStudy(){
 const CAP=16384;
 function v(n){let a=[];do{let z=n%128;n=Math.floor(n/128);a.push(z+(n?128:0))}while(n);return a}
 function read(a,c){let n=0,m=1;for(let i=0;i<5;i++){if(c.i>=a.length)throw Error("truncated");let z=a[c.i++];n+=(z&127)*m;if(z<128){if(i&&z===0)throw Error("noncanonical");return n}m*=128}throw Error("varint")}
 function num(x){let n=0n;for(const z of x)n=(n<<8n)|BigInt(z);return n}
 function mag(n){let h=n.toString(16);if(h.length%2)h="0"+h;return Uint8Array.from(h.match(/../g),z=>parseInt(z,16))}
 function fixed(n,l){if(n===0n)return new Uint8Array(l);let a=mag(n);if(a.length>l)throw Error("range");let x=new Uint8Array(l);x.set(a,l-a.length);return x}
 function eq(a,b){return a.length===b.length&&a.every((z,i)=>z===b[i])}
 function mod(n,m){let r=n%m;return r<0n?r+m:r}
 function mods(l){let k=Math.max(2,Math.ceil((8*l+1)/3)),b=1n<<BigInt(k);return [b,b-1n,b+1n]}
 // B modulo B-1 =1; B modulo B+1=-1; 2 inverse modulo B+1 = (B+2)/2.
 function restore(r,m){let b=m[0],t=mod(r[1]-r[0],m[1]),z=r[0]+b*t,u=mod((r[2]-z)*((b+2n)/2n),m[2]);return z+b*(b-1n)*u}
 function field(n){let a=mag(n);return [...v(a.length),...a]}
 function readField(a,c,max){let n=read(a,c);if(n<1||n>max||n>a.length-c.i||(n>1&&a[c.i]===0))throw Error("magnitude");let z=num(a.slice(c.i,c.i+n));c.i+=n;return z}
 function encode(x){let l=x.length;if(l>CAP)throw Error("cap");let h=[73,88,67,49,...v(l)],raw=Uint8Array.from([...h,0,...x]),best=raw,choice=null;if(!l)return {archive:best,choice};
 let n=num(x),m=mods(l),rs=m.map(b=>n%b);
 // Literal, centered signed magnitude, or equality/difference to earlier residue.
 let fields=[];let choices=[];
 for(let i=0;i<3;i++){let r=rs[i],b=m[i],a=[0,...field(r)],tag=0;
 let z=b-r;if(z>0n){let q=[1,...field(z)];if(q.length<a.length){a=q;tag=1}}
 for(let j=0;j<i;j++){let delta=mod(r-rs[j],b),sign=delta>b/2n?1:0;if(sign)delta=b-delta;
 let q=[2+j*2+sign,...field(delta)];if(q.length<a.length){a=q;tag=q[0]}}
 fields.push(...a);choices.push(tag)}
 let candidate=Uint8Array.from([...h,1,...fields]);if(candidate.length<raw.length){best=candidate;choice={tags:choices,residue_bytes:rs.map(r=>mag(r).length)}}
 return {archive:best,choice,candidate_bytes:candidate.length}}
 function decode(a){if(a.length<6||[73,88,67,49].some((z,i)=>a[i]!==z))throw Error("magic");let c={i:4},l=read(a,c);if(l>CAP||c.i>=a.length)throw Error("length");let mode=a[c.i++];if(mode===0){if(a.length-c.i!==l)throw Error("raw length");return a.slice(c.i)}if(mode!==1||!l)throw Error("mode");
 let m=mods(l),rs=[];for(let i=0;i<3;i++){if(c.i>=a.length)throw Error("tag");let tag=a[c.i++],z=readField(a,c,l+1),r;if(z>=m[i])throw Error("residue size");if(tag===0)r=z;else if(tag===1){if(!z)throw Error("negative zero");r=m[i]-z}else{let j=Math.floor((tag-2)/2);if(j>=i||tag>5||(tag%2&&z===0n))throw Error("reference");r=mod(rs[j]+(tag%2?-z:z),m[i])}rs.push(r)}
 if(c.i!==a.length)throw Error("trailing");let n=restore(rs,m);if(n>=1n<<BigInt(8*l))throw Error("range");return fixed(n,l)}
 function rng(l,seed){let s=seed>>>0;return Uint8Array.from({length:l},()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return s&255})}
 function fixture(l,kind){let m=mods(l),b=m[0],q=num(rng(Math.floor(l/3)-1,12345+l)),s=1n<<BigInt(8*l);
 switch(kind){case"xorshift":return rng(l,12345+l);case"equal_residues":return fixed(1234567n,l);case"two_small":return fixed(q*b*(b-1n)+17n,l);case"near_modulus":return fixed(q*b+ b-7n,l);case"alternating":return Uint8Array.from({length:l},(_,i)=>i%2?85:170);case"text":return Uint8Array.from({length:l},(_,i)=>"Arithmetic residues are charged in full. ".charCodeAt(i%40)||32);}}
 function experiment(){let exhaustive=0;for(let n=0;n<65536;n++){let x=fixed(BigInt(n),2),m=mods(2),r=m.map(z=>BigInt(n)%z);if(restore(r,m)!==BigInt(n)||!eq(x,decode(encode(x).archive)))throw Error("CRT");exhaustive++}
 let rows=[];for(let l of [64,256,1024,4096])for(let kind of ["xorshift","equal_residues","two_small","near_modulus","alternating","text"]){let x=fixture(l,kind),e=encode(x);if(!eq(x,decode(e.archive)))throw Error("roundtrip");rows.push({kind,bytes:l,archive_bytes:e.archive.length,choice:e.choice,candidate_bytes:e.candidate_bytes,byte_equal:true})}
 return {exhaustive,rows}}
 return {encode,decode,experiment,mods,restore}
}
export const {encode,decode,experiment,mods,restore}=crtStudy();
