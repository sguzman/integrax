# C16 — Nontrivial multiplicative methods: feasibility

Status: planned next; pure number-theory track. Known factorization N=32Q, Q coprime to every prime <=997 (E0087).

Question: can a bounded nontrivial factorization method operate meaningfully on an approximately eight-billion-bit cofactor, and could any discovered factor yield a compact arithmetic description? Do not extend elementary trial division solely to increase the bound.

M1: investigate resource scaling of exact modular multiplication, GCD and modular exponentiation for large integers, including GMP-based implementations and Pollard p-1 as a candidate. Review prior art before novelty claims. Test constructed composites at geometrically increasing bit sizes, with known factors, and explicit time/memory caps. Separate arithmetic throughput from factoring probability; no extrapolation as measured full-target performance. M2: select a full-target method only if resource evidence justifies it; otherwise document infeasibility and investigate alternative compact whole-integer descriptions. No promise of a new factor or compression. Any factor found must divide Q exactly and be independently checked. Charge factor, quotient and all parameters in any later codec. Use standard public hosted CI only; no owner downloads or paid compute.

M1 E0088 authored: [bounded synthetic GMP feasibility protocol](../experiments/records/E0088.md). Hosted execution pending. No full-target factorization attempt or compression claim.
