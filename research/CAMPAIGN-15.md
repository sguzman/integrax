# C15 — Whole-integer multiplicative reconnaissance

Status: active in parallel with C14; pure number-theory track. E0086 is a bounded diagnostic, not a codec or compression result.

Question: what small prime factors actually divide the complete enwik9 integer, as opposed to the short authentic slices studied in C03? Can multiplicative structure motivate a cost-accounted follow-up?

Method: treat all 1,000,000,000 bytes as one nonnegative big-endian integer N. Survey every prime <=97 by exact streaming Horner reduction modulo grouped products <=2^60. Since p divides its group modulus M, N mod M determines N mod p. For observed divisors, perform a second pass modulo the largest p^k <=2^60. A nonzero residue gives the exact valuation; zero gives only a lower bound k. No large integer materialization, no random assumptions, no claim of primality for the unexamined cofactor. Report group and power residues and verified input SHA-256; tests compare against native u128 controls. Memory bounded by a 64 KiB buffer plus small tables. Two complete passes at most. Standard hosted CI only.

Acceptance: require successful tests and corpus hash checks before/after survey, complete evidence and consistent group/power residues. Independent full-corpus verification before any strong factor claim beyond the diagnostic. No factorization of the residual cofactor or compression claim. If small divisors are found, assess exact factor encoding costs; raw factors normally cannot save bits. Revisit C03 only when there is structural evidence beyond ordinary small factors.

Prior art: elementary modular Horner evaluation, divisibility, valuations; see [C03 cost analysis](../theory/multiplicative-description-cost.md). No novelty claim.
