//! IXB1: reversible radix context permutation, not a standalone compression claim.
use std::{env,fs,io::{self,Read,Write},fs::File};
const CAP:usize=16*1024*1024;
fn bad(s:&str)->io::Error{io::Error::new(io::ErrorKind::InvalidData,s)}
fn bwt(x:&[u8])->(usize,Vec<u8>){
 let n=x.len();if n==0{return(0,Vec::new())}
 let mut order=vec![0u32;n];let mut rank=vec![0u32;n];let mut next=vec![0u32;n];let mut nr=vec![0u32;n];let mut count=vec![0u32;256];
 for &v in x{count[v as usize]+=1}let mut total=0;for c in &mut count{let old=*c;*c=total;total+=old}
 for (i,&v) in x.iter().enumerate(){let c=&mut count[v as usize];order[*c as usize]=i as u32;*c+=1}
 let mut classes=0usize;for j in 0..n{if j==0||x[order[j]as usize]!=x[order[j-1]as usize]{classes+=1}rank[order[j]as usize]=(classes-1)as u32}
 let mut k=1;while k<n&&classes<n{
  count.resize(classes,0);count.fill(0);
  for &i in &order{let p=(i as usize+n-k)%n;count[rank[p]as usize]+=1}
  total=0;for c in &mut count{let old=*c;*c=total;total+=old}
  for &i in &order{let p=(i as usize+n-k)%n;let c=&mut count[rank[p]as usize];next[*c as usize]=p as u32;*c+=1}
  classes=0;for j in 0..n{let i=next[j]as usize;let prev=if j>0{next[j-1]as usize}else{0};if j==0||(rank[i],rank[(i+k)%n])!=(rank[prev],rank[(prev+k)%n]){classes+=1}nr[i]=(classes-1)as u32}
  std::mem::swap(&mut order,&mut next);std::mem::swap(&mut rank,&mut nr);k*=2;
 }
 // Canonical tie-break: equal rotations in ascending starting position.
 count.resize(classes,0);count.fill(0);for &r in &rank{count[r as usize]+=1}
 total=0;for c in &mut count{let old=*c;*c=total;total+=old}
 for (i,&r) in rank.iter().enumerate(){let c=&mut count[r as usize];order[*c as usize]=i as u32;*c+=1}
 let primary=order.iter().position(|&i|i==0).unwrap();(primary,order.iter().map(|&i|x[(i as usize+n-1)%n]).collect())
}
fn inverse(last:&[u8],primary:usize)->io::Result<Vec<u8>>{
 let n=last.len();if n==0{return if primary==0{Ok(Vec::new())}else{Err(bad("empty primary"))}}if primary>=n{return Err(bad("primary range"))}
 let mut count=[0u32;256];for &b in last{count[b as usize]+=1}let mut total=0;for c in &mut count{let old=*c;*c=total;total+=old}
 let mut lf=vec![0u32;n];for (i,&b) in last.iter().enumerate(){let c=&mut count[b as usize];lf[i]=*c;*c+=1}
 let mut x=vec![0;n];let mut row=primary;for i in (0..n).rev(){x[i]=last[row];row=lf[row]as usize}Ok(x)
}
fn mtf(x:&[u8],inverse:bool)->Vec<u8>{let mut list=[0u8;256];for(i,b)in list.iter_mut().enumerate(){*b=i as u8}x.iter().map(|&b|{let p=if inverse{b as usize}else{list.iter().position(|&v|v==b).unwrap()};let v=list[p];list.copy_within(..p,1);list[0]=v;if inverse{v}else{p as u8}}).collect()}
fn put_var(mut n:usize,out:&mut Vec<u8>){while n>=128{out.push((n as u8&127)|128);n>>=7}out.push(n as u8)}
fn run_encode(x:&[u8])->Vec<u8>{let mut out=Vec::new();let mut i=0;while i<x.len(){if x[i]!=0{out.push(x[i]);i+=1}else{let start=i;while i<x.len()&&x[i]==0{i+=1}out.push(0);put_var(i-start,&mut out)}}out}
fn run_decode(x:&[u8],n:usize)->io::Result<Vec<u8>>{let mut y=Vec::with_capacity(n);let mut i=0;while i<x.len(){let b=x[i];i+=1;if b!=0{if y.len()==n{return Err(bad("run overflow"))}y.push(b)}else{if y.last()==Some(&0){return Err(bad("adjacent zero runs"))}let mut v=0usize;let mut shift=0;loop{let b=*x.get(i).ok_or_else(||bad("truncated run"))?;i+=1;if shift>21{return Err(bad("run cap"))}v|=((b&127)as usize)<<shift;if b<128{if v==0||(shift>0&&b==0){return Err(bad("noncanonical run"))}break}shift+=7}if v>n-y.len(){return Err(bad("run overflow"))}y.resize(y.len()+v,0)}}if y.len()!=n{return Err(bad("length"))}Ok(y)}

const AC_TOP:u64=0xffff_ffff;
const AC_HALF:u64=0x8000_0000;
const AC_Q:u64=0x4000_0000;
const AC_TQ:u64=0xc000_0000;

struct Out<W:Write>{w:W,b:u8,n:u8}
impl<W:Write> Out<W>{fn put(&mut self,c:u64,n:u8)->io::Result<()>{for j in (0..n).rev(){self.b=(self.b<<1)|((c>>j)&1)as u8;self.n+=1;if self.n==8{self.w.write_all(&[self.b])?;self.b=0;self.n=0}}Ok(())}fn finish(mut self)->io::Result<()>{if self.n>0{self.w.write_all(&[self.b<<(8-self.n)])?}self.w.flush()}}

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

fn increment(c:&mut [u16;2],bit:usize){c[bit]+=1;if u32::from(c[0])+u32::from(c[1])>=4096{c[0]=c[0].div_ceil(2);c[1]=c[1].div_ceil(2)}}

// The model only reads already-coded ranks. Bucket 0 is previous rank zero; 8 includes 128..255.
struct RankModel{pairs:Vec<[u16;2]>,flags:Vec<[u16;2]>,runs:Vec<[u16;2]>,context:usize,last:usize,older:usize,deep:Vec<[u16;2]>,deep_flags:Vec<[u16;2]>,deep_runs:Vec<[u16;2]>,mode:u8}
impl RankModel{
 fn new(mode:u8)->Self{let contexts=match mode{5|7|8=>81,6=>256,_=>9};Self{pairs:vec![[1,1];contexts*256],flags:vec![[1,1];contexts],runs:vec![[1,1];contexts*25],context:0,last:0,older:0,deep:if mode>=7{vec![[1,1];729*256]}else{vec![]},deep_flags:if mode==8{vec![[1,1];729]}else{vec![]},deep_runs:if mode==8{vec![[1,1];729*25]}else{vec![]},mode}}
 fn weights(c:&[u16;2])->(u64,u64){(u64::from(c[0]),u64::from(c[0])+u64::from(c[1]))}
 fn put(enc:&mut AEnc<&mut Vec<u8>>,c:&mut [u16;2],b:usize)->io::Result<()>{let(z,n)=Self::weights(c);enc.bit(b,z,n)?;increment(c,b);Ok(())}
 fn get(dec:&mut ADec<&[u8]>,c:&mut [u16;2])->io::Result<usize>{let(z,n)=Self::weights(c);let b=dec.bit(z,n)?;increment(c,b);Ok(b)}
 fn advance(&mut self,b:u8){let bucket=if b==0{0}else{b.ilog2()as usize+1};self.context=match self.mode{5|7|8=>self.last*9+bucket,6=>b as usize,_=>bucket};self.older=self.older%9*9+self.last;self.last=bucket}
 fn deep_index(&self,p:usize)->usize{(self.older/9*81+self.context)*256+p}
 fn rank_weights(&self,p:usize)->(u64,u64){let(z,n)=Self::weights(&self.pairs[self.context*256+p]);if self.mode<7{return(z,n)}let(a,t)=Self::weights(&self.deep[self.deep_index(p)]);let q=(4096*z/n).clamp(1,4095);(a*4096+16*q,(t+16)*4096)}
 fn rank_update(&mut self,p:usize,b:usize){increment(&mut self.pairs[self.context*256+p],b);if self.mode>=7{let i=self.deep_index(p);increment(&mut self.deep[i],b)}}
 fn put_rank(&mut self,enc:&mut AEnc<&mut Vec<u8>>,rank:u8)->io::Result<()>{let mut p=1;for j in (0..8).rev(){let b=((rank>>j)&1)as usize;let(z,n)=self.rank_weights(p);enc.bit(b,z,n)?;self.rank_update(p,b);p=2*p+b}Ok(())}
 fn get_rank(&mut self,dec:&mut ADec<&[u8]>)->io::Result<u8>{let(mut p,mut v)=(1,0u8);for _ in 0..8{let(z,n)=self.rank_weights(p);let b=dec.bit(z,n)?;self.rank_update(p,b);p=2*p+b;v=(v<<1)|b as u8}Ok(v)}
 fn backoff(coarse:&[u16;2],fine:&[u16;2])->(u64,u64){let(z,n)=Self::weights(coarse);let(a,t)=Self::weights(fine);let q=(4096*z/n).clamp(1,4095);(a*4096+16*q,(t+16)*4096)}
 fn put_backoff(enc:&mut AEnc<&mut Vec<u8>>,coarse:&mut[u16;2],fine:&mut[u16;2],b:usize)->io::Result<()>{let(z,n)=Self::backoff(coarse,fine);enc.bit(b,z,n)?;increment(coarse,b);increment(fine,b);Ok(())}
 fn get_backoff(dec:&mut ADec<&[u8]>,coarse:&mut[u16;2],fine:&mut[u16;2])->io::Result<usize>{let(z,n)=Self::backoff(coarse,fine);let b=dec.bit(z,n)?;increment(coarse,b);increment(fine,b);Ok(b)}
 fn put_flag(&mut self,enc:&mut AEnc<&mut Vec<u8>>,b:usize)->io::Result<()>{if self.mode==8{let i=self.deep_index(0)/256;Self::put_backoff(enc,&mut self.flags[self.context],&mut self.deep_flags[i],b)}else{Self::put(enc,&mut self.flags[self.context],b)}}
 fn get_flag(&mut self,dec:&mut ADec<&[u8]>)->io::Result<usize>{if self.mode==8{let i=self.deep_index(0)/256;Self::get_backoff(dec,&mut self.flags[self.context],&mut self.deep_flags[i])}else{Self::get(dec,&mut self.flags[self.context])}}
 fn put_exp(&mut self,enc:&mut AEnc<&mut Vec<u8>>,j:usize,b:usize)->io::Result<()>{if self.mode==8{let i=self.deep_index(0)/256*25+j;Self::put_backoff(enc,&mut self.runs[self.context*25+j],&mut self.deep_runs[i],b)}else{Self::put(enc,&mut self.runs[self.context*25+j],b)}}
 fn get_exp(&mut self,dec:&mut ADec<&[u8]>,j:usize)->io::Result<usize>{if self.mode==8{let i=self.deep_index(0)/256*25+j;Self::get_backoff(dec,&mut self.runs[self.context*25+j],&mut self.deep_runs[i])}else{Self::get(dec,&mut self.runs[self.context*25+j])}}
 fn put_run(&mut self,enc:&mut AEnc<&mut Vec<u8>>,n:usize)->io::Result<()>{let k=n.ilog2()as usize;for j in 0..=k{self.put_exp(enc,j,usize::from(j==k))?}for j in (0..k).rev(){enc.bit((n>>j)&1,1,2)?}Ok(())}
 fn get_run(&mut self,dec:&mut ADec<&[u8]>,remaining:usize)->io::Result<usize>{let mut k=0;while self.get_exp(dec,k)?==0{if k==24{return Err(bad("run exponent"))}k+=1}let mut n=1;for _ in 0..k{n=2*n+dec.bit(1,2)?}if n>remaining{return Err(bad("run length"))}Ok(n)}
}
fn rank_encode(x:&[u8],mode:u8)->io::Result<Vec<u8>>{
 let mut payload=Vec::new();let mut enc=AEnc{out:Out{w:&mut payload,b:0,n:0},lo:0,hi:AC_TOP,pending:0};let mut model=RankModel::new(mode);let mut i=0;
 while i<x.len(){let b=x[i];if mode>=4{model.put_flag(&mut enc,usize::from(b==0))?;if b==0{let start=i;while i<x.len()&&x[i]==0{i+=1}model.put_run(&mut enc,i-start)?;model.advance(0);continue}model.put_rank(&mut enc,b-1)?}else{model.put_rank(&mut enc,b)?}model.advance(b);i+=1}
 enc.finish(!x.is_empty())?;Ok(payload)
}
fn rank_decode(payload:&[u8],n:usize,mode:u8)->io::Result<Vec<u8>>{
 if n==0{return if payload.is_empty(){Ok(vec![])}else{Err(bad("empty payload"))}}
 let mut dec=ADec{r:payload,b:0,n:0,pad:0,lo:0,hi:AC_TOP,code:0};dec.init()?;let mut model=RankModel::new(mode);let mut x=Vec::with_capacity(n);
 while x.len()<n{let b=if mode>=4{let flag=model.get_flag(&mut dec)?;if flag==1{if x.last()==Some(&0){return Err(bad("adjacent arithmetic runs"))}let len=model.get_run(&mut dec,n-x.len())?;x.resize(x.len()+len,0);model.advance(0);continue}model.get_rank(&mut dec)?.checked_add(1).ok_or_else(||bad("rank"))?}else{model.get_rank(&mut dec)?};x.push(b);model.advance(b)}
 if rank_encode(&x,mode)?!=payload{return Err(bad("noncanonical rank payload"))}Ok(x)
}

fn encode(x:&[u8],mode:u8)->io::Result<Vec<u8>>{if x.len()>CAP||mode>8{return Err(bad("cap or mode"))}let(primary,mut last)=bwt(x);if mode>=1{last=mtf(&last,false)}if mode==2{last=run_encode(&last)}else if mode>=3{last=rank_encode(&last,mode)?}let mut out=b"IXB1".to_vec();out.push(mode);out.extend_from_slice(&(x.len()as u64).to_be_bytes());out.extend_from_slice(&(primary as u32).to_be_bytes());out.extend(last);Ok(out)}
fn decode(a:&[u8])->io::Result<Vec<u8>>{if a.len()<17||&a[..4]!=b"IXB1"||a[4]>8{return Err(bad("header"))}let n=u64::from_be_bytes(a[5..13].try_into().unwrap());if n>CAP as u64{return Err(bad("cap"))}let n=n as usize;let p=u32::from_be_bytes(a[13..17].try_into().unwrap())as usize;let mut x=if a[4]==2{run_decode(&a[17..],n)?}else if a[4]>=3{rank_decode(&a[17..],n,a[4])?}else{if a.len()-17!=n{return Err(bad("length"))}a[17..].to_vec()};if a[4]>=1{x=mtf(&x,true)}inverse(&x,p)}
fn read_cap(path:&str,cap:usize)->io::Result<Vec<u8>>{let mut x=Vec::new();File::open(path)?.take(cap as u64+1).read_to_end(&mut x)?;if x.len()>cap{return Err(bad("input cap"))}Ok(x)}

const FULL_CAP:u64=1_000_000_000;
fn encode_blocks(r:impl Read,w:impl Write,len:u64,block:usize)->io::Result<()>{encode_blocks_mode(r,w,len,block,4)}
fn encode_blocks_mode(mut r:impl Read,mut w:impl Write,len:u64,block:usize,mode:u8)->io::Result<()>{
 let compressed_tag=match mode{4=>1u8,7=>2u8,_=>return Err(bad("block mode"))};
 if len>FULL_CAP||block==0||block>CAP{return Err(bad("block cap"))}
 w.write_all(b"IXB2")?;w.write_all(&len.to_be_bytes())?;w.write_all(&(block as u32).to_be_bytes())?;
 let(mut left,mut index)=(len,0usize);
 while left>0{let n=left.min(block as u64)as usize;let mut x=vec![0;n];r.read_exact(&mut x)?;let frame=encode(&x,mode)?;let (tag,payload)=if frame.len()<n{(compressed_tag,frame.as_slice())}else{(0u8,x.as_slice())};w.write_all(&[tag])?;w.write_all(&(payload.len()as u32).to_be_bytes())?;w.write_all(payload)?;eprintln!("BLOCK index={index} bytes={n} tag={tag} payload={}",payload.len());left-=n as u64;index+=1}
 let mut b=[0];if r.read(&mut b)?!=0{return Err(bad("input length changed"))}w.flush()
}
fn decode_blocks(mut r:impl Read,mut w:impl Write)->io::Result<()>{
 let mut h=[0;16];r.read_exact(&mut h)?;if &h[..4]!=b"IXB2"{return Err(bad("block magic"))}let len=u64::from_be_bytes(h[4..12].try_into().unwrap());let block=u32::from_be_bytes(h[12..16].try_into().unwrap())as usize;
 if len>FULL_CAP||block==0||block>CAP{return Err(bad("block cap"))}let mut left=len;
 while left>0{let n=left.min(block as u64)as usize;let mut h=[0;5];r.read_exact(&mut h)?;let k=u32::from_be_bytes(h[1..].try_into().unwrap())as usize;
 if !((h[0]==0&&k==n)||((h[0]==1||h[0]==2)&&(17..n).contains(&k))){return Err(bad("block descriptor"))}let mut payload=vec![0;k];r.read_exact(&mut payload)?;
 if h[0]==0{w.write_all(&payload)?}else{if &payload[..4]!=b"IXB1"||payload[4]!=(if h[0]==1{4}else{7})||u64::from_be_bytes(payload[5..13].try_into().unwrap())!=n as u64{return Err(bad("inner frame"))}let x=decode(&payload)?;if x.len()!=n{return Err(bad("block output length"))}w.write_all(&x)?}left-=n as u64}
 let mut b=[0];if r.read(&mut b)?!=0{return Err(bad("trailing blocks"))}w.flush()
}


type Hist=std::collections::BTreeMap<usize,u64>;
fn hist_bits(h:&Hist)->f64{let total:u64=h.values().sum();if total==0{return 0.0}h.values().map(|&n|n as f64*((total as f64)/(n as f64)).log2()).sum()}
struct RankStats{flags:Vec<Hist>,ranks:Vec<Hist>,exponents:Vec<Hist>,lengths:Vec<Hist>,suffix:u64,zeros:u64,runs:u64,nonzero:u64}
impl RankStats{
 fn new(c:usize)->Self{Self{flags:vec![Hist::new();c],ranks:vec![Hist::new();c],exponents:vec![Hist::new();c],lengths:vec![Hist::new();c],suffix:0,zeros:0,runs:0,nonzero:0}}
 fn sum(h:&[Hist])->f64{h.iter().map(hist_bits).sum()}
 fn add(h:&mut Hist,k:usize){*h.entry(k).or_default()+=1}
}
fn rank_stats(x:&[u8],mode:u8)->RankStats{
 let mut model=RankModel::new(mode);let mut stats=RankStats::new(model.flags.len());let mut i=0;
 while i<x.len(){let b=x[i];let c=model.context;RankStats::add(&mut stats.flags[c],usize::from(b==0));if b==0{let start=i;while i<x.len()&&x[i]==0{i+=1}let n=i-start;let k=n.ilog2()as usize;RankStats::add(&mut stats.exponents[c],k);RankStats::add(&mut stats.lengths[c],n);stats.suffix+=k as u64;stats.zeros+=n as u64;stats.runs+=1;model.advance(0)}else{RankStats::add(&mut stats.ranks[c],b as usize);stats.nonzero+=1;i+=1;model.advance(b)}}
 stats
}
fn diagnose(x:&[u8])->io::Result<()>{
 let (_,last)=bwt(x);let ranks=mtf(&last,false);
 for mode in 4..=6{let st=rank_stats(&ranks,mode);let flags=RankStats::sum(&st.flags);let rank=RankStats::sum(&st.ranks);let exponent=RankStats::sum(&st.exponents);let lengths=RankStats::sum(&st.lengths);let suffix=st.suffix;let empirical=flags+rank+exponent+suffix as f64;let actual=rank_encode(&ranks,mode)?.len()+17;
 println!("DIAG mode={mode} bytes={} zeros={} runs={} nonzero={} flag_bits={flags:.6} rank_bits={rank:.6} exponent_bits={exponent:.6} suffix_bits={suffix} length_bits={lengths:.6} oracle_bits={empirical:.6} archive_bytes={actual}",x.len(),st.zeros,st.runs,st.nonzero);
 }
 Ok(())
}

fn main()->io::Result<()>{let a:Vec<String>=env::args().collect();match a.get(1).map(String::as_str){Some("diagnose")if a.len()==3=>diagnose(&read_cap(&a[2],CAP)?),Some("encode-blocks"|"encode-blocks7")if a.len()==4||a.len()==5=>{let block=if a.len()==5{a[4].parse::<usize>().map_err(|_|bad("block size"))?}else{CAP};if block==0||block>CAP{return Err(bad("block cap"))}let r=File::open(&a[2])?;let len=r.metadata()?.len();if a[1]=="encode-blocks7"{encode_blocks_mode(io::BufReader::new(r),io::BufWriter::new(File::create(&a[3])?),len,block,7)}else{encode_blocks(io::BufReader::new(r),io::BufWriter::new(File::create(&a[3])?),len,block)}},Some("decode-blocks")if a.len()==4=>{let r=io::BufReader::new(File::open(&a[2])?);if a[3]=="-"{decode_blocks(r,io::BufWriter::new(io::stdout().lock()))}else{decode_blocks(r,io::BufWriter::new(File::create(&a[3])?))}},Some("encode")if a.len()==5=>{let m=a[2].parse::<u8>().map_err(|_|bad("mode"))?;fs::write(&a[4],encode(&read_cap(&a[3],CAP)?,m)?)},Some("decode")if a.len()==4=>fs::write(&a[3],decode(&read_cap(&a[2],8*CAP+17)?)?),_=>Err(bad("usage: ixb1 diagnose INPUT | encode MODE INPUT FRAME | decode FRAME OUTPUT | encode-blocks|encode-blocks7 INPUT ARCHIVE [BLOCK_BYTES] | decode-blocks ARCHIVE OUTPUT|-"))}}
#[cfg(test)]mod tests{use super::*;
 fn naive(x:&[u8])->(usize,Vec<u8>){let n=x.len();if n==0{return(0,vec![])}let mut o:Vec<usize>=(0..n).collect();o.sort_by(|&a,&b|(0..n).map(|j|x[(a+j)%n]).cmp((0..n).map(|j|x[(b+j)%n])).then(a.cmp(&b)));(o.iter().position(|&i|i==0).unwrap(),o.iter().map(|&i|x[(i+n-1)%n]).collect())}
 #[test]fn exhaustive(){for n in 0..=8{for mut v in 0..3usize.pow(n){let x:Vec<u8>=(0..n).map(|_|{let b=(v%3)as u8;v/=3;b}).collect();assert_eq!(bwt(&x),naive(&x));for m in 0..3{assert_eq!(decode(&encode(&x,m).unwrap()).unwrap(),x)}}}}
 #[test]fn long(){let mut state=0x12345678u32;let r:Vec<u8>=(0..65537).map(|_|{state^=state<<13;state^=state>>17;state^=state<<5;state as u8}).collect();for x in [vec![0;65537],b"abracadabra".repeat(6000),r]{for m in 0..3{assert_eq!(decode(&encode(&x,m).unwrap()).unwrap(),x)}}}
 #[test]fn arithmetic_ranks(){for x in [vec![],vec![0],vec![255],vec![97;65537],b"abracadabra".repeat(1000),(0..=255).cycle().take(2048).collect()]{for m in 3..=8{let mut a=encode(&x,m).unwrap();assert_eq!(decode(&a).unwrap(),x);a.push(0);assert!(decode(&a).is_err())}}for n in 0..=5{for mut v in 0..3usize.pow(n){let x:Vec<u8>=(0..n).map(|_|{let b=(v%3)as u8;v/=3;b}).collect();for m in 3..=8{assert_eq!(decode(&encode(&x,m).unwrap()).unwrap(),x)}}}}
 #[test]fn rank_context_geometry(){let mut a=RankModel::new(5);let mut b=RankModel::new(6);for (v,c,d) in [(255u8,8,255),(0,72,0),(2,2,2),(4,21,4),(0,27,0)]{a.advance(v);b.advance(v);assert_eq!(a.context,c);assert_eq!(b.context,d)}assert_eq!(a.flags.len(),81);assert_eq!(b.flags.len(),256);}
 #[test]fn rank_backoff_geometry(){let mut m=RankModel::new(7);for (b,c) in [(255u8,8),(0,72),(2,2),(4,21),(0,27)]{m.advance(b);assert_eq!(m.context,c);assert!(m.deep_index(255)<729*256)}let mut m=RankModel::new(7);m.advance(255);m.advance(2);m.advance(4);assert_eq!(m.deep_index(1),(8*81+2*9+3)*256+1);assert_eq!(m.rank_weights(1),(36864,73728));m.rank_update(1,0);let(z,t)=m.rank_weights(1);assert!(z*2>t&&z<t);}
 #[test]fn hierarchical_flags_and_runs(){let mut a=RankModel::new(8);let mut b=RankModel::new(7);for x in [255,2,4,0,3,1]{a.advance(x);b.advance(x);assert_eq!(a.context,b.context);assert_eq!(a.rank_weights(1),b.rank_weights(1));let i=a.deep_index(0)/256;assert!(i<729);assert_eq!(RankModel::backoff(&a.flags[a.context],&a.deep_flags[i]),(36864,73728));}assert_eq!(a.deep_runs.len(),729*25);assert!(b.deep_runs.is_empty());}
 #[test]fn rank_stats_accounting(){let x=[0,0,1,2,0,0,0,3,0];for m in 4..=6{let s=rank_stats(&x,m);assert_eq!((s.zeros,s.runs,s.nonzero,s.suffix),(6,3,3,2));assert_eq!(s.flags.iter().map(|h|h.values().sum::<u64>()).sum::<u64>(),6);assert_eq!(s.lengths.iter().flat_map(|h|h.iter()).map(|(&n,&c)|n as u64*c).sum::<u64>(),6);assert!(RankStats::sum(&s.exponents)<=RankStats::sum(&s.lengths)+1e-9);let e=rank_stats(&[],m);assert_eq!(RankStats::sum(&e.flags),0.0)}let h=Hist::from([(0,2),(1,2)]);assert!((hist_bits(&h)-4.0).abs()<1e-9);}
 #[test]fn block_frames(){let mut x=vec![97;128];x.extend(0..128u8);x.extend(b"end");for b in [1,17,64,128,256]{let mut a=Vec::new();encode_blocks(&x[..],&mut a,x.len()as u64,b).unwrap();let mut y=Vec::new();decode_blocks(&a[..],&mut y).unwrap();assert_eq!(x,y);for cut in [0,1,15,a.len()-1]{assert!(decode_blocks(&a[..cut],io::sink()).is_err())}let mut bad=a.clone();bad.push(0);assert!(decode_blocks(&bad[..],io::sink()).is_err());bad=a.clone();bad[16]=3;assert!(decode_blocks(&bad[..],io::sink()).is_err());bad=a.clone();bad[17..21].copy_from_slice(&u32::MAX.to_be_bytes());assert!(decode_blocks(&bad[..],io::sink()).is_err());}
 let mut a=Vec::new();encode_blocks(&[][..],&mut a,0,128).unwrap();assert_eq!(a.len(),16);decode_blocks(&a[..],io::sink()).unwrap();let mut a=Vec::new();encode_blocks(&x[..],&mut a,x.len()as u64,128).unwrap();assert_eq!(a[16],1);let k=u32::from_be_bytes(a[17..21].try_into().unwrap())as usize;let next=21+k;let k2=u32::from_be_bytes(a[next+1..next+5].try_into().unwrap())as usize;let tail=next+5+k2;assert_eq!(&a[tail..],&[0,0,0,0,3,101,110,100]);let mut bad=a;bad[21+4]=3;assert!(decode_blocks(&bad[..],io::sink()).is_err());}
 #[test]fn hierarchical_blocks(){let mut x=vec![97;128];x.extend(0..128u8);x.extend(b"end");for b in [17,64,128,256]{let mut a=vec![];encode_blocks_mode(&x[..],&mut a,x.len()as u64,b,7).unwrap();let mut y=vec![];decode_blocks(&a[..],&mut y).unwrap();assert_eq!(x,y);let mut bad=a.clone();bad.push(0);assert!(decode_blocks(&bad[..],io::sink()).is_err());if a[16]==2{let mut bad=a.clone();bad[16]=1;assert!(decode_blocks(&bad[..],io::sink()).is_err());bad=a.clone();bad[25]=4;assert!(decode_blocks(&bad[..],io::sink()).is_err());}}let mut a=vec![];encode_blocks_mode(&x[..],&mut a,x.len()as u64,128,7).unwrap();assert_eq!(a[16],2);let k=u32::from_be_bytes(a[17..21].try_into().unwrap())as usize;assert_eq!(a[25],7);let j=21+k;let k2=u32::from_be_bytes(a[j+1..j+5].try_into().unwrap())as usize;assert_eq!(&a[j+5+k2..],&[0,0,0,0,3,101,110,100]);}
 #[test]fn invalid(){for x in [vec![0],vec![0,0],vec![0,129,0],vec![0,2,0,2],vec![0,127]]{assert!(run_decode(&x,4).is_err())}let mut a=encode(b"abc",0).unwrap();a[16]=3;assert!(decode(&a).is_err());}
}
