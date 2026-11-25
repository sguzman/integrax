//! Independent IXT1 transform implementation. Entire frame bounded to 16 MiB payload.
use std::{env,fs,io};
const CAP:usize=16*1024*1024;
fn bad(s:&str)->io::Error{io::Error::new(io::ErrorKind::InvalidData,s)}
fn spec(id:u8)->io::Result<(u8,usize,u8)>{match id{0=>Ok((0,0,0)),1..=18=>{let i=id-1;Ok((i/6+1,1usize<<(i%6),1))},19..=27=>{let i=id-19;Ok((i/3+1,1usize<<(2*(i%3)),2))},_=>Err(bad("invalid transform ID"))}}
fn transform(mut x:Vec<u8>,id:u8,inverse:bool)->io::Result<Vec<u8>>{
 if x.len()>CAP{return Err(bad("payload cap"))}let(kind,lag,order)=spec(id)?;
 for _ in 0..order{let mut y=vec![0u8;x.len()];let mut carry=0i32;
 for i in (0..x.len()).rev(){let delayed=if i+lag<x.len(){if inverse{y[i+lag]}else{x[i+lag]}}else{0};
 if kind==3{y[i]=x[i]^delayed;continue}
 let z=i32::from(x[i])+if inverse{i32::from(delayed)}else{-i32::from(delayed)}+if kind==1{carry}else{0};
 y[i]=z.rem_euclid(256)as u8;carry=if kind==1{z.div_euclid(256)}else{0};
 }x=y}
 Ok(x)
}
fn encode(x:Vec<u8>,id:u8)->io::Result<Vec<u8>>{let y=transform(x,id,false)?;let mut a=b"IXT1".to_vec();a.push(id);a.extend(y);Ok(a)}
fn decode(a:Vec<u8>)->io::Result<Vec<u8>>{if a.len()<5||&a[..4]!=b"IXT1"{return Err(bad("header"))}transform(a[5..].to_vec(),a[4],true)}
fn main()->io::Result<()>{let a:Vec<String>=env::args().collect();match a.get(1).map(String::as_str){
 Some("encode")if a.len()==5=>{let id=a[2].parse::<u8>().map_err(|_|bad("ID"))?;fs::write(&a[4],encode(fs::read(&a[3])?,id)?)},
 Some("decode")if a.len()==4=>fs::write(&a[3],decode(fs::read(&a[2])?)?),
 _=>Err(bad("usage: ixt1 encode ID INPUT FRAME | decode FRAME OUTPUT"))}}
#[cfg(test)]mod tests{use super::*;
 #[test]fn exhaustive(){for n in 0..=65535u16{let x=n.to_be_bytes().to_vec();for id in 0..28{let a=encode(x.clone(),id).unwrap();assert_eq!(decode(a.clone()).unwrap(),x);let(k,d,r)=spec(id).unwrap();if k==1{let y=u16::from_be_bytes(a[5..].try_into().unwrap());let p=if d==1{1u16.wrapping_sub(256)}else{1};assert_eq!(y,n.wrapping_mul(p.wrapping_pow(r as u32)));}}}}
 #[test]fn invalid(){assert!(decode(b"IXT1\x1c".to_vec()).is_err());assert!(decode(b"IXT".to_vec()).is_err());}
 #[test]fn long_carry(){for x in [vec![255;4096],vec![0;4096],(0..4096).map(|x|x as u8).collect()]{for id in 0..28{assert_eq!(decode(encode(x.clone(),id).unwrap()).unwrap(),x)}}}
}
