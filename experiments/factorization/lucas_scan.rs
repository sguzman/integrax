//! Bounded full-corpus GCD with a Lucas sequence auxiliary integer.
//! GMP is linked only for this standalone Linux research executable.
use std::{ffi::{c_int,c_ulong,c_void,c_char,CStr},fs::File,io::{self,Read},mem::MaybeUninit,time::Instant};
#[repr(C)]
struct Raw{alloc:c_int,size:c_int,limbs:*mut c_ulong}
#[link(name="gmp")]
extern "C"{
 fn __gmpz_init(x:*mut Raw);
 fn __gmpz_fib_ui(x:*mut Raw,n:c_ulong);
 fn __gmpz_mul(x:*mut Raw,a:*const Raw,b:*const Raw);
 fn __gmpz_mul_ui(x:*mut Raw,a:*const Raw,b:c_ulong);
 fn __gmpz_clear(x:*mut Raw);
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
 fn fib(k:usize)->Self{let mut z=Self::new();unsafe{__gmpz_fib_ui(&mut z.0,k as c_ulong)};z}
 fn lucas_aux(k:usize)->Self{assert_eq!(k%2,0);let f=Self::fib(k);let mut sq=Self::new();let mut z=Self::new();unsafe{__gmpz_mul(&mut sq.0,&f.0,&f.0);__gmpz_mul_ui(&mut z.0,&sq.0,5)};z}
 fn add(&self,b:&Self)->Self{let mut z=Self::new();unsafe{__gmpz_add(&mut z.0,&self.0,&b.0)};z}
 fn shl(&self,k:usize)->Self{let mut z=Self::new();unsafe{__gmpz_mul_2exp(&mut z.0,&self.0,k as c_ulong)};z}
 fn rem(&self,m:&Self)->Self{let mut z=Self::new();unsafe{__gmpz_mod(&mut z.0,&self.0,&m.0)};z}
 fn bezout(&self,b:&Self)->(Self,Self,Self){let(mut d,mut s,mut t)=(Self::new(),Self::new(),Self::new());unsafe{__gmpz_gcdext(&mut d.0,&mut s.0,&mut t.0,&self.0,&b.0)};(d,s,t)}
 fn hex(&self)->String{unsafe{let n=__gmpz_sizeinbase(&self.0,16)+3;let mut b=vec![0u8;n];let p=__gmpz_get_str(b.as_mut_ptr().cast(),16,&self.0);CStr::from_ptr(p).to_str().unwrap().to_owned()}}
 fn bits(&self)->usize{unsafe{__gmpz_sizeinbase(&self.0,2)}}
}
impl Drop for Z{fn drop(&mut self){unsafe{__gmpz_clear(&mut self.0)}}}
fn fold(mut input:impl Read,chunk_bytes:usize,m:&Z)->io::Result<(u64,Z)>{
 assert!(chunk_bytes>0);
 let mut buf=vec![0u8;chunk_bytes];
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
  r=r.shl(filled*8).add(&x).rem(m);
  if filled<buf.len(){break;}
 }
 Ok((bytes,r))
}
fn main()->io::Result<()>{
 assert_eq!(std::mem::size_of::<c_ulong>(),8);
 let args:Vec<_>=std::env::args().collect();
 assert_eq!(args.len(),3,"usage: lucas_scan FILE WITNESS");
 let k=720720usize;
 let start=Instant::now();
 let m=Z::lucas_aux(k);
 let modulus_s=start.elapsed().as_secs_f64();
 let start=Instant::now();
 let(bytes,r)=fold(File::open(&args[1])?,4*1024*1024,&m)?;
 let scan=start.elapsed().as_secs_f64();
 assert_eq!(bytes,1_000_000_000);
 let start=Instant::now();
 let(d,s,t)=r.bezout(&m);
 let gcd=start.elapsed().as_secs_f64();
 std::fs::write(&args[2],format!("{}\n{}\n{}\n{}\n",r.hex(),d.hex(),s.hex(),t.hex()))?;
 assert!(d.bits()<=4096,"unexpected large GCD: no bounded log claim");
 println!("LUCAS_SCAN exponent={k} bytes={bytes} modulus_bits={} gcd_hex={} gcd_bits={} modulus_s={modulus_s:.6} scan_s={scan:.6} gcdext_s={gcd:.6}",m.bits(),d.hex(),d.bits());
 Ok(())
}
#[cfg(test)]
mod tests{
 use super::*;
 #[test] fn native_lucas_identity(){
  let(mut a,mut b)=(2u128,3u128);
  for k in 0..=40{
   if k>0&&k%2==0{assert_eq!(u128::from_str_radix(&Z::lucas_aux(k).hex(),16).unwrap(),a-2);}
   (a,b)=(b,3*b-a);
  }
 }
 #[test] fn native_fold(){
  for k in [2,4,6,12,24]{
   let m=Z::lucas_aux(k);let mm=u128::from_str_radix(&m.hex(),16).unwrap();
   for n in [0u128,1,255,256,65535,1<<80,u128::MAX]{
    for chunk in [1,3,8,19]{
     let b=n.to_be_bytes();let(count,r)=fold(&b[..],chunk,&m).unwrap();
     assert_eq!(count,16);assert_eq!(u128::from_str_radix(&r.hex(),16).unwrap(),n%mm);
    }
   }
  }
 }
 #[test] fn p_plus_one_fixture(){
  // p=7, discriminant 5 is a nonsquare; order divides p+1=8.
  let m=Z::lucas_aux(8);let(_,r)=fold(&(7u32*101).to_be_bytes()[..],3,&m).unwrap();
  assert_eq!(r.bezout(&m).0.hex(),"7");
 }
}
