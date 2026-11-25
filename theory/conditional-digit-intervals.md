# Conditional digit intervals

An integer's digit distribution does not determine its ordering. For an input of length L, define transition counts n_{c,a}, where c is previous digit or the distinct start context. Let n_c=sum_a n_{c,a}. The empirical first-order model q(a|c)=n_{c,a}/n_c assigns sequence information

  I_1=-sum_{c,a:n_{c,a}>0} n_{c,a} log2(n_{c,a}/n_c).

For the unconditional model q(a)=n_a/L, its information is I_0=L H(A). The start context is included as one observed transition, so I_0-I_1=L I(A;C)>=0 by the empirical joint distribution. This nonnegative difference is the ideal gain before model metadata, quantization and termination. The chain constraint means products of independent row multinomial counts are not in general the exact count of globally valid sequences with those transitions; we do not identify this interval with an exact Euler-trail rank.

IX05 charges 131,596 header bytes versus 524 for IX04. Conditional coding is only better in net size if the payload savings exceed 131,072 bytes. The scaled probabilities are exact rationals; log values are diagnostics. Comparing ideal bits, scaled bits and actual emitted bits isolates model quantization and interval rounding/termination overhead. No claim of novelty or actual gain until measurement.
