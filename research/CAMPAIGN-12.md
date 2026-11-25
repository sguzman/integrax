# C12 — Sparse-corrected arithmetic recurrences

Active alongside final C11 measurement. Goal: test whether approximate repetition expressed as a radix recurrence plus sparse modular residual can outperform exact recurrence and static DAG tokens. M1: [derivation](../theory/sparse-corrected-recurrences.md), IXG2 mode18, single sparse correction with overlap-safe recurrence, all positions/values/flags charged. E0066 matched three-region strict authentic ablation plus Rust controls authored; CI pending. M2: independently verify only useful variants, compare actual coverage, residual cost and full sizes; if ineffective, close without scaling. No novelty claim; distinguish exact algebraic identity from compression performance. No user action or expenditure.

E0067 independent BigInt interval reference 40/40 exact synthetic cases; prior 80 mode15–17 observations unchanged. [External CI 45712332816](https://github.com/sguzman/integrax/actions/runs/45712332816) passed 40/40 byte-identical archives and strict cross-decodes.

[E0066](../experiments/records/E0066.md) 9/9 strict; patch16 mixed, largest +1248 B despite greater coverage. E0068 final matched-parse adaptive position/residual coding ablation (mode19), [cost analysis](../theory/sparse-correction-operand-cost.md), authored and pending. No full scaling until meaningful measured gain.
