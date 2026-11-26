# C16 — Nontrivial multiplicative methods: feasibility

Status: planned next; pure number-theory track. Known factorization N=32Q, Q coprime to every prime <=997 (E0087).

Question: can a bounded nontrivial factorization method operate meaningfully on an approximately eight-billion-bit cofactor, and could any discovered factor yield a compact arithmetic description? Do not extend elementary trial division solely to increase the bound.

M1: investigate resource scaling of exact modular multiplication, GCD and modular exponentiation for large integers, including GMP-based implementations and Pollard p-1 as a candidate. Review prior art before novelty claims. Test constructed composites at geometrically increasing bit sizes, with known factors, and explicit time/memory caps. Separate arithmetic throughput from factoring probability; no extrapolation as measured full-target performance. M2: select a full-target method only if resource evidence justifies it; otherwise document infeasibility and investigate alternative compact whole-integer descriptions. No promise of a new factor or compression. Any factor found must divide Q exactly and be independently checked. Charge factor, quotient and all parameters in any later codec. Use standard public hosted CI only; no owner downloads or paid compute.

M1 E0088 authored: [bounded synthetic GMP feasibility protocol](../experiments/records/E0088.md). Hosted execution pending. No full-target factorization attempt or compression claim.

M1 E0088 passed all four synthetic cases. Important caveat: stage 1 fixed exponent is smaller than largest modulus bit width; see [results](../experiments/records/E0088.md). M2 E0089 exploits exact GCD with a much smaller odd auxiliary modulus via streaming radix folding and independently verified Bezout certificates, full corpus, two fixed exponent bounds. [Protocol](../experiments/records/E0089.md). Pending hosted CI.

E0089 independently verified both exact GCDs equal to 1. No new factors. [Evidence](../experiments/records/E0089.json). E0090 selected as a single scale experiment with 19-fold larger exponent, no rerun of old bounds. Resource caps and independent verification required. [Protocol](../experiments/records/E0090.md).

E0090 verified exact GCD=1; [closure](CAMPAIGN-16-CLOSURE.md).
