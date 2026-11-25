# C07 — Arithmetic DAG costs and limitations

The map from finite bytes to (N,L) is a bijection. Define concatenation C((A,a),(B,b))=(A*256^b+B,a+b). It is associative by distributivity and exponent addition, and its value exactly matches concatenated byte strings, including leading zeros. Any straight-line string grammar with topological binary concatenation rules is therefore a restricted arithmetic circuit. Evaluating lengths and expanding leaves is equivalent to materializing the giant integer then extracting its base-256 digits; the latter is unnecessary.

For alphabet size k, n rules, r root symbols and original length L, define w(t)=ceil(log2 t), v(t)=unsigned LEB128 byte length. IXG1 grammar archive size is

  5+v(L)+v(k)+k+v(n)+v(r)+ceil((2 sum_(i=0)^(n-1) w(k+i)+r*w(k+n))/8).

All symbols/refs, root boundaries and alphabet charged. If a candidate pair occurs c times nonoverlapping, replacing it creates one rule and changes r to r-c. At fixed current grammar and rule insertion, candidate cost is nonincreasing in c; a maximum-count pair minimizes immediate serialized size among one-step substitutions, including varint transitions and byte padding. This says nothing about future reuse or globally shortest straight-line programs. An identical-symbol pair occurs floor(run_length/2) times per maximal run, while distinct-symbol occurrences never overlap. E0020 independently validates counts against actual replacement on exhaustive ternary strings.

At a width boundary, every root symbol can become more expensive; a strictly monotone greedy rule can stop despite possible multi-step improvements. This is a search limitation, not a lower bound. Prior art: straight-line programs, grammar compression, Re-Pair (Larsson and Moffat), smallest grammar problem (Charikar et al.). The arithmetic embedding is a standard radix identity, not a novel theorem. Compare archive bytes to gzip and other baselines; distinguish reused subexpressions from arbitrary arithmetic expressions.
