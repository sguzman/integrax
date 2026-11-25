//! Global arithmetic DAG, bounded dictionary and streaming root parser.
use std::{cmp::Reverse,collections::{BinaryHeap,HashMap},env,fs::File,io::{self,Read,Write,BufReader,BufWriter,Seek,SeekFrom}};
const MAX_RULES:usize=8192;
const DEFAULT_RULES:usize=1024;
const MAX_EXP:usize=256;
const MAX_SAMPLE:usize=262144;
const MAX_LEN:u64=1_000_000_000;
type Rule=(u16,u16);
fn bad(s:&str)->io::Error{io::Error::new(io::ErrorKind::InvalidData,s)}
fn u16in(r:&mut impl Read)->io::Result<u16>{let mut b=[0;2];r.read_exact(&mut b)?;Ok(u16::from_be_bytes(b))}
fn u64in(r:&mut impl Read)->io::Result<u64>{let mut b=[0;8];r.read_exact(&mut b)?;Ok(u64::from_be_bytes(b))}
fn putvar(w:&mut impl Write,mut n:u64)->io::Result<()>{loop{let b=(n&127)as u8;n>>=7;w.write_all(&[b|if n>0{128}else{0}])?;if n==0{return Ok(())}}}
fn getvar(r:&mut impl Read)->io::Result<u64>{let mut n=0;for i in 0..5{let mut b=[0];r.read_exact(&mut b)?;n|=u64::from(b[0]&127)<<(7*i);if b[0]&128==0{if i>0&&b[0]==0{return Err(bad("noncanonical varint"))}return Ok(n)}}Err(bad("varint overflow"))}
fn write_rules(w:&mut impl Write,rules:&[Rule])->io::Result<()>{w.write_all(&(rules.len()as u16).to_be_bytes())?;for &(a,b) in rules{w.write_all(&a.to_be_bytes())?;w.write_all(&b.to_be_bytes())?}Ok(())}
fn read_rules(r:&mut impl Read)->io::Result<Vec<Rule>>{let n=usize::from(u16in(r)?);if n>MAX_RULES{return Err(bad("rule cap"))}let mut out=Vec::with_capacity(n);for _ in 0..n{out.push((u16in(r)?,u16in(r)?))}Ok(out)}
fn expand(rules:&[Rule])->io::Result<Vec<Vec<u8>>>{let mut nodes:Vec<Vec<u8>>=(0..=255).map(|x|vec![x]).collect();for &(a,b) in rules{let a=usize::from(a);let b=usize::from(b);if a>=nodes.len()||b>=nodes.len(){return Err(bad("forward reference"))}if nodes[a].len()+nodes[b].len()>MAX_EXP{return Err(bad("expansion cap"))}let mut x=nodes[a].clone();x.extend_from_slice(&nodes[b]);nodes.push(x)}Ok(nodes)}
fn train_budget(sample:&[u8],budget:usize)->Vec<Rule>{
 let mut s:Vec<u16>=sample.iter().map(|&x|u16::from(x)).collect();let mut lengths=vec![1usize;256];let mut rules=Vec::new();
 while rules.len()<budget&&s.len()>1{
   let mut counts=HashMap::<Rule,usize>::new();let mut run=1usize;
   for w in s.windows(2){let(a,b)=(w[0],w[1]);if a==b{run+=1;if run%2!=0{continue}}else{run=1}
      if lengths[a as usize]+lengths[b as usize]<=MAX_EXP{*counts.entry((a,b)).or_default()+=1}}
   let best=counts.into_iter().filter(|(_,n)|*n>=2).max_by_key(|(p,n)|(*n,Reverse(*p)));
   let Some(((a,b),count))=best else{break};let id=lengths.len() as u16;let mut out=Vec::with_capacity(s.len()-count);let mut i=0;
   while i<s.len(){if i+1<s.len()&&s[i]==a&&s[i+1]==b{out.push(id);i+=2}else{out.push(s[i]);i+=1}}
   debug_assert_eq!(out.len(),s.len()-count);lengths.push(lengths[a as usize]+lengths[b as usize]);rules.push((a,b));s=out;
 }rules
}
#[cfg(test)]fn train(sample:&[u8])->Vec<Rule>{train_budget(sample,DEFAULT_RULES)}
#[derive(Default)]struct Node{edges:Vec<(u8,usize)>,id:Option<u16>}
struct Trie{first:[usize;256],nodes:Vec<Node>,max:usize}
impl Trie{
 fn new(exp:&[Vec<u8>])->Self{let mut t=Self{first:[0;256],nodes:vec![Node::default()],max:1};for i in 0..256{t.first[i]=t.nodes.len();t.nodes.push(Node{id:Some(i as u16),edges:Vec::new()})}
 for(id,x)in exp.iter().enumerate().skip(256){t.max=t.max.max(x.len());let mut p=t.first[x[0]as usize];for &b in &x[1..]{let q=t.nodes[p].edges.iter().find(|&&(v,_)|v==b).map(|&(_,q)|q);p=match q{Some(q)=>q,None=>{let q=t.nodes.len();t.nodes.push(Node::default());t.nodes[p].edges.push((b,q));q}}}if t.nodes[p].id.is_none(){t.nodes[p].id=Some(id as u16)}}
 for n in &mut t.nodes{n.edges.sort_unstable_by_key(|e|e.0)}t}
 fn matches(&self,x:&[u8],mut visit:impl FnMut(u16,usize)){let mut p=self.first[x[0]as usize];visit(x[0]as u16,1);for(i,&b)in x.iter().take(self.max).enumerate().skip(1){let edges=&self.nodes[p].edges;let Ok(j)=edges.binary_search_by_key(&b,|e|e.0)else{break};p=edges[j].1;if let Some(id)=self.nodes[p].id{visit(id,i+1)}}}
 fn longest(&self,x:&[u8])->(u16,usize){let mut best=(x[0]as u16,1);self.matches(x,|id,n|best=(id,n));best}
}
fn parse(r:impl Read,t:&Trie,mut emit:impl FnMut(u16)->io::Result<()>)->io::Result<u64>{
 parse_choose(r,t,|x|{let(id,n)=t.longest(x);emit(id)?;Ok(n)})
}
fn parse_choose(mut r:impl Read,t:&Trie,mut choose:impl FnMut(&[u8])->io::Result<usize>)->io::Result<u64>{
 let mut buf=vec![0;65536+t.max];let mut end=0;let mut len=0u64;
 loop{let n=r.read(&mut buf[end..])?;end+=n;let eof=n==0;let mut p=0;while p<end&&(eof||end-p>=t.max){let k=choose(&buf[p..end])?;if k==0||k>end-p{return Err(bad("invalid parse length"))}p+=k;len+=k as u64;if len>MAX_LEN{return Err(bad("input cap"))}}
 if eof{return Ok(len)}buf.copy_within(p..end,0);end-=p;}
}
#[derive(Clone,Copy)]enum HNode{Leaf(u16),Branch(usize,usize)}
struct Huff{nodes:Vec<HNode>,root:Option<usize>,codes:Vec<(u64,u8)>}
fn huff(freq:&[u64])->io::Result<Huff>{
 let mut heap=BinaryHeap::new();let mut nodes=Vec::new();for(i,&f)in freq.iter().enumerate(){if f>0{let n=nodes.len();nodes.push(HNode::Leaf(i as u16));heap.push(Reverse((f,i,n)))}}
 while heap.len()>1{let Reverse((a,i,x))=heap.pop().unwrap();let Reverse((b,j,y))=heap.pop().unwrap();let n=nodes.len();nodes.push(HNode::Branch(x,y));heap.push(Reverse((a.checked_add(b).ok_or_else(||bad("frequency overflow"))?,i.min(j),n)))}
 let root=heap.pop().map(|Reverse((_,_,n))|n);let mut codes=vec![(0,0);freq.len()];
 if let Some(r)=root{let mut stack=vec![(r,0u64,0u8)];while let Some((n,c,w))=stack.pop(){match nodes[n]{HNode::Leaf(id)=>codes[id as usize]=(c,w),HNode::Branch(a,b)=>{if w>=63{return Err(bad("code depth"))}stack.push((b,c*2+1,w+1));stack.push((a,c*2,w+1));}}}}
 Ok(Huff{nodes,root,codes})
}
struct Out<W:Write>{w:W,b:u8,n:u8}
impl<W:Write> Out<W>{fn put(&mut self,c:u64,n:u8)->io::Result<()>{for j in (0..n).rev(){self.b=(self.b<<1)|((c>>j)&1)as u8;self.n+=1;if self.n==8{self.w.write_all(&[self.b])?;self.b=0;self.n=0}}Ok(())}fn finish(mut self)->io::Result<()>{if self.n>0{self.w.write_all(&[self.b<<(8-self.n)])?}self.w.flush()}}
struct In<R:Read>{r:R,b:u8,n:u8}
impl<R:Read> In<R>{fn bit(&mut self)->io::Result<usize>{if self.n==0{let mut b=[0];self.r.read_exact(&mut b)?;self.b=b[0];self.n=8}let z=self.b>>7;self.b<<=1;self.n-=1;Ok(z as usize)}fn get(&mut self,w:u8)->io::Result<usize>{let mut z=0;for _ in 0..w{z=z*2+self.bit()?}Ok(z)}fn finish(mut self)->io::Result<()>{if self.b!=0{return Err(bad("nonzero padding"))}let mut b=[0];if self.r.read(&mut b)?!=0{return Err(bad("trailing bytes"))}Ok(())}}
fn width(n:usize)->u8{(usize::BITS-(n-1).leading_zeros())as u8}
fn encode(input:&str,rules:&[Rule],mode:u8,mut w:impl Write)->io::Result<()>{
 let exp=expand(rules)?;let t=Trie::new(&exp);let mut freq=vec![0u64;exp.len()];let len=parse(BufReader::new(File::open(input)?),&t,|id|{freq[id as usize]+=1;Ok(())})?;
 let roots:u64=freq.iter().sum();let h=huff(&freq)?;let bits:u64=freq.iter().zip(&h.codes).map(|(&n,&(_,b))|n*u64::from(b)).sum();
 w.write_all(b"IXG2")?;w.write_all(&[mode])?;w.write_all(&len.to_be_bytes())?;write_rules(&mut w,rules)?;
 if mode==1{for &n in &freq{putvar(&mut w,n)?}}
 let mut out=Out{w,b:0,n:0};let fixed=width(exp.len());let mut check=vec![0u64;freq.len()];let again=parse(BufReader::new(File::open(input)?),&t,|id|{check[id as usize]+=1;if mode==2{out.put(u64::from(id),16)}else if mode==0{out.put(u64::from(id),fixed)}else{let(c,b)=h.codes[id as usize];out.put(c,b)}})?;
 if again!=len||check!=freq{return Err(bad("input changed during encode"))}out.finish()?;
 eprintln!("MODEL mode={mode} bytes={len} roots={roots} rules={} max_exp={} fixed_bits={} huff_bits={bits}",rules.len(),t.max,roots*u64::from(fixed));Ok(())
}
// Exact weighted shortest path on a bounded input; same archive syntax as streaming modes.
const OPT_CAP:usize=16*1024*1024;
fn shortest(x:&[u8],t:&Trie,exp:&[Vec<u8>],weights:&[u8])->(Vec<u16>,u32){
 let mut cost=vec![0u32;x.len()+1];let mut choice=vec![0u16;x.len()];
 for i in (0..x.len()).rev(){let mut best=(u32::MAX,0u16);t.matches(&x[i..],|id,n|{let key=(cost[i+n]+u32::from(weights[id as usize]),id);if key<best{best=key}});cost[i]=best.0;choice[i]=best.1}
 let mut roots=Vec::new();let mut i=0;while i<x.len(){let id=choice[i];roots.push(id);i+=exp[id as usize].len()}(roots,cost[0])
}
fn hist(roots:&[u16],k:usize)->Vec<u64>{let mut f=vec![0;k];for &id in roots{f[id as usize]+=1}f}
fn varlen(mut n:u64)->u64{let mut w=1;while n>=128{n>>=7;w+=1}w}
fn actual_cost(roots:&[u16],k:usize,n:usize,mode:u8)->io::Result<u64>{let f=hist(roots,k);let mut bytes=15+4*n as u64;
 if mode==0{bytes+=(roots.len()as u64*u64::from(width(k))).div_ceil(8)}else{let h=huff(&f)?;bytes+=f.iter().map(|&v|varlen(v)).sum::<u64>();bytes+=f.iter().zip(&h.codes).map(|(&v,&(_,l))|v*u64::from(l)).sum::<u64>().div_ceil(8)}Ok(bytes)}
fn encode_opt(input:&str,rules:&[Rule],mode:u8,mut w:impl Write)->io::Result<()>{
 let mut x=Vec::new();File::open(input)?.take(OPT_CAP as u64+1).read_to_end(&mut x)?;if x.len()>OPT_CAP{return Err(bad("optimal parse cap"))}
 let exp=expand(rules)?;let t=Trie::new(&exp);let k=exp.len();let mut greedy=Vec::new();let mut i=0;while i<x.len(){let(id,n)=t.longest(&x[i..]);greedy.push(id);i+=n}
 let gsize=actual_cost(&greedy,k,rules.len(),mode)?;let mut best=greedy;let mut bestsize=gsize;
 // Fixed mode has uniform weights. Huffman mode evaluates a small deterministic
 // search over weight models, smoothing every symbol so no legal match is excluded.
 let rounds=if mode==0{1}else{4};let mut current=hist(&best,k);
 for round in 0..rounds{let weights=if mode==0{vec![width(k);k]}else{let f:Vec<_>=current.iter().map(|&n|n+1).collect();huff(&f)?.codes.iter().map(|&(_,l)|l).collect()};
 let(roots,objective)=shortest(&x,&t,&exp,&weights);let size=actual_cost(&roots,k,rules.len(),mode)?;
 eprintln!("OPT round={round} objective_bits={objective} roots={} candidate_bytes={size}",roots.len());
 current=hist(&roots,k);if size<bestsize{bestsize=size;best=roots}}
 let f=hist(&best,k);let h=huff(&f)?;w.write_all(b"IXG2")?;w.write_all(&[mode])?;w.write_all(&(x.len()as u64).to_be_bytes())?;write_rules(&mut w,rules)?;
 if mode==1{for &n in &f{putvar(&mut w,n)?}}
 let mut out=Out{w,b:0,n:0};for id in best{if mode==0{out.put(u64::from(id),width(k))?}else{let(c,n)=h.codes[id as usize];out.put(c,n)?}}out.finish()?;
 eprintln!("OPT_RESULT mode={mode} greedy_bytes={gsize} chosen_bytes={bestsize}");Ok(())
}
// File-backed global weighted shortest path. Blocks are computational only.
const STREAM_BLOCK:usize=1024*1024;
const INF:u64=u64::MAX/4;
fn block_dp(f:&mut (impl Read+Seek),l:u64,a:u64,b:u64,t:&Trie,weights:&[u8],tail:&[u64],choose:bool)->io::Result<(Vec<u64>,Vec<u16>)>{
 let n=(b-a)as usize;let d=t.max;
 let mut x=vec![0; (l.min(b+d as u64-1)-a) as usize];f.seek(SeekFrom::Start(a))?;f.read_exact(&mut x)?;
 let mut costs=vec![INF;n+d];costs[n..].copy_from_slice(tail);let mut choices=if choose{vec![0u16;n]}else{Vec::new()};
 for i in (0..n).rev(){let mut best=(INF,0u16);t.matches(&x[i..],|id,len|{let v=(costs[i+len]+u64::from(weights[id as usize]),id);if v<best{best=v}});if best.0==INF{return Err(bad("no path"))}costs[i]=best.0;if choose{choices[i]=best.1}}
 Ok((costs,choices))
}
struct Boundary{len:u64,block:usize,right:Vec<Vec<u64>>,objective:u64}
fn boundaries(f:&mut (impl Read+Seek),l:u64,t:&Trie,weights:&[u8],block:usize)->io::Result<Boundary>{
 if block==0{return Err(bad("block size"))}let n=l.div_ceil(block as u64)as usize;let mut right=vec![vec![];n];let mut tail=vec![INF;t.max];tail[0]=0;
 for k in (0..n).rev(){let a=k as u64*block as u64;let b=l.min(a+block as u64);let(c,_)=block_dp(f,l,a,b,t,weights,&tail,false)?;right[k]=tail;tail=c[..t.max].to_vec()}
 Ok(Boundary{len:l,block,right,objective:tail[0]})
}
fn boundary_emit(f:&mut (impl Read+Seek),state:&Boundary,t:&Trie,exp:&[Vec<u8>],weights:&[u8],mut emit:impl FnMut(u16)->io::Result<()>)->io::Result<()>{
 let(mut p,mut objective)=(0u64,0u64);
 for(k,tail)in state.right.iter().enumerate(){let a=k as u64*state.block as u64;let b=state.len.min(a+state.block as u64);if p>=b{continue}let(_,choices)=block_dp(f,state.len,a,b,t,weights,tail,true)?;
 while p<b{let id=choices[(p-a)as usize];emit(id)?;p+=exp[id as usize].len()as u64;objective+=u64::from(weights[id as usize]);}}
 if p!=state.len||objective!=state.objective{return Err(bad("boundary path mismatch"))}Ok(())
}
fn freq_cost(f:&[u64],n:usize,mode:u8)->io::Result<u64>{
 let mut size=15+4*n as u64;if mode==0{size+=(f.iter().sum::<u64>()*u64::from(width(f.len()))).div_ceil(8)}else{let h=huff(f)?;size+=f.iter().map(|&v|varlen(v)).sum::<u64>();size+=f.iter().zip(&h.codes).map(|(&v,&(_,l))|v*u64::from(l)).sum::<u64>().div_ceil(8)}Ok(size)
}
fn encode_streamopt(input:&str,rules:&[Rule],mode:u8,mut w:impl Write,block:usize)->io::Result<()>{
 let exp=expand(rules)?;let t=Trie::new(&exp);let k=exp.len();let mut f=BufReader::new(File::open(input)?);let l=f.seek(SeekFrom::End(0))?;if l>MAX_LEN{return Err(bad("input cap"))}f.seek(SeekFrom::Start(0))?;
 let mut best=vec![0u64;k];if parse(&mut f,&t,|id|{best[id as usize]+=1;Ok(())})?!=l{return Err(bad("input changed"))}
 let gsize=freq_cost(&best,rules.len(),mode)?;let mut bestsize=gsize;let mut bestpath:Option<(Boundary,Vec<u8>)>=None;let mut current=best.clone();
 for round in 0..if mode==0{1}else{4}{
 let weights=if mode==0{vec![width(k);k]}else{let sm:Vec<_>=current.iter().map(|&n|n+1).collect();huff(&sm)?.codes.iter().map(|&(_,l)|l).collect()};
 let state=boundaries(&mut f,l,&t,&weights,block)?;let mut counts=vec![0u64;k];boundary_emit(&mut f,&state,&t,&exp,&weights,|id|{counts[id as usize]+=1;Ok(())})?;let size=freq_cost(&counts,rules.len(),mode)?;
 eprintln!("STREAM_OPT round={round} objective_bits={} roots={} candidate_bytes={size}",state.objective,counts.iter().sum::<u64>());
 current=counts.clone();if size<bestsize{bestsize=size;best=counts;bestpath=Some((state,weights))}
 }
 let h=huff(&best)?;w.write_all(b"IXG2")?;w.write_all(&[mode])?;w.write_all(&l.to_be_bytes())?;write_rules(&mut w,rules)?;if mode==1{for &n in &best{putvar(&mut w,n)?}}
 let mut out=Out{w,b:0,n:0};let mut check=vec![0u64;k];let mut emit=|id:u16|{check[id as usize]+=1;if mode==0{out.put(u64::from(id),width(k))}else{let(c,n)=h.codes[id as usize];out.put(c,n)}};
 if let Some((state,weights))=bestpath{boundary_emit(&mut f,&state,&t,&exp,&weights,&mut emit)?}else{f.seek(SeekFrom::Start(0))?;if parse(&mut f,&t,&mut emit)?!=l{return Err(bad("input changed"))}}
 if best!=check{return Err(bad("input changed during encode"))}out.finish()?;
 eprintln!("STREAM_OPT_RESULT mode={mode} greedy_bytes={gsize} chosen_bytes={bestsize} block={block}");Ok(())
}
// Native adaptive binary arithmetic coding of fixed-width root IDs.
const AC_TOP:u64=0xffff_ffff;
const AC_HALF:u64=0x8000_0000;
const AC_Q:u64=0x4000_0000;
const AC_TQ:u64=0xc000_0000;
#[derive(Clone,Copy,Default)]
struct Tagged{tag:u32,counts:[u16;2]}
#[derive(Clone,Copy,Default)]struct DeepTagged{tag:u64,counts:[u16;2]}
const ORDER2_SLOTS:usize=1<<21;
struct RootModel{rows:Vec<[u16;2]>,global:Vec<[u16;2]>,order2:Vec<Tagged>,deep:Vec<DeepTagged>,stride:usize,mode:u8,ctx:usize,older:usize,oldest:usize,previous_root:usize}
fn root_order(exp:&[Vec<u8>],mode:u8)->(Vec<u16>,Vec<u16>){
 let mut by_rank:Vec<u16>=(0..exp.len() as u16).collect();
 if mode==6||mode==7||mode>=9{by_rank.sort_unstable_by(|&a,&b|exp[a as usize].cmp(&exp[b as usize]).then(a.cmp(&b)))}
 let mut rank=vec![0u16;exp.len()];for(i,&id)in by_rank.iter().enumerate(){rank[id as usize]=i as u16}(rank,by_rank)
}
fn slot_index(mut key:u32,mask:usize)->usize{key^=key>>16;key=key.wrapping_mul(0x7feb352d);key^=key>>15;key=key.wrapping_mul(0x846ca68b);key^=key>>16;(key as usize)&mask}
fn increment(c:&mut [u16;2],bit:usize){c[bit]+=1;if u32::from(c[0])+u32::from(c[1])>=4096{c[0]=c[0].div_ceil(2);c[1]=c[1].div_ceil(2)}}
impl RootModel{
 fn new(k:usize,mode:u8)->Self{let stride=1usize<<width(k);Self{rows:vec![[1,1];stride*if mode>=4{257}else{1}],global:if mode==5{vec![[1,1];stride]}else{Vec::new()},order2:if mode>=7{vec![Tagged::default();ORDER2_SLOTS]}else{Vec::new()},deep:if mode>=9{vec![DeepTagged::default();1<<20]}else{Vec::new()},stride,mode,ctx:if mode>=4{256}else{0},older:256,oldest:256,previous_root:k}}
 fn key(&self,p:usize)->u32{((self.older*257+self.ctx)*self.stride+p)as u32+1}
 fn deep_key(&self,p:usize)->u64{let context=if self.mode==9{(self.oldest*257+self.older)*257+self.ctx}else{self.previous_root};(context as u64)*(self.stride as u64)+p as u64+1}
 fn deep_index(&self,key:u64)->usize{let mut z=key;z=(z^(z>>30)).wrapping_mul(0xbf58476d1ce4e5b9);z=(z^(z>>27)).wrapping_mul(0x94d049bb133111eb);z^=z>>31;(z as usize)&(self.deep.len()-1)}
 fn counts(&self,p:usize)->(u64,u64){let c=self.rows[self.ctx*self.stride+p];let z=u64::from(c[0]);let n=z+u64::from(c[1]);
 if self.mode>=7{let key=self.key(p);let e=self.order2[slot_index(key,self.order2.len()-1)];let (mut z,mut n)=if e.tag==key{let a=u64::from(e.counts[0]);let b=a+u64::from(e.counts[1]);(a*n+8*z,(b+8)*n)}else{(z,n)};
 if self.mode>=9{let key=self.deep_key(p);let e=self.deep[self.deep_index(key)];if e.tag==key{
 // Normalize order-two predictive weights to 4096 before the third mixture.
 z=(z*4096/n).clamp(1,4095);n=4096;let a=u64::from(e.counts[0]);let b=a+u64::from(e.counts[1]);return(a*n+8*z,(b+8)*n)}}
 return(z,n)}
 if self.mode!=5{return(z,n)}
 let g=self.global[p];let gz=u64::from(g[0]);let gn=gz+u64::from(g[1]);
 // Local observations plus 32 fractional pseudo-observations from the shared model.
 (z*gn+32*gz,(n+32)*gn)}
 fn update(&mut self,p:usize,bit:usize){if self.mode>=9{let key=self.deep_key(p);let i=self.deep_index(key);let e=&mut self.deep[i];if e.tag!=key{*e=DeepTagged{tag:key,counts:[1,1]}}increment(&mut e.counts,bit)}if self.mode>=7{let key=self.key(p);let i=slot_index(key,self.order2.len()-1);let e=&mut self.order2[i];if e.tag!=key{*e=Tagged{tag:key,counts:[1,1]}}increment(&mut e.counts,bit)}
 increment(&mut self.rows[self.ctx*self.stride+p],bit);if self.mode==5{increment(&mut self.global[p],bit)}}
 fn next(&mut self,last:u8){if self.mode>=4{self.oldest=self.older;self.older=self.ctx;self.ctx=last as usize}}
 fn advance(&mut self,bytes:&[u8]){if self.mode>=9{for &b in &bytes[bytes.len().saturating_sub(3)..]{self.next(b)}}else if self.mode>=7&&bytes.len()>=2{self.older=bytes[bytes.len()-2]as usize;self.ctx=bytes[bytes.len()-1]as usize}else{self.next(*bytes.last().unwrap())}}
 fn advance_root(&mut self,bytes:&[u8],id:usize){self.advance(bytes);self.previous_root=id}
}
struct AEnc<W:Write>{out:Out<W>,lo:u64,hi:u64,pending:u64}
impl<W:Write>AEnc<W>{
 fn emit(&mut self,b:u64)->io::Result<()>{self.out.put(b,1)?;while self.pending>0{self.out.put(b^1,1)?;self.pending-=1}Ok(())}
 fn bit(&mut self,b:usize,zero:u64,total:u64)->io::Result<()>{let mid=self.lo+(self.hi-self.lo+1)*zero/total;if b==0{self.hi=mid-1}else{self.lo=mid}loop{if self.hi<AC_HALF{self.emit(0)?}else if self.lo>=AC_HALF{self.emit(1)?;self.lo-=AC_HALF;self.hi-=AC_HALF}else if self.lo>=AC_Q&&self.hi<AC_TQ{self.pending+=1;self.lo-=AC_Q;self.hi-=AC_Q}else{break}self.lo*=2;self.hi=self.hi*2+1}Ok(())}
 fn finish(mut self,nonempty:bool)->io::Result<()>{if nonempty{self.pending+=1;self.emit(u64::from(self.lo>=AC_Q))?}self.out.finish()}
}
struct ADec<R:Read>{r:R,b:u8,n:u8,pad:u8,lo:u64,hi:u64,code:u64}
impl<R:Read>ADec<R>{
 fn next_bit(&mut self)->io::Result<u64>{if self.n==0{let mut a=[0];if self.r.read(&mut a)?==0{if self.pad==32{return Err(bad("arithmetic padding limit"))}self.pad+=1;return Ok(0)}self.b=a[0];self.n=8}let x=self.b>>7;self.b<<=1;self.n-=1;Ok(u64::from(x))}
 fn init(&mut self)->io::Result<()>{for _ in 0..32{self.code=self.code*2+self.next_bit()?}Ok(())}
 fn bit(&mut self,zero:u64,total:u64)->io::Result<usize>{if self.code<self.lo||self.code>self.hi{return Err(bad("arithmetic interval"))}let mid=self.lo+(self.hi-self.lo+1)*zero/total;let b=usize::from(self.code>=mid);if b==0{self.hi=mid-1}else{self.lo=mid}
 loop{if self.hi<AC_HALF{}else if self.lo>=AC_HALF{self.lo-=AC_HALF;self.hi-=AC_HALF;self.code-=AC_HALF}else if self.lo>=AC_Q&&self.hi<AC_TQ{self.lo-=AC_Q;self.hi-=AC_Q;self.code-=AC_Q}else{break}self.lo*=2;self.hi=self.hi*2+1;self.code=self.code*2+self.next_bit()?}Ok(b)}
}
fn encode_adaptive(input:&str,rules:&[Rule],mode:u8,w:impl Write)->io::Result<()>{
 encode_adaptive_parse(input,rules,mode,w,None)
}
// Encoder-only heuristic: select the lowest current predictive bits per expanded byte.
fn predicted_cost(model:&RootModel,rank:u16,bits:u8)->f64{
 let mut p=1usize;let mut cost=0.0;
 for j in (0..bits).rev(){let b=((rank>>j)&1)as usize;let(z,n)=model.counts(p);let c=if b==0{z}else{n-z};cost-=(c as f64/n as f64).log2();p=p*2+b}cost
}
fn choose_cost(t:&Trie,x:&[u8],rank:&[u16],bits:u8,model:&RootModel,penalty:f64)->(u16,usize){
 let mut best=(x[0]as u16,1usize);let mut score=f64::INFINITY;
 t.matches(x,|id,len|{let v=(predicted_cost(model,rank[id as usize],bits)+penalty)/len as f64;
 if v<score||(v==score&&(len>best.1||(len==best.1&&id<best.0))){best=(id,len);score=v}});best
}
fn encode_adaptive_parse(input:&str,rules:&[Rule],mode:u8,mut w:impl Write,penalty:Option<f64>)->io::Result<()>{
 let exp=expand(rules)?;let t=Trie::new(&exp);let file=File::open(input)?;let l=file.metadata()?.len();if l>MAX_LEN{return Err(bad("input cap"))}
 w.write_all(b"IXG2")?;w.write_all(&[mode])?;w.write_all(&l.to_be_bytes())?;write_rules(&mut w,rules)?;
 let bits=width(exp.len());let(rank,_)=root_order(&exp,mode);let mut model=RootModel::new(exp.len(),mode);let mut enc=AEnc{out:Out{w,b:0,n:0},lo:0,hi:AC_TOP,pending:0};let mut roots=0u64;let mut info=0f64;
 let actual=parse_choose(BufReader::new(file),&t,|x|{let(id,len)=if let Some(p)=penalty{choose_cost(&t,x,&rank,bits,&model,p)}else{t.longest(x)};let mut p=1usize;for j in (0..bits).rev(){let b=((rank[id as usize]>>j)&1)as usize;let(z,n)=model.counts(p);let count=if b==0{z}else{n-z};info-=(count as f64/n as f64).log2();enc.bit(b,z,n)?;model.update(p,b);p=p*2+b}model.advance_root(&exp[id as usize],id as usize);roots+=1;Ok(len)})?;
 if actual!=l{return Err(bad("input changed"))}enc.finish(l!=0)?;eprintln!("ADAPT mode={mode} bytes={l} roots={roots} rules={} ideal_bits={info:.3}",rules.len());Ok(())
}
fn decode_adaptive<R:Read,W:Write>(r:R,w:W,l:u64,exp:&[Vec<u8>],mode:u8)->io::Result<()>{
 decode_adaptive_mirror(r,w,l,exp,mode,None::<io::Sink>)
}
fn decode_adaptive_mirror<R:Read,W:Write,C:Write>(mut r:R,mut w:W,l:u64,exp:&[Vec<u8>],mode:u8,check:Option<C>)->io::Result<()>{
 let mut mirror=check.map(|w|AEnc{out:Out{w,b:0,n:0},lo:0,hi:AC_TOP,pending:0});
 if l==0{let mut b=[0];if r.read(&mut b)?!=0{return Err(bad("empty payload"))}if let Some(m)=mirror{m.finish(false)?}return w.flush()}
 let mut dec=ADec{r,b:0,n:0,pad:0,lo:0,hi:AC_TOP,code:0};dec.init()?;let bits=width(exp.len());let(_,by_rank)=root_order(exp,mode);let mut model=RootModel::new(exp.len(),mode);let mut written=0u64;
 while written<l{let mut p=1usize;let mut id=0usize;for _ in 0..bits{let(z,n)=model.counts(p);let b=dec.bit(z,n)?;if let Some(m)=&mut mirror{m.bit(b,z,n)?}model.update(p,b);p=p*2+b;id=id*2+b}
 if id>=exp.len(){return Err(bad("root id"))}let id=by_rank[id]as usize;written+=exp[id].len()as u64;if written>l{return Err(bad("output length"))}w.write_all(&exp[id])?;model.advance_root(&exp[id],id)}
 if let Some(m)=mirror{m.finish(true)?}w.flush()
}
// Compare canonical arithmetic bytes using a separate, independently positioned reader.
struct Compare<R:Read>{r:R}
impl<R:Read> Write for Compare<R>{
 fn write(&mut self,b:&[u8])->io::Result<usize>{let mut tmp=[0u8;4096];for part in b.chunks(tmp.len()){self.r.read_exact(&mut tmp[..part.len()])?;if part!=&tmp[..part.len()]{return Err(bad("noncanonical arithmetic payload"))}}Ok(b.len())}
 fn flush(&mut self)->io::Result<()>{let mut b=[0];if self.r.read(&mut b)?!=0{return Err(bad("trailing arithmetic payload"))}Ok(())}
}
fn decode_strict(path:&str,w:impl Write)->io::Result<()>{
 let mut r=BufReader::new(File::open(path)?);let mut m=[0;5];r.read_exact(&mut m)?;if &m[..4]!=b"IXG2"||m[4]>10{return Err(bad("header"))}
 if m[4]<3{r.seek(SeekFrom::Start(0))?;return decode(r,w)}
 let l=u64in(&mut r)?;if l>MAX_LEN{return Err(bad("length cap"))}let rules=read_rules(&mut r)?;let exp=expand(&rules)?;
 let offset=r.stream_position()?;let mut check=BufReader::new(File::open(path)?);check.seek(SeekFrom::Start(offset))?;
 decode_adaptive_mirror(r,w,l,&exp,m[4],Some(Compare{r:check}))
}
fn decode(mut r:impl Read,mut w:impl Write)->io::Result<()>{
 let mut m=[0;5];r.read_exact(&mut m)?;if &m[..4]!=b"IXG2"||m[4]>10{return Err(bad("header"))}let l=u64in(&mut r)?;if l>MAX_LEN{return Err(bad("length cap"))}let rules=read_rules(&mut r)?;let exp=expand(&rules)?;if m[4]>=3{return decode_adaptive(r,w,l,&exp,m[4])}let mut freq=vec![0u64;exp.len()];
 let h=if m[4]==1{let mut sum=0u64;for(i,n)in freq.iter_mut().enumerate(){*n=getvar(&mut r)?;sum=sum.checked_add(n.checked_mul(exp[i].len()as u64).ok_or_else(||bad("length overflow"))?).ok_or_else(||bad("length overflow"))?;if sum>l{return Err(bad("frequency length"))}}if sum!=l{return Err(bad("frequency length"))}Some(huff(&freq)?)}else{None};
 let mut bits=In{r,b:0,n:0};let mut written=0u64;while written<l{let id=if let Some(ref h)=h{let mut n=h.root.ok_or_else(||bad("empty huffman tree"))?;loop{match h.nodes[n]{HNode::Leaf(id)=>break id as usize,HNode::Branch(a,b)=>n=if bits.bit()?==0{a}else{b}}}}else{bits.get(if m[4]==2{16}else{width(exp.len())})?};
 if id>=exp.len(){return Err(bad("root id"))}if h.is_some(){if freq[id]==0{return Err(bad("frequency exceeded"))}freq[id]-=1}written+=exp[id].len()as u64;if written>l{return Err(bad("output length"))}w.write_all(&exp[id])?}
 if h.is_some()&&freq.iter().any(|&n|n!=0){return Err(bad("frequency mismatch"))}bits.finish()?;w.flush()
}
fn main()->io::Result<()>{
 let a:Vec<String>=env::args().collect();match a.get(1).map(String::as_str){
 Some("train")if a.len()==4||a.len()==5=>{let budget=if a.len()==5{a[4].parse::<usize>().map_err(|_|bad("invalid rule budget"))?}else{DEFAULT_RULES};if budget>MAX_RULES{return Err(bad("rule budget cap"))}let mut sample=Vec::new();File::open(&a[2])?.take(MAX_SAMPLE as u64+1).read_to_end(&mut sample)?;if sample.len()>MAX_SAMPLE{return Err(bad("training sample cap"))}let rules=train_budget(&sample,budget);let mut w=BufWriter::new(File::create(&a[3])?);write_rules(&mut w,&rules)?;w.flush()?;eprintln!("TRAIN bytes={} rules={}",sample.len(),rules.len());Ok(())},
 Some("cost0"|"cost2"|"cost8"|"adaptive"|"context"|"backoff"|"lexcontext"|"lexorder2"|"order2"|"lexorder3"|"lexprevroot"|"roots"|"fixed"|"huff"|"optfixed"|"opthuff"|"streamoptfixed"|"streamopthuff")if a.len()==5=>{let mut d=BufReader::new(File::open(&a[4])?);let rules=read_rules(&mut d)?;let mut tail=[0];if d.read(&mut tail)?!=0{return Err(bad("trailing dictionary bytes"))}let w=BufWriter::new(File::create(&a[3])?);let mode=match a[1].as_str(){"roots"=>2,"adaptive"=>3,"context"=>4,"backoff"=>5,"lexcontext"=>6,"lexorder2"=>7,"order2"=>8,"lexorder3"=>9,"lexprevroot"=>10,"cost0"|"cost2"|"cost8"=>9,_=>u8::from(a[1].ends_with("huff"))};if a[1].starts_with("cost"){let p=match a[1].as_str(){"cost0"=>0.,"cost2"=>2.,_=>8.};encode_adaptive_parse(&a[2],&rules,mode,w,Some(p))}else if mode>=3{encode_adaptive(&a[2],&rules,mode,w)}else if a[1].starts_with("streamopt"){encode_streamopt(&a[2],&rules,mode,w,STREAM_BLOCK)}else if a[1].starts_with("opt"){encode_opt(&a[2],&rules,mode,w)}else{encode(&a[2],&rules,mode,w)}},
 Some("decode"|"decode-strict")if a.len()==4=>{let w:Box<dyn Write>=if a[3]=="-"{Box::new(io::stdout().lock())}else{Box::new(File::create(&a[3])?)};if a[1]=="decode-strict"{decode_strict(&a[2],BufWriter::new(w))}else{decode(BufReader::new(File::open(&a[2])?),BufWriter::new(w))}},
 _=>Err(bad("usage: ixg2 train SAMPLE DICT [RULE_BUDGET] | cost0|cost2|cost8|adaptive|context|backoff|lexcontext|lexorder2|order2|lexorder3|lexprevroot|roots|fixed|huff|optfixed|opthuff|streamoptfixed|streamopthuff INPUT ARCHIVE DICT | decode|decode-strict ARCHIVE OUTPUT"))}
}
#[cfg(test)]mod tests{use super::*;use std::io::Cursor;
 #[test]fn training_parse(){let x=b"abcabcabcabc".repeat(10000);let rules=train(&x[..65536]);let ex=expand(&rules).unwrap();let t=Trie::new(&ex);let mut y=Vec::new();assert_eq!(parse(Cursor::new(&x),&t,|id|{y.extend_from_slice(&ex[id as usize]);Ok(())}).unwrap(),x.len()as u64);assert_eq!(x,y);}
 #[test]fn roundtrip_modes(){let dir=env::temp_dir().join(format!("ixg2-{}",std::process::id()));std::fs::create_dir_all(&dir).unwrap();let path=dir.join("input");let rules=train(b"abcabcabcabcabcabc");for x in [vec![],vec![7;10000],b"abcabc\0xyz".repeat(10000),(0..=255).collect()]{std::fs::write(&path,&x).unwrap();for m in 0..=2{let mut a=Vec::new();encode(path.to_str().unwrap(),&rules,m,&mut a).unwrap();if m==2{assert_eq!(decode(&a[..],&mut Vec::new()).unwrap(),());let mut y=Vec::new();decode(&a[..],&mut y).unwrap();assert_eq!(x,y);let mut b=a.clone();b.push(0);assert!(decode(&b[..],io::sink()).is_err());assert!(decode(&a[..a.len()-1],io::sink()).is_err());continue}let mut opt=Vec::new();encode_opt(path.to_str().unwrap(),&rules,m,&mut opt).unwrap();assert!(opt.len()<=a.len());let mut streamed=Vec::new();encode_streamopt(path.to_str().unwrap(),&rules,m,&mut streamed,4096).unwrap();assert_eq!(opt,streamed);let mut y=Vec::new();decode(&opt[..],&mut y).unwrap();assert_eq!(x,y);y.clear();decode(&a[..],&mut y).unwrap();assert_eq!(x,y);let mut b=a.clone();b.push(0);assert!(decode(&b[..],io::sink()).is_err());assert!(decode(&a[..a.len()-1],io::sink()).is_err());}}std::fs::remove_dir_all(dir).unwrap();}
 #[test]fn adaptive_roundtrips(){let dir=env::temp_dir().join(format!("ixg2-adaptive-{}",std::process::id()));std::fs::create_dir_all(&dir).unwrap();let path=dir.join("input");let rules=train(b"abcabcxyz abcabcxyz ".repeat(100).as_slice());let mut state=0x91a2b3c4u32;let random:Vec<u8>=(0..100000).map(|_|{state^=state<<13;state^=state>>17;state^=state<<5;state as u8}).collect();
 for x in [vec![],vec![0],vec![255;100000],(0..=255).collect(),random,b"abcabcxyz ".repeat(10000)]{std::fs::write(&path,&x).unwrap();for m in [3,4,5,6,7,8,9,10]{let mut a=Vec::new();encode_adaptive(path.to_str().unwrap(),&rules,m,&mut a).unwrap();let mut y=Vec::new();decode(&a[..],&mut y).unwrap();assert_eq!(x,y);let mut b=a.clone();b[4]=11;assert!(decode(&b[..],io::sink()).is_err());}}
 std::fs::remove_dir_all(dir).unwrap();}
 #[test]fn backoff_bounds(){
 let mut m=RootModel::new(8448,5);
 for i in 0..20000{let p=1+i%127;let (z,n)=m.counts(p);assert!(z>0&&z<n&&n<=4127*4095);m.update(p,usize::from(i%9!=0));m.next((i%256)as u8)}
 // Both contexts unseen; shared evidence must inform the local prediction.
 let mut m=RootModel::new(256,5);m.next(1);for _ in 0..100{m.update(1,0)}m.next(2);let(z,n)=m.counts(1);assert!(2*z>n);assert_eq!(m.rows[2*m.stride+1],[1,1]);
 }
 #[test]fn ordering_and_suffix(){
 let exp=expand(&[(97,98),(97,97),(97,98)]).unwrap();
 let (rank,ids)=root_order(&exp,6);assert!(rank[257]<rank[256]&&rank[256]<rank[258]);for(i,&id)in ids.iter().enumerate(){assert_eq!(rank[id as usize]as usize,i)}
 let mut m=RootModel::new(256,7);assert_eq!((m.older,m.ctx),(256,256));m.advance(b"a");assert_eq!((m.older,m.ctx),(256,97));m.advance(b"bcd");assert_eq!((m.older,m.ctx),(99,100));m.advance(b"e");assert_eq!((m.older,m.ctx),(100,101));
 for i in 0..20000{let p=1+i%127;let(z,n)=m.counts(p);assert!(z>0&&z<n&&n<=4103*4095);m.update(p,usize::from(i%9!=0));m.next((i%256)as u8)}
 }
 #[test]fn deep_context(){for mode in [9,10]{let mut m=RootModel::new(8448,mode);m.advance_root(b"abcd",100);assert_eq!((m.oldest,m.older,m.ctx,m.previous_root),(98,99,100,100));m.advance_root(b"e",101);assert_eq!((m.oldest,m.older,m.ctx,m.previous_root),(99,100,101,101));for i in 0..20000{let p=1+i%127;let(z,n)=m.counts(p);assert!(z>0&&z<n&&n<=4104*4096);m.update(p,usize::from(i%9!=0));if i%3==0{m.advance_root(b"ef",(i%8448)as usize)}}}}
 #[test]fn cost_parse_roundtrip(){let dir=env::temp_dir().join(format!("ixg2-cost-{}",std::process::id()));std::fs::create_dir_all(&dir).unwrap();let path=dir.join("input");let rules=[(97,98),(256,97),(97,97),(99,100),(258,257)];let x=b"abaabcdaaaaababa".repeat(5000);std::fs::write(&path,&x).unwrap();for p in [0.,2.,8.]{let mut a=Vec::new();encode_adaptive_parse(path.to_str().unwrap(),&rules,9,&mut a,Some(p)).unwrap();assert_eq!(a[4],9);let mut y=Vec::new();decode(&a[..],&mut y).unwrap();assert_eq!(x,y)}std::fs::remove_dir_all(dir).unwrap();}
 #[test]fn strict_arithmetic(){let dir=env::temp_dir().join(format!("ixg2-strict-{}",std::process::id()));std::fs::create_dir_all(&dir).unwrap();let input=dir.join("input");let archive=dir.join("archive");let rules=[(97,98),(256,97),(97,97),(99,100),(258,257)];
 for x in [vec![],vec![0],b"abaabcdaaaaababa".repeat(1024)]{std::fs::write(&input,&x).unwrap();for m in 3..=10{let mut a=Vec::new();encode_adaptive(input.to_str().unwrap(),&rules,m,&mut a).unwrap();std::fs::write(&archive,&a).unwrap();let mut y=Vec::new();decode_strict(archive.to_str().unwrap(),&mut y).unwrap();assert_eq!(x,y);
 for extra in [0,255]{let mut b=a.clone();b.push(extra);std::fs::write(&archive,b).unwrap();assert!(decode_strict(archive.to_str().unwrap(),io::sink()).is_err())}
 if !x.is_empty(){// A suffix changed only after the canonical payload must never be accepted.
 let mut b=a.clone();b.extend_from_slice(&[0,0,0,0]);std::fs::write(&archive,b).unwrap();assert!(decode_strict(archive.to_str().unwrap(),io::sink()).is_err());}
 }}std::fs::remove_dir_all(dir).unwrap();}
 #[test]fn shortest_exhaustive(){
 // a,b,c,d,e,f with ab,abc,cd,ef,cdef. Greedy abc + d + ef, optimum ab+cdef.
 let rules=[(97,98),(256,99),(99,100),(101,102),(258,259)];
 let ex=expand(&rules).unwrap();let t=Trie::new(&ex);let w=vec![1;ex.len()];let(root,c)=shortest(b"abcdef",&t,&ex,&w);assert_eq!(root,vec![256,260]);assert_eq!(c,2);
 fn brute(x:&[u8],ex:&[Vec<u8>],w:&[u8])->u32{if x.is_empty(){return 0}ex.iter().enumerate().filter(|(_,p)|x.starts_with(p)).map(|(i,p)|u32::from(w[i])+brute(&x[p.len()..],ex,w)).min().unwrap()}
 let rules=[(97,98),(98,97),(256,97),(257,98),(97,97)];let ex=expand(&rules).unwrap();let t=Trie::new(&ex);let w:Vec<_>=(0..ex.len()).map(|i|(i%7+1)as u8).collect();
 for len in 0..=9{for mask in 0..1usize<<len{let x:Vec<_>=(0..len).map(|i|97+((mask>>i)&1)as u8).collect();let(r,c)=shortest(&x,&t,&ex,&w);assert_eq!(c,brute(&x,&ex,&w));assert_eq!(r.iter().flat_map(|&id|ex[id as usize].iter().copied()).collect::<Vec<_>>(),x)}}
 }
 #[test]fn boundary_exact(){let ex=expand(&[(97,98),(256,97),(98,97),(258,98),(257,259)]).unwrap();let t=Trie::new(&ex);let w:Vec<_>=(0..ex.len()).map(|i|(i%7+1)as u8).collect();for len in 0..=9{for mask in 0..1usize<<len{let x:Vec<_>=(0..len).map(|i|97+((mask>>i)&1)as u8).collect();let (roots,c)=shortest(&x,&t,&ex,&w);for block in [1,2,3,7,16]{let mut f=Cursor::new(&x);let state=boundaries(&mut f,x.len()as u64,&t,&w,block).unwrap();let mut r=Vec::new();boundary_emit(&mut f,&state,&t,&ex,&w,|id|{r.push(id);Ok(())}).unwrap();assert_eq!(state.objective,u64::from(c));assert_eq!(r,roots)}}}}
 #[test]fn budget_prefix(){let x=b"abcd abc ab ac xy ".repeat(200);let a=train_budget(&x,4);let b=train_budget(&x,20);assert_eq!(a,b[..a.len()]);assert!(a.len()<=4&&b.len()<=20);assert!(train_budget(&x,0).is_empty());}
 #[test]fn invalid_rules(){assert!(expand(&[(256,0)]).is_err());let mut r=vec![(0,0)];for i in 0..8{r.push((256+i,256+i))}assert!(expand(&r).is_err());}
}
