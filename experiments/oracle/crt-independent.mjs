import {encode,decode,mods,restore} from './crt.mjs';
function study(api){
 function mod(n,m){return (n%m+m)%m}
 function inv(a,m){let b=m,u=1n,v=0n;while(b){const q=a/b;[a,b]=[b,a-q*b];[u,v]=[v,u-q*v]}if(a!==1n)throw Error("not coprime");return mod(u,m)}
 function generic(r,m){const p=m.reduce((a,b)=>a*b,1n);return mod(r.reduce((a,x,i)=>{const q=p/m[i];return a+x*q*inv(q%m[i],m[i])},0n),p)}
 function fixed(n,l){let h=n.toString(16);if(h.length%2)h="0"+h;let a=Uint8Array.from(h.match(/../g),x=>parseInt(x,16));if(a.length>l)throw Error("overflow");let x=new Uint8Array(l);x.set(a,l-a.length);return x}
 function eq(a,b){return a.length===b.length&&a.every((x,i)=>x===b[i])}
 let count=0;
 for(let l=1;l<=16;l++){let m=api.mods(l),p=m.reduce((a,b)=>a*b,1n),n=1n;for(let j=0;j<256;j++){n=mod(n*6364136223846793005n+1442695040888963407n,p);let r=m.map(x=>n%x);if(generic(r,m)!==n||api.restore(r,m)!==n)throw Error("independent CRT");count++}}
 let rows=[];
 for(let l of [64,256,1024,4096]){let m=api.mods(l),S=1n<<BigInt(8*l),B=m[0],r=17n;
 for(let [kind,D] of [["single_modulus",B],["two_moduli",B*(B-1n)],["two_odd_moduli",(B-1n)*(B+1n)]]){let q=(3n*S/4n-r)/D,n=q*D+r;let x=fixed(n,l);if(x[0]<128)throw Error("not full-width");let e=api.encode(x);if(!eq(x,api.decode(e.archive)))throw Error("roundtrip");rows.push({kind,bytes:l,leading_byte:x[0],raw_magnitude_bytes:l,archive_bytes:e.archive.length,choice:e.choice,byte_equal:true})}
 }
 let a=api.encode(fixed(((1n<<512n)*3n/4n)/(api.mods(64)[0]*(api.mods(64)[0]-1n))*(api.mods(64)[0]*(api.mods(64)[0]-1n))+17n,64)).archive;let rejected=0;for(let i=0;i<a.length;i++){let ok=false;try{api.decode(a.slice(0,i));ok=true}catch{}if(ok)throw Error("truncation accepted");rejected++}
 let ok=false;try{api.decode(Uint8Array.from([...a,0]));ok=true}catch{}if(ok)throw Error("trailing accepted");
 return {generic_crt_checks:count,rows,malformed_rejections:rejected+1}
}
console.log(JSON.stringify(study({encode,decode,mods,restore}),null,2));
