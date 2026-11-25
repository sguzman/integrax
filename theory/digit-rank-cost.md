# C04 — Exact rank cost and the order-zero ceiling

## Histogram class coding

For counts n_i summing to L, every multinomial prefix count M*n_i/L is an integer. More generally, the cumulative count before symbol j is M*(sum_{i<j} n_i)/L, as it is the sum of disjoint first-symbol classes. Inductively, after choosing j, the remaining class has M'=M*n_j/L and the rank within it lies in [0,M'). The empty remaining string has M=1. This proves lexicographic rank/unrank is bijective.

An IXR1 frame costs B=4+v(L)+v(K)+sum_{i:n_i>0}(1+v(n_i))+ceil(log2(M)/8) bytes, with v the canonical unsigned LEB128 length. Here ceil(log2(M)/8) is exactly ceil(bit_length(M-1)/8), including M=1. All model metadata is explicit. The grammar cannot distinguish two orderings with the same histogram by description length: their ranks have the same fixed width.

## Relating exact rank and entropy

Let p_i=n_i/L, H=-sum p_i log2 p_i, and K the positive support. For L>=1, the standard method-of-types bounds give

  2^(L H)/(L+1)^K <= M <= 2^(L H).

For the upper bound, the total probability of the histogram under IID p is M prod p_i^n_i = M 2^(-LH) <=1. For the lower bound, its probability is maximal among the possible histograms under p: from any different histogram m, move one count from an excess coordinate i (m_i>n_i) to a deficit coordinate j (m_j<n_j); the probability ratio m_i p_j/((m_j+1)p_i) >=1 for positive p_i,p_j. Histograms outside support have probability zero. Thus the target histogram has probability at least the reciprocal of the number of histograms, at least (L+1)^(-K). This proves the stated lower bound. Consequently the exact-rank gain relative to ideal order-zero coding is at most K log2(L+1) bits before metadata and rounding.

For L=10^9, K<=256, this bound is under 7,655 bits (957 bytes when rounded up). This is a mathematical bound on rank length vs empirical entropy, not a measured enwik9 entropy or a guarantee that finite precision IX04 reaches it.

## Consequence for research

Global order-zero rank and global static arithmetic coding exploit the same histogram, but not ordering. A rank may be far smaller than the original giant integer without getting close to the contest target. To exploit dependencies, use conditional ranks or reversible transformations; compare on actual data and count model/selector/framing bytes. The exact method-of-types argument is established information theory, not a novelty claim.

Evidence: [E0006](../experiments/records/E0006.md) confirms small-scale bijections and metadata costs; IX04 full-corpus experiment pending.
