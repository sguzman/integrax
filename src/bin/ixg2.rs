//! Global arithmetic DAG, bounded dictionary and streaming root parser.
use std::{cmp::Reverse,collections::{BinaryHeap,HashMap},env,fs::File,io::{self,Read,Write,BufReader,BufWriter}};
const MAX_RULES:usize=1024;
const MAX_EXP:usize=256;
const MAX_SAMPLE:usize=65536;
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
fn train(sample:&[u8])->Vec<Rule>{
 let mut s:Vec<u16>=sample.iter().map(|&x|u16::from(x)).collect();let mut lengths=vec![1usize;256];let mut rules=Vec::new();
 while rules.len()<MAX_RULES&&s.len()>1{
   let mut counts=HashMap::<Rule,usize>::new();let mut run=1usize;
   for w in s.windows(2){let(a,b)=(w[0],w[1]);if a==b{run+=1;if run%2!=0{continue}}else{run=1}
      if lengths[a as usize]+lengths[b as usize]<=MAX_EXP{*counts.entry((a,b)).or_default()+=1}}
   let best=counts.into_iter().filter(|(_,n)|*n>=2).max_by_key(|(p,n)|(*n,Reverse(*p)));
   let Some(((a,b),count))=best else{break};let id=lengths.len() as u16;let mut out=Vec::with_capacity(s.len()-count);let mut i=0;
   while i<s.len(){if i+1<s.len()&&s[i]==a&&s[i+1]==b{out.push(id);i+=2}else{out.push(s[i]);i+=1}}
   debug_assert_eq!(out.len(),s.len()-count);lengths.push(lengths[a as usize]+lengths[b as usize]);rules.push((a,b));s=out;
 }rules
}
#[derive(Default)]struct Node{edges:Vec<(u8,usize)>,id:Option<u16>}
struct Trie{first:[usize;256],nodes:Vec<Node>,max:usize}
impl Trie{
 fn new(exp:&[Vec<u8>])->Self{let mut t=Self{first:[0;256],nodes:vec![Node::default()],max:1};for i in 0..256{t.first[i]=t.nodes.len();t.nodes.push(Node{id:Some(i as u16),edges:Vec::new()})}
 for(id,x)in exp.iter().enumerate().skip(256){t.max=t.max.max(x.len());let mut p=t.first[x[0]as usize];for &b in &x[1..]{let q=t.nodes[p].edges.iter().find(|&&(v,_)|v==b).map(|&(_,q)|q);p=match q{Some(q)=>q,None=>{let q=t.nodes.len();t.nodes.push(Node::default());t.nodes[p].edges.push((b,q));q}}}if t.nodes[p].id.is_none(){t.nodes[p].id=Some(id as u16)}}
 for n in &mut t.nodes{n.edges.sort_unstable_by_key(|e|e.0)}t}
 fn matches(&self,x:&[u8],mut visit:impl FnMut(u16,usize)){let mut p=self.first[x[0]as usize];visit(x[0]as u16,1);for(i,&b)in x.iter().take(self.max).enumerate().skip(1){let edges=&self.nodes[p].edges;let Ok(j)=edges.binary_search_by_key(&b,|e|e.0)else{break};p=edges[j].1;if let Some(id)=self.nodes[p].id{visit(id,i+1)}}}
 fn longest(&self,x:&[u8])->(u16,usize){let mut best=(x[0]as u16,1);self.matches(x,|id,n|best=(id,n));best}
}
fn parse(mut r:impl Read,t:&Trie,mut emit:impl FnMut(u16)->io::Result<()>)->io::Result<u64>{
 let mut buf=vec![0;65536+t.max];let mut end=0;let mut len=0u64;
 loop{let n=r.read(&mut buf[end..])?;end+=n;let eof=n==0;let mut p=0;while p<end&&(eof||end-p>=t.max){let(id,k)=t.longest(&buf[p..end]);emit(id)?;p+=k;len+=k as u64;if len>MAX_LEN{return Err(bad("input cap"))}}
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
 let mut out=Out{w,b:0,n:0};let fixed=width(exp.len());let mut check=vec![0u64;freq.len()];let again=parse(BufReader::new(File::open(input)?),&t,|id|{check[id as usize]+=1;if mode==0{out.put(u64::from(id),fixed)}else{let(c,b)=h.codes[id as usize];out.put(c,b)}})?;
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
fn decode(mut r:impl Read,mut w:impl Write)->io::Result<()>{
 let mut m=[0;5];r.read_exact(&mut m)?;if &m[..4]!=b"IXG2"||m[4]>1{return Err(bad("header"))}let l=u64in(&mut r)?;if l>MAX_LEN{return Err(bad("length cap"))}let rules=read_rules(&mut r)?;let exp=expand(&rules)?;let mut freq=vec![0u64;exp.len()];
 let h=if m[4]==1{let mut sum=0u64;for(i,n)in freq.iter_mut().enumerate(){*n=getvar(&mut r)?;sum=sum.checked_add(n.checked_mul(exp[i].len()as u64).ok_or_else(||bad("length overflow"))?).ok_or_else(||bad("length overflow"))?;if sum>l{return Err(bad("frequency length"))}}if sum!=l{return Err(bad("frequency length"))}Some(huff(&freq)?)}else{None};
 let mut bits=In{r,b:0,n:0};let mut written=0u64;while written<l{let id=if let Some(ref h)=h{let mut n=h.root.ok_or_else(||bad("empty huffman tree"))?;loop{match h.nodes[n]{HNode::Leaf(id)=>break id as usize,HNode::Branch(a,b)=>n=if bits.bit()?==0{a}else{b}}}}else{bits.get(width(exp.len()))?};
 if id>=exp.len(){return Err(bad("root id"))}if h.is_some(){if freq[id]==0{return Err(bad("frequency exceeded"))}freq[id]-=1}written+=exp[id].len()as u64;if written>l{return Err(bad("output length"))}w.write_all(&exp[id])?}
 if h.is_some()&&freq.iter().any(|&n|n!=0){return Err(bad("frequency mismatch"))}bits.finish()?;w.flush()
}
fn main()->io::Result<()>{
 let a:Vec<String>=env::args().collect();match a.get(1).map(String::as_str){
 Some("train")if a.len()==4=>{let mut sample=Vec::new();File::open(&a[2])?.take(MAX_SAMPLE as u64+1).read_to_end(&mut sample)?;if sample.len()>MAX_SAMPLE{return Err(bad("training sample cap"))}let rules=train(&sample);let mut w=BufWriter::new(File::create(&a[3])?);write_rules(&mut w,&rules)?;w.flush()?;eprintln!("TRAIN bytes={} rules={}",sample.len(),rules.len());Ok(())},
 Some("fixed"|"huff"|"optfixed"|"opthuff")if a.len()==5=>{let mut d=BufReader::new(File::open(&a[4])?);let rules=read_rules(&mut d)?;let mut tail=[0];if d.read(&mut tail)?!=0{return Err(bad("trailing dictionary bytes"))}let w=BufWriter::new(File::create(&a[3])?);let mode=u8::from(a[1].ends_with("huff"));if a[1].starts_with("opt"){encode_opt(&a[2],&rules,mode,w)}else{encode(&a[2],&rules,mode,w)}},
 Some("decode")if a.len()==4=>{let w:Box<dyn Write>=if a[3]=="-"{Box::new(io::stdout().lock())}else{Box::new(File::create(&a[3])?)};decode(BufReader::new(File::open(&a[2])?),BufWriter::new(w))},
 _=>Err(bad("usage: ixg2 train SAMPLE DICT | fixed|huff|optfixed|opthuff INPUT ARCHIVE DICT | decode ARCHIVE OUTPUT"))}
}
#[cfg(test)]mod tests{use super::*;use std::io::Cursor;
 #[test]fn training_parse(){let x=b"abcabcabcabc".repeat(10000);let rules=train(&x[..65536]);let ex=expand(&rules).unwrap();let t=Trie::new(&ex);let mut y=Vec::new();assert_eq!(parse(Cursor::new(&x),&t,|id|{y.extend_from_slice(&ex[id as usize]);Ok(())}).unwrap(),x.len()as u64);assert_eq!(x,y);}
 #[test]fn roundtrip_modes(){let dir=env::temp_dir().join(format!("ixg2-{}",std::process::id()));std::fs::create_dir_all(&dir).unwrap();let path=dir.join("input");let rules=train(b"abcabcabcabcabcabc");for x in [vec![],vec![7;10000],b"abcabc\0xyz".repeat(10000),(0..=255).collect()]{std::fs::write(&path,&x).unwrap();for m in 0..=1{let mut a=Vec::new();encode(path.to_str().unwrap(),&rules,m,&mut a).unwrap();let mut opt=Vec::new();encode_opt(path.to_str().unwrap(),&rules,m,&mut opt).unwrap();assert!(opt.len()<=a.len());let mut y=Vec::new();decode(&opt[..],&mut y).unwrap();assert_eq!(x,y);y.clear();decode(&a[..],&mut y).unwrap();assert_eq!(x,y);let mut b=a.clone();b.push(0);assert!(decode(&b[..],io::sink()).is_err());assert!(decode(&a[..a.len()-1],io::sink()).is_err());}}std::fs::remove_dir_all(dir).unwrap();}
 #[test]fn shortest_exhaustive(){
 // a,b,c,d,e,f with ab,abc,cd,ef,cdef. Greedy abc + d + ef, optimum ab+cdef.
 let rules=[(97,98),(256,99),(99,100),(101,102),(258,259)];
 let ex=expand(&rules).unwrap();let t=Trie::new(&ex);let w=vec![1;ex.len()];let(root,c)=shortest(b"abcdef",&t,&ex,&w);assert_eq!(root,vec![256,260]);assert_eq!(c,2);
 fn brute(x:&[u8],ex:&[Vec<u8>],w:&[u8])->u32{if x.is_empty(){return 0}ex.iter().enumerate().filter(|(_,p)|x.starts_with(p)).map(|(i,p)|u32::from(w[i])+brute(&x[p.len()..],ex,w)).min().unwrap()}
 let rules=[(97,98),(98,97),(256,97),(257,98),(97,97)];let ex=expand(&rules).unwrap();let t=Trie::new(&ex);let w:Vec<_>=(0..ex.len()).map(|i|(i%7+1)as u8).collect();
 for len in 0..=9{for mask in 0..1usize<<len{let x:Vec<_>=(0..len).map(|i|97+((mask>>i)&1)as u8).collect();let(r,c)=shortest(&x,&t,&ex,&w);assert_eq!(c,brute(&x,&ex,&w));assert_eq!(r.iter().flat_map(|&id|ex[id as usize].iter().copied()).collect::<Vec<_>>(),x)}}
 }
 #[test]fn invalid_rules(){assert!(expand(&[(256,0)]).is_err());let mut r=vec![(0,0)];for i in 0..8{r.push((256+i,256+i))}assert!(expand(&r).is_err());}
}
