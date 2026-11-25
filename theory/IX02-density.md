# IX02 net-savings density bound

Elementary derivation, not novelty claim. Fix L-byte inputs and the IX02 format. For mode 1 let A,R >= 1 be encoded magnitude lengths. A frame costs at least 13+2+1+1+A+R=17+A+R bytes. To save at least k>=1 bytes requires A+R<=L-17-k. For each sum s there are s-1 ordered positive pairs, at most 31*2 exponent/sign choices, and at most 256^s magnitude byte combinations (overcounts noncanonical values and invalid frames). Thus for uniform independent input bytes,

P(saving >= k) <= min(1, 62 * sum_{s=2}^{L-17-k} (s-1)256^(s-L))

with empty sum zero. A simpler bound for L>=1 is min(1, 62 L (256/255) 256^(-17-k)), using s-1<=L and the geometric series. Each valid encoding denotes at most one input, so the counting bound holds even for an exhaustive search and regardless of decoder limits. It is an upper bound, not a probability estimate for Wikipedia or for the seeded control. For one-byte savings at L=10^9, the coarse bound is < 2^-108 (verify inequality using 62e9*256/255 < 2^36). No extrapolation to enwik9 is justified.

The floor/ceil-root restriction is sufficient to minimize absolute residual for a given exponent but does not necessarily minimize serialized size over all bases: base magnitude cost can change at byte boundaries. Investigate boundary candidates or alternative grammar only when motivated. For a constructed a^4 plus a fixed-size residual, base cost scales near L/4 and metadata grows logarithmically; net ratio tends to 1/4 within the idealized uncapped format.
