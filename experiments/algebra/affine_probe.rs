//! Exact affine-subspace radix description over GF(2). Research control, not a contest codec.
use std::{fs::File,io::{Read,Seek,SeekFrom},time::Instant};
fn word(b:&[u8])->u128{b.iter().fold(0,|a,&x|(a<<8)|x as u128)}
fn emit(out:&mut Vec<u8>,x:u128,w:usize){out.extend_from_slice(&x.to_be_bytes()[16-w..]);}
fn take<'a>(b:&mut &'a[u8],n:usize)->Result<&'a[u8],&'static str>{if b.len()<n{return Err("truncated")}let(x,y)=b.split_at(n);*b=y;Ok(x)}
fn pack(xs:&[u128],r:usize)->Vec<u8>{
 let mut out=vec![0;(xs.len()*r+7)/8];
 for(i,&x)in xs.iter().enumerate(){for j in 0..r{if (x>>j)&1!=0{let p=i*r+j;out[p/8]|=1<<(p%8);}}}out
}
fn unpack(b:&[u8],n:usize,r:usize)->Result<Vec<u128>,&'static str>{
 if b.len()!=(n*r+7)/8{return Err("bad packed length")}
 if n*r%8!=0&&b.last().copied().unwrap_or(0)>>(n*r%8)!=0{return Err("nonzero padding")}
 let mut xs=vec![0;n];for(i,x)in xs.iter_mut().enumerate(){for j in 0..r{let p=i*r+j;*x|=(((b[p/8]>>(p%8))&1)as u128)<<j;}}Ok(xs)
}
fn axis(x:u128,mask:u128)->u128{
 let mut y=0;let mut m=mask;let mut j=0;
 while m!=0{let p=m.trailing_zeros();y|=((x>>p)&1)<<j;j+=1;m&=m-1;}y
}
fn expand(x:u128,mask:u128)->u128{
 let mut y=0;let mut m=mask;let mut j=0;
 while m!=0{let p=m.trailing_zeros();y|=((x>>j)&1)<<p;j+=1;m&=m-1;}y
}
fn basis_coords(xs:&[u128],bits:usize)->(Vec<u128>,Vec<u128>){
 let mut piv=[None;128];let mut bs=Vec::new();let mut cs=Vec::with_capacity(xs.len());
 for &x in xs{
  let(mut z,mut c)=(x,0u128);
  while z!=0{
   let p=127-z.leading_zeros() as usize;assert!(p<bits);
   if let Some(i)=piv[p]{z^=bs[i];c^=1u128<<i;}
   else{let i=bs.len();assert!(i<bits);piv[p]=Some(i);bs.push(z);c^=1u128<<i;break;}
  }
  cs.push(c);
 }
 (bs,cs)
}
#[derive(Default,Debug)]
struct Stats{raw:u64,axis:u64,affine:u64,rank_sum:u64,groups:u64}
fn encode(input:&[u8],w:usize,rows:usize,allow_affine:bool)->(Vec<u8>,Stats){
 assert!([4,8,16].contains(&w));assert!([128,512].contains(&rows));
 let mut out=b"IXA1".to_vec();out.push(w as u8);out.extend_from_slice(&(rows as u16).to_le_bytes());out.extend_from_slice(&(input.len() as u64).to_le_bytes());
 let mut st=Stats::default();
 for block in input.chunks(w*rows){
  if block.len()!=w*rows{out.push(0);out.extend_from_slice(block);st.raw+=1;continue;}
  let base=word(&block[..w]);let xs:Vec<_>=block.chunks_exact(w).map(|x|word(x)^base).collect();
  let mask=xs.iter().fold(0,|a,&x|a|x);let k=mask.count_ones() as usize;
  let (bs,cs)=if allow_affine{basis_coords(&xs,8*w)}else{(vec![],vec![])};
  let r=bs.len();st.groups+=1;st.rank_sum+=r as u64;
  let raw=1+block.len();let ax=1+2*w+(rows*k+7)/8;
  let af=if allow_affine{2+w+r*w+(rows*r+7)/8}else{usize::MAX};
  if af<raw&&af<ax{
   out.push(2);out.push(r as u8);emit(&mut out,base,w);for &b in &bs{emit(&mut out,b,w);}out.extend(pack(&cs,r));st.affine+=1;
  }else if ax<raw{
   out.push(1);emit(&mut out,base,w);emit(&mut out,mask,w);out.extend(pack(&xs.iter().map(|&x|axis(x,mask)).collect::<Vec<_>>(),k));st.axis+=1;
  }else{out.push(0);out.extend_from_slice(block);st.raw+=1;}
 }
 (out,st)
}
fn decode(mut b:&[u8],limit:usize)->Result<Vec<u8>,&'static str>{
 if take(&mut b,4)?!=b"IXA1"{return Err("magic")}
 let w=take(&mut b,1)?[0] as usize;let rows=u16::from_le_bytes(take(&mut b,2)?.try_into().unwrap())as usize;
 let n=usize::try_from(u64::from_le_bytes(take(&mut b,8)?.try_into().unwrap())).map_err(|_|"length")?;
 if ![4,8,16].contains(&w)||![128,512].contains(&rows)||n>limit{return Err("header")}
 let mut out=Vec::with_capacity(n);
 while out.len()<n{
  let len=(n-out.len()).min(w*rows);let tag=take(&mut b,1)?[0];
  if tag==0{out.extend_from_slice(take(&mut b,len)?);continue;}
  if len!=w*rows{return Err("partial nonraw")}
  match tag{
   1=>{let base=word(take(&mut b,w)?);let mask=word(take(&mut b,w)?);let k=mask.count_ones()as usize;
    let cs=unpack(take(&mut b,(rows*k+7)/8)?,rows,k)?;
    for c in cs{emit(&mut out,base^expand(c,mask),w);}
   },
   2=>{let r=take(&mut b,1)?[0]as usize;if r>8*w{return Err("rank")}
    let base=word(take(&mut b,w)?);let mut bs=Vec::new();
    for _ in 0..r{bs.push(word(take(&mut b,w)?));}
    if basis_coords(&bs,8*w).0.len()!=r{return Err("dependent basis")}
    let cs=unpack(take(&mut b,(rows*r+7)/8)?,rows,r)?;
    for c in cs{let mut x=base;for(i,&v)in bs.iter().enumerate(){if c>>i&1!=0{x^=v;}}emit(&mut out,x,w);}
   },
   _=>return Err("tag")
  }
 }
 if !b.is_empty(){return Err("trailing")}
 Ok(out)
}
fn main(){
 let args:Vec<_>=std::env::args().collect();assert_eq!(args.len(),2,"usage: affine_probe ENWIK9");
 let mut f=File::open(&args[1]).unwrap();assert_eq!(f.metadata().unwrap().len(),1_000_000_000);
 let mut input=vec![0;1<<20];
 for offset in [0,400_000_000,800_000_000]{
  f.seek(SeekFrom::Start(offset)).unwrap();f.read_exact(&mut input).unwrap();
  for w in [4,8,16]{for rows in [128,512]{
   let t=Instant::now();let(ax,_)=encode(&input,w,rows,false);let(a,st)=encode(&input,w,rows,true);
   assert_eq!(decode(&ax,input.len()).unwrap(),input);assert_eq!(decode(&a,input.len()).unwrap(),input);
   assert!(a.len()<=ax.len());let mut extra=a.clone();extra.push(0);assert!(decode(&extra,input.len()).is_err());
   println!("AFFINE offset={offset} bytes={} width={w} rows={rows} axis_bytes={} affine_bytes={} groups={} rank_sum={} raw_groups={} axis_groups={} affine_groups={} seconds={:.6} verified=true",input.len(),ax.len(),a.len(),st.groups,st.rank_sum,st.raw,st.axis,st.affine,t.elapsed().as_secs_f64());
  }}
 }
}
#[cfg(test)]
mod tests{
 use super::*;
 #[test]fn exact_coordinates(){
  for xs in [vec![0,1,2,3],vec![7,6,5,4],vec![0,u128::MAX,1,1<<127]]{
   let(bs,cs)=basis_coords(&xs,128);
   for (&x,c)in xs.iter().zip(cs){assert_eq!(x,bs.iter().enumerate().filter(|(i,_)|c>>i&1!=0).fold(0,|a,(_,v)|a^v));}
  }
 }
 #[test]fn planted_nonaxis(){
  let mut x=Vec::new();for i in 0..512{emit(&mut x,0x12345678^if i%2==0{0}else{0xffffffff},4);}
  let(a,s)=encode(&x,4,512,true);let(b,_)=encode(&x,4,512,false);assert!(s.affine>0&&a.len()<b.len());assert_eq!(decode(&a,x.len()).unwrap(),x);
 }
 #[test]fn roundtrips(){
  let mut seed=123456789u64;let data:Vec<_>=(0..8193).map(|_|{seed^=seed<<13;seed^=seed>>7;seed^=seed<<17;seed as u8}).collect();
  for w in [4,8,16]{for n in [0,1,17,512,8193]{for rows in [128,512]{for allow in [false,true]{
   let(a,_)=encode(&data[..n],w,rows,allow);assert_eq!(decode(&a,n).unwrap(),data[..n]);
   assert!(decode(&a[..a.len()-1],n).is_err());let mut extra=a.clone();extra.push(0);assert!(decode(&extra,n).is_err());
  }}}}
 }
 #[test]fn packed_full_width(){let x=[u128::MAX,1<<127,0];for r in [0,1,7,64,127,128]{let mask=if r==128{u128::MAX}else{(1u128<<r)-1};let y:Vec<_>=x.iter().map(|v|v&mask).collect();assert_eq!(unpack(&pack(&y,r),y.len(),r).unwrap(),y);}}
}
