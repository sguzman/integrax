//! Linux GMP-backed bounded arithmetic feasibility probe; not a compressor.
use std::{ffi::{c_int,c_ulong,c_void},mem::MaybeUninit,time::Instant};
#[repr(C)]
struct Raw { alloc:c_int, size:c_int, limbs:*mut c_ulong }
#[link(name="gmp")]
extern "C" {
    fn __gmpz_init(x:*mut Raw);
    fn __gmpz_clear(x:*mut Raw);
    fn __gmpz_set_ui(x:*mut Raw,n:c_ulong);
    fn __gmpz_import(x:*mut Raw,count:usize,order:c_int,size:usize,endian:c_int,nails:usize,data:*const c_void);
    fn __gmpz_mul(x:*mut Raw,a:*const Raw,b:*const Raw);
    fn __gmpz_mod(x:*mut Raw,a:*const Raw,m:*const Raw);
    fn __gmpz_powm_ui(x:*mut Raw,a:*const Raw,e:c_ulong,m:*const Raw);
    fn __gmpz_sub_ui(x:*mut Raw,a:*const Raw,n:c_ulong);
    fn __gmpz_gcd(x:*mut Raw,a:*const Raw,b:*const Raw);
    fn __gmpz_cmp(a:*const Raw,b:*const Raw)->c_int;
    fn __gmpz_cmp_ui(a:*const Raw,b:c_ulong)->c_int;
    fn __gmpz_divisible_ui_p(a:*const Raw,b:c_ulong)->c_int;
    fn __gmpz_divisible_p(a:*const Raw,b:*const Raw)->c_int;
    fn __gmpz_sizeinbase(a:*const Raw,base:c_int)->usize;
    fn __gmpz_get_ui(a:*const Raw)->c_ulong;
}
struct Z(Raw);
impl Z {
    fn new()->Self { unsafe { let mut x=MaybeUninit::uninit(); __gmpz_init(x.as_mut_ptr()); Self(x.assume_init()) } }
    fn ui(n:u64)->Self {let mut x=Self::new();unsafe{__gmpz_set_ui(&mut x.0,n as c_ulong)};x}
    fn bytes(b:&[u8])->Self {let mut x=Self::new();unsafe{__gmpz_import(&mut x.0,b.len(),1,1,1,0,b.as_ptr().cast())};x}
    fn mul(&self,b:&Self)->Self {let mut x=Self::new();unsafe{__gmpz_mul(&mut x.0,&self.0,&b.0)};x}
    fn rem(&self,m:&Self)->Self {let mut x=Self::new();unsafe{__gmpz_mod(&mut x.0,&self.0,&m.0)};x}
    fn pow(&self,e:u64,m:&Self)->Self {let mut x=Self::new();unsafe{__gmpz_powm_ui(&mut x.0,&self.0,e as c_ulong,&m.0)};x}
    fn minus_one(&self)->Self {let mut x=Self::new();unsafe{__gmpz_sub_ui(&mut x.0,&self.0,1)};x}
    fn gcd(&self,b:&Self)->Self {let mut x=Self::new();unsafe{__gmpz_gcd(&mut x.0,&self.0,&b.0)};x}
    fn cmp(&self,b:&Self)->i32 {unsafe{__gmpz_cmp(&self.0,&b.0)}}
    fn cmp_ui(&self,b:u64)->i32 {unsafe{__gmpz_cmp_ui(&self.0,b as c_ulong)}}
    fn divisible_ui(&self,b:u64)->bool {unsafe{__gmpz_divisible_ui_p(&self.0,b as c_ulong)!=0}}
    fn divisible(&self,b:&Self)->bool {unsafe{__gmpz_divisible_p(&self.0,&b.0)!=0}}
    fn bits(&self)->usize {unsafe{__gmpz_sizeinbase(&self.0,2)}}
    fn low(&self)->u64 {unsafe{__gmpz_get_ui(&self.0) as u64}}
}
impl Drop for Z {fn drop(&mut self){unsafe{__gmpz_clear(&mut self.0)}}}
const P:u64=65521;
const EXP:u64=720720; // lcm(1,...,16), includes 65520 = P-1
const SEED:u64=0x496e746567726178;
fn deterministic_bytes(n:usize,seed:u64)->Vec<u8>{
    let mut s=seed;
    let mut v=vec![0;n];
    for chunk in v.chunks_mut(8) {
        s^=s<<13;s^=s>>7;s^=s<<17;
        chunk.copy_from_slice(&s.to_le_bytes()[..chunk.len()]);
    }
    v[0]|=128;v[n-1]|=1;v
}
fn timed<T>(f:impl FnOnce()->T)->(T,f64){let start=Instant::now();let x=f();(x,start.elapsed().as_secs_f64())}
fn stage1(n:&Z)->Z {Z::ui(2).pow(EXP,n).minus_one().gcd(n)}
fn benchmark(bits:usize){
    assert!(bits>=64 && bits<=1<<26 && bits%8==0);
    let q=Z::bytes(&deterministic_bytes((bits-16)/8,SEED));
    let n=q.mul(&Z::ui(P));
    assert!(n.divisible_ui(P));
    assert!(n.bits()>=bits-1 && n.bits()<=bits);
    // Full-width residues, not artificially cheap tiny operands.
    let a=Z::bytes(&deterministic_bytes(bits/8,SEED^17)).rem(&n);
    let b=Z::bytes(&deterministic_bytes(bits/8,SEED^29)).rem(&n);
    let (ab,mul_s)=timed(||a.mul(&b).rem(&n));
    let (g,gcd_s)=timed(||ab.gcd(&n));
    assert!(n.divisible(&g));
    let (ap,pow_s)=timed(||a.pow(65537,&n));
    assert!(ap.cmp(&n)<0);
    let (d,p1_s)=timed(||stage1(&n));
    assert!(d.cmp_ui(1)>0 && d.cmp(&n)<0 && n.divisible(&d) && d.divisible_ui(P));
    println!("BENCH requested_bits={bits} actual_bits={} planted_prime={P} factor_bits={} factor_low={} exponent={EXP} modmul_s={mul_s:.9} gcd_s={gcd_s:.9} pow65537_s={pow_s:.9} stage1_s={p1_s:.9} verified=true",n.bits(),d.bits(),d.low());
}
fn main(){
    assert_eq!(std::mem::size_of::<c_ulong>(),8,"64-bit Linux ABI required");
    let arg=std::env::args().nth(1).expect("usage: gmp_feasibility BITS");
    benchmark(arg.parse().expect("integer bit count"));
}
#[cfg(test)]
mod tests{
    use super::*;
    fn gcd(mut a:u128,mut b:u128)->u128{while b!=0{let c=a%b;a=b;b=c;}a}
    fn pow(mut a:u128,mut e:u64,n:u128)->u128{let mut r=1;while e>0{if e&1==1{r=r*a%n;}a=a*a%n;e>>=1;}r}
    #[test] fn planted_prime_and_exponent(){
        assert!((2..=255).all(|p|P%p!=0));assert_eq!(EXP%(P-1),0);
        assert!((1..=16).all(|p|EXP%p==0));
    }
    #[test] fn small_native_replay(){
        for q in [1009u64,10007,1000003,10000019]{
            let n=P*q;
            let z=Z::ui(n);
            let expected=gcd(pow(2,EXP,n as u128)-1,n as u128);
            assert_eq!(stage1(&z).low(),expected as u64);
            assert_eq!(Z::ui(12345).pow(65537,&z).low(),pow(12345,65537,n as u128) as u64);
        }
    }
    #[test] fn import_and_multiply(){
        let a=Z::bytes(&[1,2,3]);assert_eq!(a.low(),66051);
        assert_eq!(a.mul(&Z::ui(7)).rem(&Z::ui(97)).low(),(66051*7)%97);
        assert_eq!(deterministic_bytes(1024,SEED),deterministic_bytes(1024,SEED));
    }
    #[test] fn fixture_produces_proper_factor(){benchmark(64);benchmark(1024);}
}
