# Continuation state

2026-11-25 — C01–C06, C08, C09 closed; C07 and C10 active. Read AGENTS.md and [C07](research/CAMPAIGN-07.md), [C10](research/CAMPAIGN-10.md).

- F0004 IXG2 394,507,869 B, isolated full reconstruction; gzip 322,591,988 B. Archive-only.
- E0030 weighted 8192-rule [CI 45703123838](https://github.com/sguzman/integrax/actions/runs/45703123838), job 139518094677, running at last check.
- C10 E0037 24/24 authentic hybrid comparisons; only marginal gain over xz in one region.
- [E0038](experiments/records/E0038.md) 9/9 authentic roundtrips, 7 Rust tests; 16 MiB context 5,746,766 B, 6.26% below gzip, 15.01% below Huffman. E0040 full context isolated workflow authored, pending.
- E0039 hierarchical backoff mode 5 and zero-rule ablation [theory](theory/root-backoff.md), authored revision bb89c95924e00c68f9a50e7c805b5d8477049d71, CI pending.

Next: collect E0030/E0039/E0040 evidence, promote only isolated verified full improvements; compare dictionary ablation and select stronger model, close C07 when evaluated. Arithmetic termination integrity, Nix pin/dashboard deployment unverified. No workers.
