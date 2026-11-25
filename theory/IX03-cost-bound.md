# IX03 coverage and cost bounds

Let L be input bytes, p template width, k corrections, and v(n) the length of the canonical unsigned LEB128 representation of n. With gaps g_i, the exact arithmetic frame size is

S = 13 + v(p) + p + v(k) + sum_i (v(g_i) + 1).

Since v(n)>=1, S>=15+p+2k. Consequently net savings of d>=1 bytes requires k <= floor((L-d-15-p)/2). A template matching at most half of the input digits cannot give net savings in IX03 regardless of gap arrangement. This is a necessary condition, not sufficient: larger gaps add cost.

For a uniformly random L-byte string, a fixed template of width p determines one repeated pattern. Exactly binom(L,j)*255^j strings lie at Hamming distance j from it. There are 256^p possible templates. A union bound over templates and p gives

P(S<=L-d) <= min(1, sum_{p=1}^{min(256,floor(L/2))} 256^(p-L) sum_{j=0}^{floor((L-d-15-p)/2)} binom(L,j)255^j),

where a negative upper summation limit denotes zero. This holds even if template search were exhaustive, not just modal. Using j<=L/2, 255^j<=256^(L/2), and sum_j binom(L,j)<=2^L, we obtain the coarser bound min(1,256*2^(2048-3L)). For L=1024, it is <=2^-1016. This is only a bound for uniform inputs, not a model of Wikipedia.

For periodic sequences with k=O(1), frame size remains O(p+log L), as expected. For fixed p and fixed mutation stride h, if each correction gap is h-1 and fits v(h-1) bytes, then S/L approaches (v(h-1)+1)/h, plus vanishing header/template/count cost. This predicts the constructed stride-257 control tends to 3/257 before metadata. The formula applies to the chosen template; the actual encoder may find a shorter one.

The modal choice minimizes Hamming distance for fixed p but need not minimize S because correction locations influence varint lengths. Treat this as a bounded candidate search, not an optimality claim.

Elementary counting and cost derivations; no novelty claim.
