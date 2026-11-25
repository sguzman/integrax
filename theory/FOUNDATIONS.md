# Foundations

For bytes x of length L define N=sum x_i 256^(L-1-i). The pair (L,N), 0 <= N < 256^L, is bijective with byte strings, including empty and leading-zero strings. Fixed-length base-256 expansion is its inverse.

For a versioned arithmetic expression language G with exact evaluation, define D_G(N,L)=min |encode_G(e,L)| over valid descriptions e of N. This is grammar-relative description length, not intrinsic Kolmogorov complexity. Include literals, signs, operation tags, boundaries, sharing references and residuals. Charge all side data. Search may approximate, decode must be exact.

Elementary derivations (not novelty claims):
1. There are 2^(8L) L-byte inputs and only 2^(8L)-1 shorter binary strings; no injective compressor shrinks every input. At most 2^(8L-k+1)-1 inputs admit descriptions of length <=8L-k bits (1<=k<=8L).
2. With a=floor(N^(1/b)), b>=2, the residual satisfies 0<=r<(a+1)^b-a^b. The gap is asymptotic to b*a^(b-1) for fixed b and large a. The leading bit costs of the base and a full-width residual roughly sum to the original width, before overhead. This heuristic is not a universal lower bound; unusually small or structured residuals are the opportunity.
3. CRT residues determine N only modulo the product M of pairwise coprime moduli. Unique reconstruction across the entire input domain needs M>=256^L or additional data. Moduli, quotient and selectors must be charged unless fixed in the charged decoder.

Bound search by time, memory, evaluated bit width and grammar complexity. Compare actual serialized bytes, not decimal digits or numeric magnitude.
