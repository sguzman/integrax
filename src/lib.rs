//! IX01 reference codec.
const MAGIC: &[u8; 4] = b"IX01";
const HEADER: usize = 13;
fn minimal(n: u128) -> Vec<u8> {
    let b = n.to_be_bytes();
    b[b.iter().position(|&x| x != 0).unwrap_or(15)..].to_vec()
}
fn integer(bytes: &[u8]) -> u128 {
    bytes.iter().fold(0, |n, &b| (n << 8) | u128::from(b))
}
fn floor_root(n: u128, e: u32) -> u128 {
    let (mut lo, mut hi) = (1u128, 1u128 << 64);
    while lo < hi {
        let mid = lo + (hi-lo+1)/2;
        if mid.checked_pow(e).is_some_and(|p| p<=n) { lo=mid; } else { hi=mid-1; }
    }
    lo
}
pub fn encode(input: &[u8]) -> Vec<u8> {
    let mut mode=0u8;
    let mut best=input.to_vec();
    if !input.is_empty() && input.len()<=16 {
        let n=integer(input);
        if n>=4 {
            for e in 2..=127u32 {
                let root=floor_root(n,e);
                for base in [root,root+1] {
                    if base<2 { continue; }
                    let Some(p)=base.checked_pow(e) else { continue; };
                    let b=minimal(base);
                    let r=minimal(n.abs_diff(p));
                    let mut c=vec![b.len() as u8];
                    c.extend(b);
                    c.push(e as u8);
                    c.push(u8::from(p>n));
                    c.push(r.len() as u8);
                    c.extend(r);
                    if c.len()<best.len() { mode=1; best=c; }
                }
            }
        }
    }
    let mut out=MAGIC.to_vec();
    out.push(mode);
    out.extend_from_slice(&(input.len() as u64).to_be_bytes());
    out.extend(best);
    out
}
fn read_uint(input: &mut &[u8]) -> Result<u128,&'static str> {
    let (&len,rest)=input.split_first().ok_or("missing integer length")?;
    let len=usize::from(len);
    if len==0 || len>16 || rest.len()<len { return Err("bad integer length"); }
    let (b,tail)=rest.split_at(len);
    if len>1 && b[0]==0 { return Err("nonminimal integer"); }
    *input=tail;
    Ok(integer(b))
}
pub fn decode(frame: &[u8]) -> Result<Vec<u8>,&'static str> {
    if frame.len()<HEADER || &frame[..4]!=MAGIC { return Err("bad header"); }
    let len=usize::try_from(u64::from_be_bytes(frame[5..13].try_into().unwrap())).map_err(|_|"length overflow")?;
    let mut payload=&frame[HEADER..];
    match frame[4] {
        0 => { if payload.len()!=len { return Err("raw length mismatch"); } Ok(payload.to_vec()) }
        1 => {
            if !(1..=16).contains(&len) { return Err("bad arithmetic length"); }
            let base=read_uint(&mut payload)?;
            if base<2 || payload.len()<2 { return Err("bad power"); }
            let e=u32::from(payload[0]); let sign=payload[1]; payload=&payload[2..];
            if !(2..=127).contains(&e) || sign>1 { return Err("bad operator"); }
            let r=read_uint(&mut payload)?;
            if !payload.is_empty() || (r==0 && sign==1) { return Err("bad residual"); }
            let p=base.checked_pow(e).ok_or("power overflow")?;
            let n=(if sign==0 { p.checked_add(r) } else { p.checked_sub(r) }).ok_or("arithmetic overflow")?;
            let b=n.to_be_bytes();
            if b[..16-len].iter().any(|&v|v!=0) { return Err("value exceeds length"); }
            Ok(b[16-len..].to_vec())
        }
        _=>Err("unknown mode"),
    }
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn roundtrips() {
        let mut cases=vec![vec![],vec![0],vec![0,0,1],vec![255;16],vec![0;1024]];
        for e in [20,64,100,127] {
            for n in [(1u128<<e)-1,1u128<<e,(1u128<<e)+1] { cases.push(n.to_be_bytes().to_vec()); }
        }
        let mut state=0x12345678u64;
        for len in 0..=64 {
            let mut b=Vec::new();
            for _ in 0..len { state^=state<<13; state^=state>>7; state^=state<<17; b.push(state as u8); }
            cases.push(b);
        }
        for x in cases { assert_eq!(decode(&encode(&x)).unwrap(),x); }
    }
    #[test]
    fn power_mode() {
        let x=(1u128<<100).to_be_bytes();
        let y=encode(&x);
        assert_eq!(y[4],1);
        assert!(y.len()<HEADER+x.len());
        assert_eq!(decode(&y).unwrap(),x);
    }
    #[test]
    fn malformed() {
        for x in [vec![1,2],(1u128<<100).to_be_bytes().to_vec()] {
            let y=encode(&x);
            for n in 0..y.len() { assert!(decode(&y[..n]).is_err()); }
            let mut trailing=y.clone(); trailing.push(0); assert!(decode(&trailing).is_err());
            let mut bad=y; bad[4]=255; assert!(decode(&bad).is_err());
        }
    }
}
