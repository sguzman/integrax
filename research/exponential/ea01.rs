//! EA01-E001: bounded exact oracle, modeled bit cost (not yet a packed archive).
//! Compile: rustc --edition=2021 -O research/exponential/ea01.rs -o /tmp/ea01
fn bits(x: u128) -> u32 { 128 - x.leading_zeros() }
fn gamma(x: u128) -> u32 { assert!(x > 0); 2 * bits(x) - 1 }
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
struct Candidate { b: u128, e: u32, negative: bool, residual: u128, cost: u32 }
fn candidate(n: u128, b: u128, e: u32, p: u128, bytes: u32) -> Candidate {
    let residual = n.abs_diff(p);
    let negative = p > n;
    // Gamma byte width, mode bit, gamma base/exponent, sign, gamma residual bit length+1,
    // magnitude in exactly that many bits. Byte padding accounted in reported archive estimate.
    let cost = gamma(bytes as u128) + 1 + gamma(b) + gamma(e as u128) + 1
        + gamma((bits(residual) + 1) as u128) + bits(residual);
    let reconstructed = if negative { p.checked_sub(residual) } else { p.checked_add(residual) };
    assert_eq!(reconstructed, Some(n));
    Candidate { b, e, negative, residual, cost }
}
fn raw_cost(bytes: u32) -> u32 { gamma(bytes as u128) + 1 + bytes * 8 }
fn rank(c: Candidate) -> (u32, u128, u128, u32) { (c.cost, c.residual, c.b, c.e) }
fn best(n: u128, bytes: u32, max_base: u128, adjacent: bool) -> Candidate {
    assert!((1..=16).contains(&bytes) && max_base >= 2 && bits(n) <= bytes * 8);
    let mut winner = None::<Candidate>;
    for b in 2..=max_base {
        let mut p = b;
        let mut e = 1;
        loop {
            let next = p.checked_mul(b);
            // For adjacent search only, include the largest power <= n and the first >= n.
            // With gamma exponent cost, smaller powers may occasionally be cheaper:
            // compare against the all-powers oracle rather than assert equivalence.
            if !adjacent || p >= n || next.map_or(true, |q| q > n) {
                let c = candidate(n, b, e, p, bytes);
                if winner.map_or(true, |w| rank(c) < rank(w)) { winner = Some(c); }
            }
            if p >= n { break; } // larger powers only increase residual and exponent cost
            match next { Some(q) => { p = q; e += 1; }, None => break }
        }
    }
    winner.unwrap()
}
fn rng(state: &mut u64) -> u64 {
    *state = state.wrapping_add(0x9e3779b97f4a7c15);
    let mut z = *state;
    z = (z ^ (z >> 30)).wrapping_mul(0xbf58476d1ce4e5b9);
    z = (z ^ (z >> 27)).wrapping_mul(0x94d049bb133111eb);
    z ^ (z >> 31)
}
fn report(name: &str, inputs: &[u128], bytes: u32) {
    let mut oracle_wins = 0;
    let mut adjacent_wins = 0;
    let mut adjacent_misses = 0;
    let mut encoded_bytes = 0u64;
    let mut raw_framed_bytes = 0u64;
    let mut best_saved = 0;
    for &n in inputs {
        let o = best(n, bytes, 64, false);
        let a = best(n, bytes, 64, true);
        assert!(o.cost <= a.cost);
        let raw = raw_cost(bytes).div_ceil(8);
        let ob = o.cost.div_ceil(8);
        let ab = a.cost.div_ceil(8);
        oracle_wins += usize::from(ob < bytes);
        adjacent_wins += usize::from(ab < bytes);
        adjacent_misses += usize::from(a.cost > o.cost);
        encoded_bytes += u64::from(raw.min(ob));
        raw_framed_bytes += u64::from(raw);
        best_saved = best_saved.max(bytes.saturating_sub(ob));
    }
    println!("{{\"group\":\"{name}\",\"count\":{},\"input_bytes\":{},\"raw_framed_bytes\":{raw_framed_bytes},\"modeled_archive_bytes\":{encoded_bytes},\"oracle_net_wins\":{oracle_wins},\"adjacent_net_wins\":{adjacent_wins},\"adjacent_cost_misses\":{adjacent_misses},\"max_saved_bytes\":{best_saved}}}", inputs.len(), inputs.len() * bytes as usize);
}
fn main() {
    let mut s = 0xea010001_u64;
    for bytes in [2u32, 4, 8, 16] {
        let mask = u128::MAX >> (128 - bytes * 8);
        let random: Vec<_> = (0..1024).map(|_| (((rng(&mut s) as u128) << 64) | rng(&mut s) as u128) & mask).collect();
        let mut near = Vec::new();
        for b in 2u128..=64 {
            let mut p = b;
            while let Some(q) = p.checked_mul(b).filter(|q| *q <= mask) { p = q; }
            for delta in [0u128, 1, 15, 255] {
                if let Some(n) = p.checked_add(delta).filter(|n| *n <= mask) { near.push(n); }
                if let Some(n) = p.checked_sub(delta) { near.push(n); }
            }
        }
        report("uniform", &random, bytes);
        report("near_power", &near, bytes);
    }
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test] fn boundaries() {
        for n in [0,1,2,3,255,256,65535,u128::MAX] {
            let o = best(n,16,64,false); let a = best(n,16,64,true);
            assert!(o.cost <= a.cost);
        }
    }
    #[test] fn exact_power() {
        let n = 3u128.pow(60);
        let c = best(n,16,64,false);
        assert_eq!(c.residual,0);
        assert!(c.cost < raw_cost(16));
    }
    #[test] fn independent_small_oracle() {
        for n in 0..=1024 {
            let mut candidates = Vec::new();
            for b in 2u128..=16 {
                for e in 1..=128 {
                    if let Some(p) = b.checked_pow(e) { candidates.push(candidate(n,b,e,p,2)); }
                }
            }
            assert_eq!(best(n,2,16,false), *candidates.iter().min_by_key(|c| rank(**c)).unwrap());
        }
    }
}
