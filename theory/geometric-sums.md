# Whole-integer geometric templates

Let B=256, L=qp+t (0<=t<p), and A be a p-byte template, including leading zeros; P=floor(A/B^(p-t)) is its first t bytes (P=0 when t=0). The length-L periodic digit sequence has integer value

T=A B^t (B^(pq)-1)/(B^p-1)+P.

The geometric quotient is exact, including q=0. If template byte at position i is u_i and actual byte is x_i, N=T+sum_{i:x_i!=u_i}(x_i-u_i) B^(L-1-i). Thus template and a sparse list of corrections determine N and preserve all leading zeros through L. Replacing digits instead of materializing giant powers is an exact evaluation strategy, not a blockwise codec. The difference coefficient is implicit in the replacement byte and template.

For fixed p, choosing the most frequent byte within each residue class minimizes the *number* of corrections. Proof: each class has size n_j, and selecting byte v incurs n_j-count_j(v) corrections; the classes are independent. This does not necessarily minimize serialized cost when correction gaps use variable-length codes. A search over widths with modal templates is bounded heuristic, not an optimality theorem.

IX03 will charge the header, template length, template, count, gap varints and replacement bytes. At least two bytes per correction; if L is large, p small and k sparse, size is O(p+k log L+log L), rather than O(L). Exact repeats need no corrections. For uniformly random strings, period structure is unlikely; real input requires measurement. These are elementary identities and bounds, not novelty claims. Periodic representations connect to run-length, dictionary and grammar compression; no priority claim.
