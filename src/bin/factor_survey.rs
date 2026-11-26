//! Bounded exact divisibility survey of a big-endian byte integer.
use std::{fs::File, io::{self, Read}, path::Path};
const PRIMES: [u64; 25] = [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97];
const CAP: u64 = 1 << 60;

fn groups(primes: &[u64]) -> Vec<u64> {
    let mut result = Vec::new();
    let mut product = 1;
    for &p in primes {
        if product > CAP / p {
            result.push(product);
            product = 1;
        }
        product *= p;
    }
    if product > 1 { result.push(product); }
    result
}

fn residues(mut input: impl Read, moduli: &[u64]) -> io::Result<(u64, bool, Vec<u64>)> {
    let mut rs = vec![0u64; moduli.len()];
    let mut buf = [0u8; 65536];
    let mut len = 0u64;
    let mut nonzero = false;
    loop {
        let n = input.read(&mut buf)?;
        if n == 0 { break; }
        len += n as u64;
        nonzero |= buf[..n].iter().any(|&b| b != 0);
        let chunks = buf[..n].chunks_exact(8);
        let tail = chunks.remainder();
        for block in chunks {
            let value = u64::from_be_bytes(block.try_into().unwrap());
            for (r, &m) in rs.iter_mut().zip(moduli) {
                *r = (((*r as u128) << 64 | value as u128) % m as u128) as u64;
            }
        }
        for &b in tail {
            for (r, &m) in rs.iter_mut().zip(moduli) {
                *r = (((*r as u128) << 8 | b as u128) % m as u128) as u64;
            }
        }
    }
    Ok((len, nonzero, rs))
}
fn power_cap(p: u64) -> (u64, u32) {
    let (mut m, mut k) = (p, 1);
    while m <= CAP / p { m *= p; k += 1; }
    (m, k)
}
fn valuation(p: u64, mut residue: u64, cap: u32) -> (u32, bool) {
    if residue == 0 { return (cap, false); }
    let mut n = 0;
    while residue % p == 0 { residue /= p; n += 1; }
    (n, true)
}
fn primes_through(limit: u64) -> Vec<u64> {
    let mut primes = Vec::new();
    for n in 2..=limit {
        if primes.iter().take_while(|&&p| p <= n / p).all(|&p| n % p != 0) {
            primes.push(n);
        }
    }
    primes
}
fn survey(path: &Path, limit: u64) -> io::Result<()> {
    let primes = primes_through(limit);
    let mods = groups(&primes);
    let (len, nonzero, rs) = residues(File::open(path)?, &mods)?;
    if !nonzero { return Err(io::Error::new(io::ErrorKind::InvalidData, "zero has no finite prime factorization")); }
    let factors: Vec<u64> = primes.iter().copied().filter(|p| {
        mods.iter().zip(&rs).any(|(&m,&r)| m % p == 0 && r % p == 0)
    }).collect();
    println!("SURVEY bytes={len} primes_tested={} max_prime={} group_count={}", primes.len(), primes.last().unwrap(), mods.len());
    for (&m,&r) in mods.iter().zip(&rs) { println!("GROUP modulus={m} residue={r}"); }
    let powers: Vec<_> = factors.iter().map(|&p| power_cap(p)).collect();
    let power_mods: Vec<_> = powers.iter().map(|&(m,_)| m).collect();
    if !factors.is_empty() {
        let (again, nz, prs) = residues(File::open(path)?, &power_mods)?;
        if again != len || !nz { return Err(io::Error::new(io::ErrorKind::InvalidData, "input changed")); }
        for ((&p,&(m,k)),&r) in factors.iter().zip(&powers).zip(&prs) {
            let (e, exact) = valuation(p,r,k);
            if e == 0 { return Err(io::Error::new(io::ErrorKind::InvalidData, "inconsistent divisibility")); }
            println!("FACTOR prime={p} exponent={e} exact={exact} modulus={m} residue={r}");
        }
    }
    println!("SURVEY_COMPLETE partial_factorization_only=true");
    Ok(())
}
fn main() -> io::Result<()> {
    let path = std::env::args_os().nth(1).ok_or_else(|| io::Error::new(io::ErrorKind::InvalidInput,"usage: factor_survey FILE"))?;
    let limit = std::env::args().nth(2).map(|s| s.parse::<u64>()).transpose().map_err(|_| io::Error::new(io::ErrorKind::InvalidInput,"invalid prime bound"))?.unwrap_or(97);
    if !(2..=10000).contains(&limit) { return Err(io::Error::new(io::ErrorKind::InvalidInput,"prime bound must be 2..=10000")); }
    survey(Path::new(&path), limit)
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn exact_against_native_u128() {
        let mods = groups(&PRIMES);
        for n in [0u128, 1, 2, 256, 123456789012345678901234567890, u128::MAX] {
            for start in 0..8 {
                let bytes = n.to_be_bytes();
                let input = &bytes[start..];
                let actual = input.iter().fold(0u128, |a,&b| (a<<8)|b as u128);
                let (len,nz,rs) = residues(input,&mods).unwrap();
                assert_eq!(len,input.len() as u64);
                assert_eq!(nz,actual!=0);
                for (&m,&r) in mods.iter().zip(&rs) { assert_eq!(r, (actual % m as u128) as u64); }
            }
        }
    }
    #[test]
    fn generated_prime_bounds() {
        assert_eq!(primes_through(97), PRIMES);
        assert_eq!(primes_through(997).len(), 168);
        assert_eq!(primes_through(997).last(), Some(&997));
    }
    #[test]
    fn prime_groups_cover_once() {
        let mods = groups(&PRIMES);
        for p in PRIMES { assert_eq!(mods.iter().filter(|&&m| m%p==0).count(),1); }
        assert!(mods.iter().all(|&m| m <= CAP));
    }
    #[test]
    fn exact_and_censored_valuations() {
        for p in PRIMES {
            let (m,k)=power_cap(p);
            assert_eq!(valuation(p,0,k),(k,false));
            assert_eq!(valuation(p,1,k),(0,true));
            assert_eq!(valuation(p,m/p,k),(k-1,true));
        }
        assert_eq!(valuation(3, 81*7, 10),(4,true));
    }
    #[test]
    fn known_product_and_large_modulus_tail() {
        let n = 2u128.pow(12)*3u128.pow(6)*97u128.pow(2)*101;
        let mods = groups(&PRIMES);
        let (_,_,rs)=residues(&n.to_be_bytes()[5..],&mods).unwrap();
        let found: Vec<_>=PRIMES.into_iter().filter(|p|mods.iter().zip(&rs).any(|(&m,&r)|m%p==0&&r%p==0)).collect();
        assert_eq!(found,vec![2,3,97]);
        let m=(1u64<<60)-1;
        let data=[255u8; 9];
        assert_eq!(residues(&data[..],&[m]).unwrap().2[0], (((1u128<<72)-1)%m as u128) as u64);
    }
}
