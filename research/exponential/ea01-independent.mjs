// Independent Node BigInt reproduction; no dependencies. Executed via JS tool.
function independent() {
  const U=(1n<<128n)-1n,M=(1n<<64n)-1n;
  const bits=x=>x===0n?0:x.toString(2).length, gam=x=>2*bits(x)-1;
  const abs=x=>x<0n?-x:x, raw=w=>gam(BigInt(w))+1+8*w;
  function best(n,w,adj) {
    let winner;
    for(let b=2n;b<=64n;b++){
      for(let p=b,e=1n;p<=U;p*=b,e++){
        if(!adj||p>=n||p*b>n||p*b>U){
          const d=abs(n-p),cost=gam(BigInt(w))+1+gam(b)+gam(e)+1+gam(BigInt(bits(d)+1))+bits(d);
          const c={b,e,d,neg:p>n,cost};
          if(!winner||cost<winner.cost||(cost===winner.cost&&(d<winner.d||(d===winner.d&&(b<winner.b||(b===winner.b&&e<winner.e))))))winner=c;
        }
        if(p>=n)break;
      }
    }return winner;
  }
  const bin=(x,w)=>w===0?"":x.toString(2).padStart(w,"0");
  const gamma=x=>"0".repeat(bits(x)-1)+x.toString(2);
  function encode(n,w,c){
    const ar=Math.ceil(c.cost/8)<Math.ceil(raw(w)/8);
    let s=gamma(BigInt(w))+(ar?"1"+gamma(c.b)+gamma(c.e)+(c.neg?"1":"0")+gamma(BigInt(bits(c.d)+1))+bin(c.d,bits(c.d)):"0"+bin(n,w*8));
    if(s.length!==(ar?c.cost:raw(w)))throw Error("cost");
    s=s.padEnd(Math.ceil(s.length/8)*8,"0");
    return Uint8Array.from(s.match(/.{8}/g).map(x=>parseInt(x,2)));
  }
  function decode(buf){
    const s=Array.from(buf,x=>x.toString(2).padStart(8,"0")).join("");let i=0;
    const get=w=>{if(i+w>s.length)throw Error("short");let x=w?BigInt("0b"+s.slice(i,i+w)):0n;i+=w;return x};
    const g=()=>{let z=0;while(get(1)===0n)z++;return (1n<<BigInt(z))|get(z)};
    const w=Number(g()),mode=get(1);let n;
    if(mode){let b=g(),e=g(),neg=get(1),d=get(Number(g())-1);n=b**e+(neg?-d:d)}else n=get(w*8);
    if(Math.ceil(i/8)!==buf.length||get(s.length-i)!==0n||n<0n||bits(n)>w*8)throw Error("frame");
    return {w,n};
  }
  let seed=0xea010001n;
  function rng(){seed=(seed+0x9e3779b97f4a7c15n)&M;let z=seed;z=((z^(z>>30n))*0xbf58476d1ce4e5b9n)&M;z=((z^(z>>27n))*0x94d049bb133111ebn)&M;return z^(z>>31n)}
  const rows=[];
  for(const w of [2,4,8,16]){
    const mask=(1n<<BigInt(w*8))-1n,random=[],near=[];
    for(let i=0;i<1024;i++)random.push(((rng()<<64n)|rng())&mask);
    for(let b=2n;b<=64n;b++){let p=b;while(p*b<=mask)p*=b;for(const d of [0n,1n,15n,255n]){if(p+d<=mask)near.push(p+d);if(p>=d)near.push(p-d)}}
    for(const [group,inputs] of [["uniform",random],["near_power",near]]){
      let packed=0,wins=0,aw=0,miss=0,max=0;
      for(const n of inputs){const o=best(n,w,false),a=best(n,w,true),buf=encode(n,w,o),v=decode(buf);if(v.n!==n||v.w!==w||o.cost>a.cost)throw Error("roundtrip");packed+=buf.length;wins+=Number(buf.length<w);aw+=Number(Math.ceil(a.cost/8)<w);miss+=Number(a.cost>o.cost);max=Math.max(max,w-buf.length)}
      rows.push({group,width_bytes:w,count:inputs.length,input_bytes:inputs.length*w,raw_framed_bytes:inputs.length*Math.ceil(raw(w)/8),packed_archive_bytes:packed,oracle_net_wins:wins,adjacent_net_wins:aw,adjacent_cost_misses:miss,max_saved_bytes:max});
    }
  }return rows;
}
console.log(JSON.stringify(independent(),null,2));
