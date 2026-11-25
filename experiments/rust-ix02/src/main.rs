//! Independent IX02 implementation; compare against the Node oracle.
use num_bigint::BigUint;
use num_traits::{One, Zero};
use std::{env,fs,process::ExitCode};
const CAP: usize = 16 * 1024 * 1024;
fn mag(n:&BigUint)->Vec<u8>{let b=n.to_bytes_be();if b.is_empty(){vec![0]}else{b}}
fn var(mut n:usize,out:&mut Vec<u8>){loop{let b=(n&127) as u8;n>>=7;out.push(b|if n>0{128}else{0});if n==0{break}}}
fn take(b:&mut &[u8])->Result<u8,String>{let (&v,r)=b.split_first().ok_or("truncated")?;*b=r;Ok(v)}
fn read_var(b:&mut &[u8])->Result<usize,String>{
    let mut n=0usize;
    for i in 0..8u32{
        let x=take(b)?;
        let v=usize::from(x&127);
        if 7*i>=usize::BITS || v>usize::MAX>>(7*i){return Err("varint overflow".into())}
        n|=v<<(7*i);
        if x&128==0{if i>0&&v==0{return Err("noncanonical varint".into())}return Ok(n)}
    }
    Err("varint overflow".into())
}
fn read_mag(b:&mut &[u8])->Result<BigUint,String>{
    let len=read_var(b)?;
    if len==0||len>b.len(){return Err("bad magnitude length".into())}
    let (m,r)=b.split_at(len);*b=r;
    if len>1&&m[0]==0{return Err("noncanonical magnitude".into())}
    Ok(BigUint::from_bytes_be(m))
}
fn encode(input:&[u8])->Vec<u8>{
    let n=BigUint::from_bytes_be(input);
    let mut best=input.to_vec();let mut mode=0;
    if n>=BigUint::from(4u8){
        for e in 2..=32u32{
            let a=n.nth_root(e);
            for base in [a.clone(),a+BigUint::one()]{
                if base<BigUint::from(2u8){continue}
                let p=base.pow(e);
                let (r,sign)=if p>n{(&p-&n,1)}else{(&n-&p,0)};
                let a=mag(&base);let r=mag(&r);
                let mut c=vec![e as u8,sign];
                var(a.len(),&mut c);c.extend(a);
                var(r.len(),&mut c);c.extend(r);
                if c.len()<best.len(){best=c;mode=1}
            }
        }
    }
    let mut frame=b"IX02".to_vec();frame.push(mode);
    frame.extend_from_slice(&(input.len() as u64).to_be_bytes());frame.extend(best);frame
}
fn decode(frame:&[u8])->Result<Vec<u8>,String>{
    if frame.len()<13||&frame[..4]!=b"IX02"{return Err("bad header".into())}
    let l=usize::try_from(u64::from_be_bytes(frame[5..13].try_into().unwrap())).map_err(|_|"length overflow")?;
    if l>CAP{return Err("output limit".into())}
    let mut p=&frame[13..];
    match frame[4]{
        0=>{if p.len()!=l{return Err("bad raw length".into())}Ok(p.to_vec())}
        1=>{
            if l==0{return Err("bad length".into())}
            let e=u32::from(take(&mut p)?);let s=take(&mut p)?;
            if !(2..=32).contains(&e)||s>1{return Err("bad operator".into())}
            let a=read_mag(&mut p)?;let r=read_mag(&mut p)?;
            if a<BigUint::from(2u8)||!p.is_empty()||(s==1&&r.is_zero()){return Err("bad arithmetic payload".into())}
            let cap=8*l as u64+e as u64+8;
            if a.bits()*u64::from(e)>cap||r.bits()>cap{return Err("arithmetic width limit".into())}
            let x=a.pow(e);
            let n=if s==0{x+r}else{if r>x{return Err("negative result".into())}x-r};
            if n.bits()>8*l as u64{return Err("value out of range".into())}
            let m=mag(&n);let mut b=vec![0;l];b[l-m.len()..].copy_from_slice(&m);Ok(b)
        }
        _=>Err("bad mode".into())
    }
}
fn run()->Result<(),String>{
    let a:Vec<_>=env::args_os().collect();
    if a.len()!=4{return Err("usage: ix02 encode|decode INPUT OUTPUT".into())}
    let b=fs::read(&a[2]).map_err(|e|e.to_string())?;
    let out=match a[1].to_str(){Some("encode")=>{if b.len()>CAP{return Err("input limit".into())}encode(&b)},Some("decode")=>decode(&b)?,_=>return Err("bad mode".into())};
    fs::write(&a[3],out).map_err(|e|e.to_string())
}
fn main()->ExitCode{match run(){Ok(())=>ExitCode::SUCCESS,Err(e)=>{eprintln!("{e}");ExitCode::FAILURE}}}
#[cfg(test)]
mod tests{
    use super::*;
    #[test]fn roundtrip(){
        for x in [vec![],vec![0],vec![0,0,1],vec![255;64],vec![0;1024],(BigUint::from(3u8).pow(250)+BigUint::one()).to_bytes_be()]{
            let b=encode(&x);assert_eq!(decode(&b).unwrap(),x);
            for i in 0..b.len(){assert!(decode(&b[..i]).is_err())}
            let mut c=b;c.push(0);assert!(decode(&c).is_err());
        }
    }
}
