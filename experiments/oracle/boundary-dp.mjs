// Exact suffix-boundary DP reference; no filesystem or dependencies.
function boundaryStudy(){
const dicts=[
{exp:[[0],[1],[0,1],[0,1,0],[1,0],[1,0,1],[0,0,1,1]],weights:[3,3,5,4,4,6,5]},
{exp:[[0],[1],[0,0],[0,0,0],[1,1],[0,1],[1,0,1,0,1]],weights:[4,5,2,3,2,4,5]},
{exp:[[0],[1],[0,1],[0,1,1],[1,0],[1,0,0],[0,1,1,0,1,0]],weights:[1,1,1,1,1,1,1]}
];
function match(x,i,e){return i+e.length<=x.length&&e.every((v,j)=>x[i+j]===v)}
function block(x,left,right,tail,d){const len=right-left,D=Math.max(...d.exp.map(e=>e.length)),cost=new Array(len+D).fill(Infinity),choices=new Array(len);for(let j=0;j<D;j++)cost[len+j]=tail[j];for(let p=len-1;p>=0;p--){let best=Infinity,id=-1;for(let j=0;j<d.exp.length;j++){const e=d.exp[j];if(!match(x,left+p,e))continue;const c=d.weights[j]+cost[p+e.length];if(c<best){best=c;id=j}}if(id<0)throw Error("missing path");cost[p]=best;choices[p]=id}return {cost,choices}}
function full(x,d){const D=Math.max(...d.exp.map(e=>e.length)),tail=Array(D).fill(Infinity);tail[0]=0;const a=block(x,0,x.length,tail,d),roots=[];for(let p=0;p<x.length;){const id=a.choices[p];roots.push(id);p+=d.exp[id].length}return {cost:a.cost[0],roots}}
function boundary(x,d,B){const D=Math.max(...d.exp.map(e=>e.length)),blocks=Math.ceil(x.length/B),state=Array(blocks);let tail=Array(D).fill(Infinity);tail[0]=0;for(let k=blocks-1;k>=0;k--){const l=k*B,r=Math.min(x.length,l+B);state[k]=tail;tail=block(x,l,r,tail,d).cost.slice(0,D)}const optimal=tail[0],roots=[];let p=0,cost=0;for(let k=0;k<blocks;k++){const l=k*B,r=Math.min(x.length,l+B);if(p>=r)continue;const a=block(x,l,r,state[k],d);while(p<r){const id=a.choices[p-l];roots.push(id);cost+=d.weights[id];p+=d.exp[id].length}}if(p!==x.length||cost!==optimal)throw Error("boundary reconstruction");return {cost,roots}}
let cases=0,comparisons=0,crossings=0;for(const d of dicts)for(let n=0;n<=10;n++)for(let mask=0;mask<2**n;mask++){const x=Array.from({length:n},(_,i)=>(mask>>i)&1),f=full(x,d);cases++;for(const B of [1,2,3,4,7,16]){const b=boundary(x,d,B);if(b.cost!==f.cost||b.roots.join(",")!==f.roots.join(","))throw Error("mismatch");let p=0;for(const id of b.roots){const end=p+d.exp[id].length;if(Math.floor(p/B)!==Math.floor((end-1)/B))crossings++;p=end}comparisons++}}
return {dictionary_count:dicts.length,exhaustive_inputs:cases,block_sizes:[1,2,3,4,7,16],exact_path_comparisons:comparisons,cross_boundary_root_occurrences:crossings}
}
console.log(JSON.stringify(boundaryStudy(),null,2));
