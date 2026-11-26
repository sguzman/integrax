//! Bounded full-corpus GCD with 2^k-1, using streaming radix folding.
//! GMP is linked only for this standalone Linux research executable.
use std::{ffi::{c_int,c_ulong,c_void,c_char,CStr},fs::File,io::{self,Read},mem::MaybeUninit,time::Instant};
#[repr(C)]
struct Raw{alloc:c_int,size:c_int,limbs:*mut c_ulong}
#[link(name="gmp")]
extern "C"{
 fn __gmpz_init(x:*mut Raw);
 fn __gmpz_clear(x:*mut Raw);
 fn __gmpz_setbit(x:*mut Raw,k:c_ulong);
 fn __gmpz_sub_ui(x:*mut Raw,a:*const Raw,n:c_ulong);
 fn __gmpz_import(x:*mut Raw,count:usize,order:c_int,size:usize,endian:c_int,nails:usize,p:*const c_void);
 fn __gmpz_add(x:*mut Raw,a:*const Raw,b:*const Raw);
 fn __gmpz_mod(x:*mut Raw,a:*const Raw,m:*const Raw);
 fn __gmpz_mul_2exp(x:*mut Raw,a:*const Raw,k:c_ulong);
 fn __gmpz_gcdext(g:*mut Raw,s:*mut Raw,t:*mut Raw,a:*const Raw,b:*const Raw);
 fn __gmpz_sizeinbase(x:*const Raw,b:c_int)->usize;
 fn __gmpz_get_str(s:*mut c_char,b:c_int,x:*const Raw)->*mut c_char;
}
struct Z(Raw);
impl Z{
 fn new()->Self{unsafe{let mut z=MaybeUninit::uninit();__gmpz_init(z.as_mut_ptr());Self(z.assume_init())}}
 fn bytes(b:&[u8])->Self{let mut z=Self::new();unsafe{__gmpz_import(&mut z.0,b.len(),1,1,1,0,b.as_ptr().cast())};z}
 fn mersenne(k:usize)->Self{let mut pow=Self::new();let mut m=Self::new();unsafe{__gmpz_setbit(&mut pow.0,k as c_ulong);__gmpz_sub_ui(&mut m.0,&pow.0,1)};m}
 fn add(&self,b:&Self)->Self{let mut z=Self::new();unsafe{__gmpz_add(&mut z.0,&self.0,&b.0)};z}
 fn shl(&self,k:usize)->Self{let mut z=Self::new();unsafe{__gmpz_mul_2exp(&mut z.0,&self.0,k as c_ulong)};z}
 fn rem(&self,m:&Self)->Self{let mut z=Self::new();unsafe{__gmpz_mod(&mut z.0,&self.0,&m.0)};z}
 fn bezout(&self,b:&Self)->(Self,Self,Self){let(mut d,mut s,mut t)=(Self::new(),Self::new(),Self::new());unsafe{__gmpz_gcdext(&mut d.0,&mut s.0,&mut t.0,&self.0,&b.0)};(d,s,t)}
 fn hex(&self)->String{unsafe{let n=__gmpz_sizeinbase(&self.0,16)+3;let mut b=vec![0u8;n];let p=__gmpz_get_str(b.as_mut_ptr().cast(),16,&self.0);CStr::from_ptr(p).to_str().unwrap().to_owned()}}
 fn bits(&self)->usize{unsafe{__gmpz_sizeinbase(&self.0,2)}}
}
impl Drop for Z{fn drop(&mut self){unsafe{__gmpz_clear(&mut self.0)}}}
fn fold(mut input:impl Read,k:usize,m:&Z)->io::Result<(u64,Z)>{
 assert!(k>0&&k%8==0);
 let mut buf=vec![0u8;k/8];
 let mut r=Z::new();
 let mut bytes=0u64;
 loop{
  let mut filled=0;
  while filled<buf.len(){
   match input.read(&mut buf[filled..]){
    Ok(0)=>break,Ok(n)=>filled+=n,Err(e) if e.kind()==io::ErrorKind::Interrupted=>continue,Err(e)=>return Err(e)
   }
  }
  if filled==0{break;}
  bytes+=filled as u64;
  let x=Z::bytes(&buf[..filled]);
  // Complete radix-2^k block: 2^k is congruent to 1 modulo M.
  r=if filled==buf.len(){r.add(&x).rem(m)}else{r.shl(filled*8).add(&x).rem(m)};
  if filled<buf.len(){break;}
 }
 Ok((bytes,r))
}
fn main()->io::Result<()>{
 assert_eq!(std::mem::size_of::<c_ulong>(),8);
 let args:Vec<_>=std::env::args().collect();
 assert_eq!(args.len(),4,"usage: mersenne_scan FILE EXPONENT WITNESS");
 let k:usize=args[2].parse().unwrap();
 assert!([720720,12252240,232792560].contains(&k),"unapproved bound");
 let m=Z::mersenne(k);
 let start=Instant::now();
 let (bytes,r)=fold(File::open(&args[1])?,k,&m)?;
 let scan=start.elapsed().as_secs_f64();
 assert_eq!(bytes,1_000_000_000);
 let start=Instant::now();
 let(d,s,t)=r.bezout(&m);
 let gcd=start.elapsed().as_secs_f64();
 // The independent verifier checks the full witness, not just a digest.
 std::fs::write(&args[3],format!("{}\n{}\n{}\n{}\n",r.hex(),d.hex(),s.hex(),t.hex()))?;
 assert!(d.bits()<=4096,"unexpected large GCD: no bounded log claim");
 println!("MERSENNE_SCAN exponent={k} bytes={bytes} gcd_hex={} gcd_bits={} scan_s={scan:.6} gcdext_s={gcd:.6}",d.hex(),d.bits());
 Ok(())
}
#[cfg(test)]
mod tests{
 use super::*;
 #[test] fn native_replay(){
  for k in [8,16,24,32,64]{
   let m=Z::mersenne(k);
   for n in [0u128,1,255,256,65535,1<<80,u128::MAX]{
    let a=n.to_be_bytes();for offset in 0..=16{
     let b=&a[offset..];let x=b.iter().fold(0u128,|r,&v|(r<<8)|v as u128);
     let(count,r)=fold(b,k,&m).unwrap();
     assert_eq!(count,b.len() as u64);assert_eq!(u128::from_str_radix(&r.hex(),16).unwrap(),x%((1u128<<k)-1));
    }
   }
  }
 }
 #[test] fn short_reads(){
  struct Short<'a>(&'a[u8]);
  impl Read for Short<'_>{fn read(&mut self,b:&mut[u8])->io::Result<usize>{let n=b.len().min(self.0.len()).min(3);b[..n].copy_from_slice(&self.0[..n]);self.0=&self.0[n..];Ok(n)}}
  let b=[1,2,3,4,5,6,7,8,9];
  let m=Z::mersenne(32);
  assert_eq!(fold(Short(&b),32,&m).unwrap().1.hex(),fold(&b[..],32,&m).unwrap().1.hex());
 }
 #[test] fn planted_factor(){
  let m=Z::mersenne(16);let n=(257u32*101).to_be_bytes();let(_,r)=fold(&n[..],16,&m).unwrap();
  assert_eq!(r.bezout(&m).0.hex(),"101");
 }
}
