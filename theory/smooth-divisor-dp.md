# Exact cost optimization for smooth divisors

Let P be the fixed prime table, Z=N-r>0, v_i its valuation at p_i. A legal divisor D=prod p_i^e_i has 0<=e_i<=v_i. At fixed residual, the IXM2 header includes a fixed bitmap; only exponent bytes and raw quotient vary. For each prime and nonzero LEB128 width w, the largest e<=v_i in that band weakly dominates all smaller e in the same band, since it enlarges D without changing metadata. Zero is the sole zero-cost option.

Define A_i(c) as the largest divisor formed from the first i primes at exact exponent cost c; unreachable states are absent. A_0(0)=1. Then

    A_i(c)=max_e A_(i-1)(c-v(e)) * p_i^e,

where v(0)=0 and the maximum spans the retained choices. Induction establishes exactness: multiplying by a fixed positive power preserves order, so a smaller divisor at the same cost cannot improve a future state. Because every candidate divides Z, for each cost c, Z/A_K(c) is an integer and has the smallest possible raw quotient width among candidates at c. Compare the full frame cost across c and residuals, including mask, length, mode and residual byte. Thus IXM2 is globally size-optimal within its bounded grammar and raw fallback, not merely greedy. This does not prove optimality for arbitrary smooth-factor coding, recursive quotients, larger prime tables, or other residuals.

With K primes and B exponent-width bands, state count <=KB+1 and transitions O(K^2 B^2), ignoring large-integer multiplication, valuation search and bit complexity. This is a bounded exact arithmetic search, not a claim of practical full-enwik9 factorization. Brute-force DP verification in E0011 checks all exact-cost states for 1024 positive small integers. Established elementary dynamic programming principle; no novelty claim.
