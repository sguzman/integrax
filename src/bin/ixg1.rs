//! Independent bounded IXG1 decoder. No JavaScript or external dictionary.
use std::{env,fs,io};
const CAP:usize=16384;const RULE_CAP:usize=512;
fn bad(s:&str)->io::Error{io::Error::new(io::ErrorKind::InvalidData,s)}
fn take(a:&mut &[u8])->io::Result<u8>{let (&b,r)=a.split_first().ok_or_else(||bad("truncated"))?;*a=r;Ok(b)}
fn var(a:&mut &[u8])->io::Result<usize>{let mut n=0u64;for i in 0..5{let b=take(a)?;n|=u64::from(b&127)<<(7*i);if b&128==0{if i>0&&b==0{return Err(bad("noncanonical varint"))}return usize::try_from(n).map_err(|_|bad("varint overflow"))}}Err(bad("varint overflow"))}
fn width(n:usize)->usize{if n<=1{0}else{(usize::BITS-(n-1).leading_zeros()) as usize}}
struct Bits<'a>{a:&'a[u8],pos:usize}
impl Bits<'_>{fn get(&mut self,w:usize)->io::Result<usize>{if w>self.a.len().saturating_mul(8).saturating_sub(self.pos){return Err(bad("truncated bits"))}let mut z=0;for _ in 0..w{z=(z<<1)|usize::from((self.a[self.pos/8]>>(7-self.pos%8))&1);self.pos+=1}Ok(z)}}
fn decode(mut a:&[u8])->io::Result<Vec<u8>>{
 if !a.starts_with(b"IXG1"){return Err(bad("magic"))}a=&a[4..];let l=var(&mut a)?;if l>CAP{return Err(bad("cap"))}let mode=take(&mut a)?;
 if mode==0{if a.len()!=l{return Err(bad("raw length"))}return Ok(a.to_vec())}
 if mode!=1||l==0{return Err(bad("mode"))}let k=var(&mut a)?;if k==0||k>256||k>a.len(){return Err(bad("alphabet"))}let(alpha,rest)=a.split_at(k);a=rest;
 if alpha.windows(2).any(|w|w[0]>=w[1]){return Err(bad("alphabet order"))}let n=var(&mut a)?;let r=var(&mut a)?;if n>RULE_CAP||r==0||r>l{return Err(bad("grammar size"))}
 let mut bits=Bits{a,pos:0};let mut lens=vec![1usize;k];let mut rules=Vec::with_capacity(n);
 for i in 0..n{let w=width(k+i);let x=bits.get(w)?;let y=bits.get(w)?;if x>=k+i||y>=k+i{return Err(bad("forward ref"))}let len=lens[x]+lens[y];if len>l{return Err(bad("expansion cap"))}lens.push(len);rules.push((x,y))}
 let mut roots=Vec::with_capacity(r);let mut total=0;for _ in 0..r{let x=bits.get(width(k+n))?;if x>=k+n{return Err(bad("root"))}total+=lens[x];if total>l{return Err(bad("root length"))}roots.push(x)}
 if total!=l||bits.pos.div_ceil(8)!=a.len(){return Err(bad("frame length"))}while bits.pos%8!=0{if bits.get(1)?!=0{return Err(bad("padding"))}}
 let mut out=Vec::with_capacity(l);let mut stack=Vec::new();for root in roots{stack.push(root);while let Some(x)=stack.pop(){if x<k{out.push(alpha[x])}else{let (u,v)=rules[x-k];stack.push(v);stack.push(u)}}}if out.len()!=l{return Err(bad("expansion"))}Ok(out)
}
fn main()->io::Result<()>{let a:Vec<_>=env::args_os().collect();if a.len()!=3{return Err(bad("usage: ixg1 ARCHIVE OUTPUT"))}fs::write(&a[2],decode(&fs::read(&a[1])?)?)}
#[cfg(test)]mod tests{use super::*;#[test]fn raw(){assert_eq!(decode(b"IXG1\x03\x00abc").unwrap(),b"abc");assert!(decode(b"IXG1\x03\x00ab").is_err());assert!(decode(b"IXG1\x03\x00abcd").is_err());}#[test]fn grammar(){// alphabet a,b, rule 2=(a,b), root sequence 2,2. Bits 01 10 10 => 0x68.
 let a=b"IXG1\x04\x01\x02ab\x01\x02\x68";assert_eq!(decode(a).unwrap(),b"abab");for i in 0..a.len(){assert!(decode(&a[..i]).is_err())}let mut b=a.to_vec();*b.last_mut().unwrap()|=1;assert!(decode(&b).is_err());}#[test]fn zero_width(){assert_eq!(decode(b"IXG1\x04\x01\x01a\x00\x04").unwrap(),b"aaaa");}}
