//! IXB1: reversible radix context permutation, not a standalone compression claim.
use std::{env,fs,io::{self,Read},fs::File};
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
fn encode(x:&[u8],mode:u8)->io::Result<Vec<u8>>{if x.len()>CAP||mode>2{return Err(bad("cap or mode"))}let(primary,mut last)=bwt(x);if mode>=1{last=mtf(&last,false)}if mode==2{last=run_encode(&last)}let mut out=b"IXB1".to_vec();out.push(mode);out.extend_from_slice(&(x.len()as u64).to_be_bytes());out.extend_from_slice(&(primary as u32).to_be_bytes());out.extend(last);Ok(out)}
fn decode(a:&[u8])->io::Result<Vec<u8>>{if a.len()<17||&a[..4]!=b"IXB1"||a[4]>2{return Err(bad("header"))}let n=u64::from_be_bytes(a[5..13].try_into().unwrap());if n>CAP as u64{return Err(bad("cap"))}let n=n as usize;let p=u32::from_be_bytes(a[13..17].try_into().unwrap())as usize;let mut x=if a[4]==2{run_decode(&a[17..],n)?}else{if a.len()-17!=n{return Err(bad("length"))}a[17..].to_vec()};if a[4]>=1{x=mtf(&x,true)}inverse(&x,p)}
fn read_cap(path:&str,cap:usize)->io::Result<Vec<u8>>{let mut x=Vec::new();File::open(path)?.take(cap as u64+1).read_to_end(&mut x)?;if x.len()>cap{return Err(bad("input cap"))}Ok(x)}
fn main()->io::Result<()>{let a:Vec<String>=env::args().collect();match a.get(1).map(String::as_str){Some("encode")if a.len()==5=>{let m=a[2].parse::<u8>().map_err(|_|bad("mode"))?;fs::write(&a[4],encode(&read_cap(&a[3],CAP)?,m)?)},Some("decode")if a.len()==4=>fs::write(&a[3],decode(&read_cap(&a[2],2*CAP+17)?)?),_=>Err(bad("usage: ixb1 encode MODE INPUT FRAME | decode FRAME OUTPUT"))}}
#[cfg(test)]mod tests{use super::*;
 fn naive(x:&[u8])->(usize,Vec<u8>){let n=x.len();if n==0{return(0,vec![])}let mut o:Vec<usize>=(0..n).collect();o.sort_by(|&a,&b|(0..n).map(|j|x[(a+j)%n]).cmp((0..n).map(|j|x[(b+j)%n])).then(a.cmp(&b)));(o.iter().position(|&i|i==0).unwrap(),o.iter().map(|&i|x[(i+n-1)%n]).collect())}
 #[test]fn exhaustive(){for n in 0..=8{for mut v in 0..3usize.pow(n){let x:Vec<u8>=(0..n).map(|_|{let b=(v%3)as u8;v/=3;b}).collect();assert_eq!(bwt(&x),naive(&x));for m in 0..3{assert_eq!(decode(&encode(&x,m).unwrap()).unwrap(),x)}}}}
 #[test]fn long(){let mut state=0x12345678u32;let r:Vec<u8>=(0..65537).map(|_|{state^=state<<13;state^=state>>17;state^=state<<5;state as u8}).collect();for x in [vec![0;65537],b"abracadabra".repeat(6000),r]{for m in 0..3{assert_eq!(decode(&encode(&x,m).unwrap()).unwrap(),x)}}}
 #[test]fn invalid(){for x in [vec![0],vec![0,0],vec![0,129,0],vec![0,2,0,2],vec![0,127]]{assert!(run_decode(&x,4).is_err())}let mut a=encode(b"abc",0).unwrap();a[16]=3;assert!(decode(&a).is_err());}
}
