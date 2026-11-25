//! Whole-integer periodic template and sparse base-256 digit corrections.
use std::{env,fs,process::ExitCode};
const MAX_PERIOD:usize=256;
const ENCODE_CAP:usize=1024*1024;
const DECODE_CAP:usize=16*1024*1024;
fn var(mut x:usize,b:&mut Vec<u8>){
    loop{let v=(x&127) as u8;x>>=7;b.push(v|if x!=0{128}else{0});if x==0{return}}
}
fn get_var(b:&mut &[u8])->Result<usize,&'static str>{
    let mut x=0usize;
    for i in 0..8{
        let (&v,rest)=b.split_first().ok_or("truncated varint")?;*b=rest;
        let d=usize::from(v&127);
        let shift=i*7;
        if shift>=usize::BITS as usize||d>usize::MAX>>shift{return Err("varint overflow")}
        x|=d<<shift;
        if v&128==0{if i!=0&&d==0{return Err("noncanonical varint")}return Ok(x)}
    }
    Err("varint overflow")
}
fn modal(input:&[u8],p:usize)->Vec<u8>{
    let mut counts=vec![[0u32;256];p];
    for (i,&v) in input.iter().enumerate(){counts[i%p][usize::from(v)]+=1}
    counts.iter().map(|c|{
        let mut best=0;
        for v in 1..256{if c[v]>c[best]{best=v}}
        best as u8
    }).collect()
}
fn candidate(input:&[u8],p:usize,budget:usize)->Option<Vec<u8>>{
    let t=modal(input,p);
    let mut edits=Vec::new();
    let(mut count,mut next)=(0,0);
    for (i,&v) in input.iter().enumerate(){
        if v!=t[i%p]{
            var(i-next,&mut edits);edits.push(v);
            count+=1;next=i+1;
            if 2+p+edits.len()>=budget{return None}
        }
    }
    let mut b=Vec::new();
    var(p,&mut b);b.extend(t);var(count,&mut b);b.extend(edits);
    if b.len()<budget{Some(b)}else{None}
}
fn encode(input:&[u8])->Vec<u8>{
    let mut mode=0;let mut best=input.to_vec();
    if input.len()<=ENCODE_CAP{
        for p in 1..=MAX_PERIOD.min(input.len()/2){
            if p+2>=best.len(){break}
            if let Some(c)=candidate(input,p,best.len()){best=c;mode=1}
        }
    }
    let mut frame=b"IX03".to_vec();frame.push(mode);
    frame.extend_from_slice(&(input.len() as u64).to_be_bytes());frame.extend(best);frame
}
fn decode(frame:&[u8])->Result<Vec<u8>,&'static str>{
    if frame.len()<13||&frame[..4]!=b"IX03"{return Err("bad header")}
    let l=usize::try_from(u64::from_be_bytes(frame[5..13].try_into().unwrap())).map_err(|_|"length overflow")?;
    if l>DECODE_CAP{return Err("output limit")}
    let mut b=&frame[13..];
    match frame[4]{
        0=>{if b.len()!=l{return Err("bad raw length")}Ok(b.to_vec())}
        1=>{
            let p=get_var(&mut b)?;
            if p==0||p>MAX_PERIOD||p>l/2||b.len()<p{return Err("bad template width")}
            let (t,rest)=b.split_at(p);b=rest;
            let count=get_var(&mut b)?;
            if count>l||count>b.len()/2{return Err("bad correction count")}
            let mut out:Vec<u8>=t.iter().copied().cycle().take(l).collect();
            let mut next=0usize;
            for _ in 0..count{
                let gap=get_var(&mut b)?;
                let i=next.checked_add(gap).ok_or("index overflow")?;
                let (&v,rest)=b.split_first().ok_or("missing correction")?;b=rest;
                if i>=l||out[i]==v{return Err("invalid correction")}
                out[i]=v;next=i+1;
            }
            if !b.is_empty(){return Err("trailing bytes")}Ok(out)
        }
        _=>Err("bad mode")
    }
}
fn run()->Result<(),String>{
    let a:Vec<_>=env::args_os().collect();
    if a.len()!=4{return Err("usage: ix03 encode|decode INPUT OUTPUT".into())}
    let b=fs::read(&a[2]).map_err(|e|e.to_string())?;
    let out=match a[1].to_str(){Some("encode")=>{if b.len()>DECODE_CAP{return Err("input limit".into())}encode(&b)},Some("decode")=>decode(&b).map_err(str::to_string)?,_=>return Err("bad mode".into())};
    fs::write(&a[3],out).map_err(|e|e.to_string())
}
fn main()->ExitCode{match run(){Ok(())=>ExitCode::SUCCESS,Err(e)=>{eprintln!("{e}");ExitCode::FAILURE}}}
#[cfg(test)]
mod tests{
    use super::*;
    #[test]fn roundtrip_and_malformed(){
        let mut repeat=b"abcde".repeat(83);repeat[0]=0;repeat[199]=3;repeat.push(b'a');
        for input in [vec![],vec![0],vec![0,0,1],vec![255;64],repeat,(0..255).collect()]{
            let b=encode(&input);assert_eq!(decode(&b).unwrap(),input);
            for n in 0..b.len(){assert!(decode(&b[..n]).is_err())}
            let mut bad=b;bad.push(0);assert!(decode(&bad).is_err());
        }
    }
    #[test]fn geometric_cost(){
        let x=b"abcde".repeat(100);let y=encode(&x);
        assert_eq!(y[4],1);assert_eq!(y.len(),20);assert_eq!(decode(&y).unwrap(),x);
        let mut x=x;x[200]=b'z';let y=encode(&x);
        assert_eq!(y.len(),23);assert_eq!(decode(&y).unwrap(),x);
    }
    #[test]fn noncanonical_varint(){let mut b=&[128,0][..];assert!(get_var(&mut b).is_err());}
}
