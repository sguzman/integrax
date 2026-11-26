//! XML lexical span reconnaissance; exact bytes, never XML reserialization.
use std::{collections::BTreeMap,fs::{self,File},io::{BufWriter,Write},time::Instant};
#[derive(Clone,Copy,Debug,PartialEq,Eq)]
enum Kind{Open,Close,Empty,Opaque,Partial}
fn prefix_end(b:&[u8],start:usize,end:&[u8])->Option<usize>{
 b[start..].windows(end.len()).position(|x|x==end).map(|i|start+i+end.len())
}
fn token(b:&[u8],start:usize)->Result<(Kind,usize,&[u8]),String>{
 let x=&b[start..];assert_eq!(x[0],b'<');
 for (prefix,end) in [(b"<!--".as_slice(),b"-->".as_slice()),(b"<![CDATA[",b"]]>"),(b"<?",b"?>")]{
  if x.starts_with(prefix){return Ok(match prefix_end(b,start+prefix.len(),end){Some(e)=>(Kind::Opaque,e,&[]),None=>(Kind::Partial,b.len(),&[])})}
 }
 if x.starts_with(b"<!"){
  // XML dump does not need DTD expansion. Refuse complex declarations rather than guess.
  return Err(format!("unsupported declaration at {start}"));
 }
 let(mut p,mut quote)=(start+1,0u8);
 while p<b.len(){
  let c=b[p];if quote!=0{if c==quote{quote=0}}
  else if c==b'\''||c==b'"'{quote=c}
  else if c==b'>'{break}
  else if c==b'<'{return Err(format!("nested markup at {p}"))}
  p+=1;
 }
 if p==b.len(){return Ok((Kind::Partial,p,&[]))}
 let close=x.starts_with(b"</");let ns=start+if close{2}else{1};
 let mut ne=ns;
 while ne<p&&!b[ne].is_ascii_whitespace()&&b[ne]!=b'/'{ne+=1}
 let name=&b[ns..ne];if name.is_empty()||!name.iter().all(|c|c.is_ascii_alphanumeric()||b"_:.-".contains(c)){return Err(format!("unsupported name at {start}"))}
 let last=b[start+1..p].iter().rfind(|c|!c.is_ascii_whitespace()).copied();
 let k=if close{if b[ne..p].iter().any(|c|!c.is_ascii_whitespace()){return Err(format!("bad close at {start}"))}Kind::Close}else if last==Some(b'/'){Kind::Empty}else{Kind::Open};
 Ok((k,p+1,name))
}
fn bucket(n:usize)->usize{match n{0=>0,1..=8=>1,9..=16=>2,17..=32=>3,33..=64=>4,65..=256=>5,257..=1024=>6,1025..=4096=>7,_=>8}}
#[derive(Default,Debug)]
struct Stat{count:u64,bytes:u64,max:usize,buckets:[u64;9],eligible:u64,samples:Vec<(usize,usize)>}
impl Stat{
 fn add(&mut self,s:usize,e:usize){let n=e-s;self.count+=1;self.bytes+=n as u64;self.max=self.max.max(n);self.buckets[bucket(n)]+=1;
  if (1..=8).contains(&n){self.eligible+=1;
   // Deterministic reservoir sampling, not random or representative by assertion.
   let mut x=self.eligible.wrapping_add(0x9e3779b97f4a7c15);x=(x^(x>>30)).wrapping_mul(0xbf58476d1ce4e5b9);x=(x^(x>>27)).wrapping_mul(0x94d049bb133111eb);x^=x>>31;
   let j=if self.eligible<=16{self.eligible-1}else{x%self.eligible};
   if j<16{if self.samples.len()<16{self.samples.push((s,e))}else{self.samples[j as usize]=(s,e)}}
  }
 }
}
#[derive(Debug)]
struct Frame{name:String,path:String,start:usize,body:usize,children:usize,opaque:bool}
#[derive(Default,Debug)]
struct Profile{stats:BTreeMap<(String,&'static str),Stat>,tokens:u64,markup:u64,text:u64,opaque:u64,partial:u64,max_depth:usize,open_tail:Vec<String>,root_count:u64,complete:u64}
impl Profile{
 fn add(&mut self,path:&str,k:&'static str,s:usize,e:usize){self.stats.entry((path.to_owned(),k)).or_default().add(s,e)}
}
fn scan(b:&[u8],mut out:impl Write)->Result<Profile,String>{
 let(mut p,mut profile,mut stack)=(0,Profile::default(),Vec::<Frame>::new());
 while p<b.len(){
  if b[p]!=b'<'{
   let e=b[p..].iter().position(|&c|c==b'<').map_or(b.len(),|n|p+n);
   out.write_all(&b[p..e]).map_err(|e|e.to_string())?;profile.text+=(e-p)as u64;profile.tokens+=1;p=e;continue
  }
  let(k,e,n)=token(b,p)?;
  out.write_all(&b[p..e]).map_err(|e|e.to_string())?;
  profile.tokens+=1;
  match k{
   Kind::Partial=>{profile.partial+=(e-p)as u64;}
   Kind::Opaque=>{profile.opaque+=(e-p)as u64;if let Some(f)=stack.last_mut(){f.opaque=true}}
   Kind::Open|Kind::Empty=>{
    profile.markup+=(e-p)as u64;
    let name=std::str::from_utf8(n).map_err(|e|e.to_string())?.to_owned();
    let path=if let Some(f)=stack.last_mut(){f.children+=1;format!("{}/{}",f.path,name)}else{profile.root_count+=1;format!("/{name}")};
    profile.max_depth=profile.max_depth.max(stack.len()+1);
    if k==Kind::Empty{profile.add(&path,"element",p,e);profile.add(&path,"leaf-body",e,e);profile.complete+=1}
    else{if stack.len()>=128{return Err("depth cap".into())}stack.push(Frame{name,path,start:p,body:e,children:0,opaque:false});}
   }
   Kind::Close=>{
    profile.markup+=(e-p)as u64;
    let f=stack.pop().ok_or_else(||format!("unexpected close at {p}"))?;
    if f.name.as_bytes()!=n{return Err(format!("mismatch at {p}, expected {}",f.name))}
    profile.add(&f.path,"element",f.start,e);
    if f.children==0&&!f.opaque{profile.add(&f.path,"leaf-body",f.body,p)}
    profile.complete+=1;
   }
  }
  p=e;
 }
 profile.open_tail=stack.into_iter().map(|f|f.path).collect();
 assert_eq!(profile.markup+profile.text+profile.opaque+profile.partial,b.len() as u64);
 out.flush().map_err(|e|e.to_string())?;
 Ok(profile)
}
fn gcd(mut a:u64,mut b:u64)->u64{while b!=0{(a,b)=(b,a%b)}a}
fn mul(a:u64,b:u64,m:u64)->u64{((a as u128*b as u128)%m as u128)as u64}
fn power(mut a:u64,mut e:u64,m:u64)->u64{let mut x=1;while e>0{if e&1!=0{x=mul(x,a,m)}a=mul(a,a,m);e>>=1}x}
fn prime(n:u64)->bool{
 if n<2{return false}
 for p in [2,3,5,7,11,13,17,19,23,29,31,37]{if n%p==0{return n==p}}
 let s=(n-1).trailing_zeros();let d=(n-1)>>s;
 'a:for a in [2u64,325,9375,28178,450775,9780504,1795265022]{
  let a=a%n;if a==0{continue}let mut x=power(a,d,n);if x==1||x==n-1{continue}
  for _ in 1..s{x=mul(x,x,n);if x==n-1{continue 'a}}
  return false
 }true
}
fn rho(n:u64,budget:&mut u32)->Option<u64>{
 for p in [2,3,5,7,11,13,17,19,23,29,31,37]{if n%p==0{return Some(p)}}
 for c in 1..=8u64{
  let f=|x|((mul(x,x,n)as u128+c as u128)%n as u128)as u64;
  let(mut x,mut y)=(2,2);
  for _ in 0..8192{if *budget==0{return None}*budget-=1;x=f(x);y=f(f(y));let d=gcd(x.abs_diff(y),n);if d==n{break}if d>1{return Some(d)}}
 }None
}
fn factor(n:u64,budget:&mut u32,out:&mut Vec<u64>)->bool{
 if n==1{return true}if prime(n){out.push(n);return true}
 if let Some(d)=rho(n,budget){factor(d,budget,out)&&factor(n/d,budget,out)}else{false}
}
fn varlen(mut x:u64)->usize{let mut n=1;while x>=128{x>>=7;n+=1}n}
fn emit_var(mut x:u64,b:&mut Vec<u8>){while x>=128{b.push(x as u8|128);x>>=7}b.push(x as u8)}
fn read_var(b:&mut &[u8])->Option<u64>{let mut x=0u64;for j in 0..10{let (&v,t)=b.split_first()?;*b=t;if j==9&&v>1{return None}x|=((v&127)as u64)<<(7*j);if v<128{return if j>0&&v==0{None}else{Some(x)}}}None}
fn describe(n:u64,fs:&[u64])->Vec<u8>{
 assert!(n>=2);let mut pairs:Vec<(u64,u8)>=Vec::new();
 for &p in fs{if let Some(last)=pairs.last_mut(){if last.0==p{last.1+=1;continue}}pairs.push((p,1))}
 let mut b=vec![pairs.len() as u8];for(p,e)in pairs{emit_var(p,&mut b);b.push(e)}b
}
fn rebuild(mut b:&[u8],width:usize)->Option<Vec<u8>>{
 if !(1..=8).contains(&width){return None}
 let(&k,t)=b.split_first()?;b=t;if k==0||k>64{return None}let(mut n,mut prev)=(1u64,1u64);
 for _ in 0..k{let p=read_var(&mut b)?;let(&e,t)=b.split_first()?;b=t;if p<=prev||e==0||e>64||!prime(p){return None}prev=p;for _ in 0..e{n=n.checked_mul(p)?}}
 if !b.is_empty()||width<8&&n>>(width*8)!=0{return None}Some(n.to_be_bytes()[8-width..].to_vec())
}
fn main()->Result<(),String>{
 let args:Vec<_>=std::env::args().collect();if args.len()!=3{return Err("usage: xml_probe INPUT REBUILT".into())}
 let start=Instant::now();let b=fs::read(&args[1]).map_err(|e|e.to_string())?;
 if b.len()!=1_000_000_000{return Err("corpus length".into())}
 let out=BufWriter::with_capacity(1<<20,File::create(&args[2]).map_err(|e|e.to_string())?);
 let p=scan(&b,out)?;
 println!("XML_PROFILE bytes={} tokens={} markup_bytes={} text_bytes={} opaque_bytes={} partial_markup_bytes={} max_depth={} roots={} complete_elements={} open_tail={} scan_s={:.6}",b.len(),p.tokens,p.markup,p.text,p.opaque,p.partial,p.max_depth,p.root_count,p.complete,p.open_tail.join(","),start.elapsed().as_secs_f64());
 let(mut tested,mut done,mut wins,mut savings,mut censored,mut trivial)=(0,0,0,0,0,0);
 let start=Instant::now();
 for ((path,kind),s) in &p.stats{
  println!("SPAN path={path} kind={kind} count={} bytes={} max={} buckets={} eligible={} samples={}",s.count,s.bytes,s.max,s.buckets.iter().map(u64::to_string).collect::<Vec<_>>().join(","),s.eligible,s.samples.len());
  for &(lo,hi) in &s.samples{
   if tested>=2048{continue}
   tested+=1;let n=b[lo..hi].iter().fold(0u64,|v,&c|(v<<8)|c as u64);
   if n<2{trivial+=1;continue}
   let mut budget=32768;let mut fs=Vec::new();
   if !factor(n,&mut budget,&mut fs){censored+=1;println!("FACTOR path={path} kind={kind} offset={lo} width={} n={n} status=censored steps={}",hi-lo,32768-budget);continue}
   fs.sort_unstable();assert!(fs.iter().all(|&p|prime(p)));assert_eq!(fs.iter().map(|&p|p as u128).product::<u128>(),n as u128);
   let d=describe(n,&fs);assert_eq!(rebuild(&d,hi-lo).unwrap(),b[lo..hi]);
   assert!(d.len()>=1+varlen(fs[0])+1);
   done+=1;if d.len()<hi-lo{wins+=1;savings+=hi-lo-d.len()}
   println!("FACTOR path={path} kind={kind} offset={lo} width={} n={n} status=complete factors={} payload_bytes={} steps={}",hi-lo,fs.iter().map(u64::to_string).collect::<Vec<_>>().join(","),d.len(),32768-budget);
  }
 }
 println!("FACTOR_SUMMARY tested={tested} complete={done} trivial={trivial} censored={censored} wins={wins} local_savings_bytes={savings} seconds={:.6}",start.elapsed().as_secs_f64());
 Ok(())
}
#[cfg(test)]
mod tests{
 use super::*;
 #[test]fn lexical(){
  let x=b"<?xml version='1.0'?><root>  <a k='>'>A&amp;B</a><!-- <fake/> --><b/><c><![CDATA[<x>]]></c><page><title>unfinished";
  let mut y=vec![];let p=scan(x,&mut y).unwrap();assert_eq!(x,&y[..]);assert_eq!(p.complete,3);assert_eq!(p.open_tail,["/root","/root/page","/root/page/title"]);assert_eq!(p.stats[&("/root/a".to_owned(),"leaf-body")].bytes,7);assert!(!p.stats.contains_key(&("/root/c".to_owned(),"leaf-body")));
 }
 #[test]fn partial_and_bad(){
  for x in [b"<r><a".as_slice(),b"<r><!-- blah",b"<r>abc",b"<r><![CDATA[x",b"<r><?pi"]{let mut y=vec![];scan(x,&mut y).unwrap();assert_eq!(x,&y[..]);}
  assert!(scan(b"<r></x>",Vec::new()).is_err());assert!(scan(b"<!DOCTYPE r [<!ELEMENT r ANY>]><r/>",Vec::new()).is_err());
 }
 #[test]fn integer_roundtrips(){
  for n in [2,3,4,65537,1000003*1000033,18446744073709551557, u64::MAX]{
   let mut f=vec![];assert!(factor(n,&mut 32768,&mut f));f.sort_unstable();let d=describe(n,&f);assert_eq!(rebuild(&d,8).unwrap(),n.to_be_bytes());
   let mut bad=d.clone();bad.push(0);assert!(rebuild(&bad,8).is_none());
  }
  let f=vec![2;32];let d=describe(1<<32,&f);assert_eq!(rebuild(&d,8).unwrap(),[0,0,0,1,0,0,0,0]);assert!(rebuild(&d,4).is_none());
 }
 #[test]fn concatenate(){
  let a=[0,13,7];let b=[0,153];let n=|b:&[u8]|b.iter().fold(0u128,|x,&y|256*x+y as u128);
  assert_eq!(n(&[a.as_slice(),b.as_slice()].concat()),n(&a)*(1u128<<(8*b.len()))+n(&b));
 }
}
