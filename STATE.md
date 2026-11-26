# Continuation state

2026-11-25 — C01–C13 closed; [C14](research/CAMPAIGN-14.md) active. Read AGENTS.md, research/README.md, benchmarks/FRONTIER.md.

- F0012 IXB2 blockwise **217,045,597 B** (78.30% reduction), [E0082/V0015](experiments/records/E0082.md), [CI 45718923956](https://github.com/sguzman/integrax/actions/runs/45718923956/job/139571999756). Full strict isolated byte equality and SHA-256, same archive digest as failed first attempt. F0011 220,113,320 B; mode7 wins every paired block in attempt 1. F0010 IXG2 whole-stream **236,272,025 B** (76.37%), [E0065/V0013](experiments/records/E0065.md). All archive-only; no contest-comparable total.
- [C13 closed](research/CAMPAIGN-13-CLOSURE.md); 180 independent IXB1/2 cross-codec comparisons and 370 IXG2 (550 total). Preserve both block modes. C12 sparse patch sample gain only. Prior campaigns and evidence retained in registry.
- Owner made repo private (verified via API) and restored MIT. No publication, submission or visibility change without explicit approval. Local wrkflw/Nix manifest and existing GitHub App Checks reporter authored; owner runs locally.
- Nix build verified previously; live dashboard deployment unverified.

Next: owner runs E0084 using local CI manifest, collect exact commit Check Run evidence, then decide full candidate only after independent verification. No workers or pending full benchmarks.

Post-license reference and IX02 CI passed (45723260474/45723260614). E0083 authored; unit tests and six authentic strict roundtrips pending CI.

Attempt 1 [CI 45724016441](https://github.com/sguzman/integrax/actions/runs/45724016441/job/139589149431) stopped in unit tests: 20 passed, one failed because the invalid-mode fixture wrote newly supported mode20 into an empty frame. No authentic compression measurements. Corrected fixture to permanently unsupported byte 255; added mode20 probability bounds, suffix-model equivalence, and recurrence-copy root-state checks. Rerun pending.

E0083 corrected CI passed; mode20 wins all three regions, 6 strict roundtrips and append rejects; 22 tests. E0084 independent BigInt cross-codec verification is the first local job; 20 synthetic cases, prior mode15 observations regression-checked. Local runner end-to-end not yet tested. See [local CI](docs/LOCAL-CI.md).
