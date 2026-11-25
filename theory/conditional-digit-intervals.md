# Conditional digit intervals

An integer's digit distribution does not determine its ordering. For an input of length L, define transition counts n_{c,a}, where c is previous digit or the distinct start context. Let n_c=sum_a n_{c,a}. The empirical first-order model q(a|c)=n_{c,a}/n_c assigns sequence information

  I_1=-sum_{c,a:n_{c,a}>0} n_{c,a} log2(n_{c,a}/n_c).

For the unconditional model q(a)=n_a/L, its information is I_0=L H(A). The start context is included as one observed transition, so I_0-I_1=L I(A;C)>=0 by the empirical joint distribution. This nonnegative difference is the ideal gain before model metadata, quantization and termination. The chain constraint means products of independent row multinomial counts are not in general the exact count of globally valid sequences with those transitions; we do not identify this interval with an exact Euler-trail rank.

IX05 charges 131,596 header bytes versus 524 for IX04. Conditional coding is only better in net size if the payload savings exceed 131,072 bytes. The scaled probabilities are exact rationals; log values are diagnostics. Comparing ideal bits, scaled bits and actual emitted bits isolates model quantization and interval rounding/termination overhead. No claim of novelty or actual gain until measurement.

## Uniform quantization loss bound

For any nonempty row with K positive frequencies and scaling S=32768, p_i=n_i/n_c, the IX04/IX05 rule gives f_i=1+floor((S-K)p_i)>=(S-K)p_i and F=sum f_i<=S. Hence the coded model q_i=f_i/F satisfies q_i>=(1-K/S)p_i. Each observed symbol's extra information log2(p_i/q_i) is at most -log2(1-K/S). Summing over the row shows 0<=D(p||q)<=-log2(1-K/S) bits per symbol, by nonnegativity of KL divergence. For K<=256, this is <=log2(128/127), or about 0.011316 bits per symbol. Across a billion symbols the bound is less than 1,415,000 bytes of model quantization loss (not including header, rounding or termination). The same bound applies to conditional rows by weighting their observed lengths. Thus improving static frequency resolution alone cannot account for hundreds of megabytes of missing compression; dependence modeling is the larger opportunity. This elementary derivation is not a novelty claim.
