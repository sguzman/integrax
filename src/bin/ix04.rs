//! IX04: static zero-order arithmetic intervals with bounded integer precision.
use std::{fs::File,io::{self,Read,Write,BufReader,BufWriter,Seek,SeekFrom},env};
const TOP:u64=0xffff_ffff;
const HALF:u64=0x8000_0000;
const Q:u64=0x4000_0000;
const TQ:u64=0xc000_0000;
const SCALE:u64=32768;
const MAGIC:&[u8;4]=b"IX04";
fn err(s:&str)->io::Error{io::Error::new(io::ErrorKind::InvalidData,s)}
struct BitsOut<W:Write>{w:W,b:u8,n:u8}
impl<W:Write> BitsOut<W>{
    fn bit(&mut self,x:u8)->io::Result<()>{
        self.b=(self.b<<1)|x;self.n+=1;
        if self.n==8{self.w.write_all(&[self.b])?;self.n=0;self.b=0;}Ok(())
    }
    fn finish(mut self)->io::Result<()>{
        if self.n>0{self.w.write_all(&[self.b<<(8-self.n)])?;}self.w.flush()
    }
}
struct BitsIn<R:Read>{r:R,b:u8,n:u8,pad:u8}
impl<R:Read> BitsIn<R>{
    fn bit(&mut self)->io::Result<u64>{
        if self.n==0{let mut b=[0];if self.r.read(&mut b)?==0{
            if self.pad>=32{return Err(err("excess arithmetic padding"))}self.pad+=1;return Ok(0)
        }self.b=b[0];self.n=8;}
        let x=self.b>>7;self.b<<=1;self.n-=1;Ok(u64::from(x))
    }
}
fn cumulative(f:&[u16;256])->([u64;257],u64){
    let mut c=[0;257];for i in 0..256{c[i+1]=c[i]+u64::from(f[i]);}(c,c[256])
}
fn model(hist:&[u64;256],len:u64)->[u16;256]{
    let mut f=[0;256];if len==0{return f}
    // Every observed byte gets a positive count; total <= SCALE.
    let active=hist.iter().filter(|&&n|n>0).count() as u64;
    for i in 0..256{if hist[i]>0{f[i]=(1+(u128::from(hist[i])*u128::from(SCALE-active)/u128::from(len)) as u64) as u16;}}f
}
fn emit<W:Write>(b:&mut BitsOut<W>,v:u8,pending:&mut u64)->io::Result<()>{
    b.bit(v)?;while *pending>0{b.bit(v^1)?;*pending-=1;}Ok(())
}
fn encode<R:Read+Seek,W:Write>(mut r:R,mut w:W)->io::Result<()>{
    let mut hist=[0u64;256];let mut len=0u64;let mut buf=[0u8;65536];
    loop{let n=r.read(&mut buf)?;if n==0{break}len=len.checked_add(n as u64).ok_or_else(||err("length"))?;for &v in &buf[..n]{hist[v as usize]+=1;}}
    let f=model(&hist,len);let(c,total)=cumulative(&f);
    w.write_all(MAGIC)?;w.write_all(&len.to_be_bytes())?;for v in f{w.write_all(&v.to_be_bytes())?;}
    r.seek(SeekFrom::Start(0))?;
    let(mut lo,mut hi,mut pending)=(0,TOP,0);let mut out=BitsOut{w,b:0,n:0};
    loop{let n=r.read(&mut buf)?;if n==0{break}for &v in &buf[..n]{
        let i=v as usize;let range=hi-lo+1;
        hi=lo+range*c[i+1]/total-1;lo+=range*c[i]/total;
        loop{
            if hi<HALF{emit(&mut out,0,&mut pending)?;}
            else if lo>=HALF{emit(&mut out,1,&mut pending)?;lo-=HALF;hi-=HALF;}
            else if lo>=Q&&hi<TQ{pending+=1;lo-=Q;hi-=Q;}
            else{break}
            lo*=2;hi=hi*2+1;
        }
    }}
    if len>0{pending+=1;emit(&mut out,u8::from(lo>=Q),&mut pending)?;}out.finish()
}
fn decode<R:Read,W:Write>(mut r:R,mut w:W)->io::Result<()>{
    let mut h=[0;12];r.read_exact(&mut h)?;if &h[..4]!=MAGIC{return Err(err("magic"))}
    let len=u64::from_be_bytes(h[4..].try_into().unwrap());let mut f=[0u16;256];
    for v in &mut f{let mut b=[0;2];r.read_exact(&mut b)?;*v=u16::from_be_bytes(b);}
    let(c,total)=cumulative(&f);if total>SCALE||(len==0)!=(total==0){return Err(err("model"))}
    if len==0{return w.flush()}
    // Precompute exact inverse lookup of scaled cumulative frequencies.
    let mut lut=vec![0u8;total as usize];
    for i in 0..256{lut[c[i] as usize..c[i+1] as usize].fill(i as u8);}
    let mut input=BitsIn{r,b:0,n:0,pad:0};let(mut lo,mut hi,mut code)=(0,TOP,0);
    for _ in 0..32{code=code*2+input.bit()?;}
    let mut buf=[0u8;65536];let mut used=0;
    for _ in 0..len{
        if code<lo||code>hi{return Err(err("interval"))}
        let range=hi-lo+1;let z=((code-lo+1)*total-1)/range;let v=lut[z as usize];let i=v as usize;
        buf[used]=v;used+=1;if used==buf.len(){w.write_all(&buf)?;used=0;}
        hi=lo+range*c[i+1]/total-1;lo+=range*c[i]/total;
        loop{
            if hi<HALF{}
            else if lo>=HALF{lo-=HALF;hi-=HALF;code-=HALF;}
            else if lo>=Q&&hi<TQ{lo-=Q;hi-=Q;code-=Q;}
            else{break}
            lo*=2;hi=hi*2+1;code=code*2+input.bit()?;
        }
    }
    w.write_all(&buf[..used])?;w.flush()
}
fn main()->io::Result<()>{
    let a:Vec<_>=env::args_os().collect();if a.len()!=4{return Err(err("usage: ix04 encode|decode INPUT OUTPUT (or - for stdout)"))}
    let r=BufReader::new(File::open(&a[2])?);
    let w:Box<dyn Write>=if a[3]=="-"{Box::new(io::stdout().lock())}else{Box::new(File::create(&a[3])?)};
    let w=BufWriter::new(w);
    match a[1].to_str(){Some("encode")=>encode(r,w),Some("decode")=>decode(r,w),_=>Err(err("mode"))}
}
#[cfg(test)]
mod tests{
    use super::*;use std::io::Cursor;
    #[test]fn roundtrip(){
        let mut s=123456789u32;
        let random:Vec<u8>=(0..100000).map(|_|{s^=s<<13;s^=s>>17;s^=s<<5;s as u8}).collect();
        for x in [vec![],vec![0],vec![255;100000],(0..=255).collect(),random,b"arithmetic intervals ".repeat(3000)]{
            let mut a=vec![];encode(Cursor::new(&x),&mut a).unwrap();
            let mut b=vec![];decode(&a[..],&mut b).unwrap();assert_eq!(x,b);
        }
    }
}
