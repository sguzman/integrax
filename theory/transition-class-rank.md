# Exact transition-class cardinalities

C04 mathematical extension. This is an elementary application of the directed matrix-tree theorem and the last-exit/BEST counting argument, not a claim of new mathematics. It addresses the gap identified in conditional-digit-intervals.md: row multinomial ranks count edge-choice orders, not necessarily valid global digit strings.

Let x be nonempty, add an artificial start vertex s distinct from all byte values, and form the directed multigraph of successive digits (including s -> x_0). Edge multiplicities n_{ij} are the transition counts, d_i=sum_j n_{ij} is the outdegree, and t is the last digit. Restrict to vertices incident to at least one edge; s has outdegree 1 and indegree 0, and t is the unique vertex with indegree minus outdegree 1. The degree balance and t are determined by the matrix. All nonterminal active vertices have positive outdegree. Let tau_t be the number of spanning arborescences directed toward t, counting parallel edge choices. It equals the determinant of the t-deleted row-outdegree Laplacian minor: diagonal d_i-n_{ii}, off-diagonal -n_{ij}. Loops do not contribute to the tree.

The number M of distinct digit strings with the given matrix is

    M = tau_t * product_i (d_i - 1 + [i=t])! / product_{i,j} n_{ij}!

Proof: label every individual edge. For each labeled Euler trail from s to t, the last outgoing edge from every vertex other than t must form an arborescence toward t: a directed cycle of last exits is impossible because each such exit requires a later departure from the next nonterminal vertex. Conversely, choose such a tree, place each tree edge last in its vertex's departure order, and arbitrarily order all other labeled departures. Following these orders from s cannot stop except at t by degree balance. If edges remain on stopping, an unused departure at some vertex implies its last tree edge remains unused; follow tree edges toward t to obtain an unused arrival at t, forcing an unused departure there by the balanced residual degrees. This contradicts stopping at t. Thus the orders produce a unique complete trail. The number of orders per tree is the factorial product in the numerator. Each unlabeled vertex string corresponds to exactly product n_{ij}! assignments of labels to occurrences. Divide to obtain M. Empty string: separate class of size 1.

The independent row-order class count is

    U = product_i d_i! / product_{i,j} n_{ij}!

so M/U = tau_t / product_{i != t} d_i. Equivalently this ratio is the probability that independent uniformly chosen labeled outgoing edges from each nonterminal vertex form a spanning arborescence. Since an observed sequence guarantees at least one such tree, 1 <= tau_t <= product d_i, and

    0 <= log2 U - log2 M <= sum_{i != t} log2 d_i <= 256 log2 L

for the byte alphabet with the extra start vertex (its outdegree is 1). For enwik9, L=10^9, the maximum saving attributable to imposing the global Euler constraint rather than independently ranking each transition row is less than 7,654 bits (< 957 bytes when rounded). This bound excludes the cost of storing the matrix and all framing; the actual difference may be far smaller. It does not bound savings of higher-order models, transforms or other grammars.

The exact formula permits a reference rank/unrank: at each step decrement a proposed edge count, use the residual degree balance/connectivity and tree determinant to count valid completions, and sum across preceding lexicographic branches. The residual starts at the new vertex, may be a closed Euler circuit, and requires the corresponding last-exit formula with its fixed start/end; handle zero edges separately. No full implementation or scalability claim yet.

Evidence: [E0008](../experiments/records/E0008.md), exhaustive small-alphabet class counts. Prior art: directed matrix-tree theorem, BEST theorem (de Bruijn, van Aardenne-Ehrenfest, Smith, Tutte), Markov type classes. Literature citation details and novelty review pending.
