# Nix reproducibility checkpoint

Existing flake.nix follows nixpkgs nixos-26.05. No flake.lock was present at this checkpoint; the local agent runtime does not have Nix or Rust installed. A read-only GitHub Actions workflow uses the Cachix install action pinned to verified v31 commit 3dc140bfc76c49fbd4dd958429132e3746bcb086, generates a lock if absent, prints it and its SHA-256, then tests and builds IXG2 with locked Cargo dependencies in the pinned dev shell. No repository write permissions or deployment changes. The next step is to retrieve the exact generated lock only from successful logs, commit it, and re-run with no lock updates. Compiler differences can change executable hashes and floating-point encoder heuristics; archive reproducibility must be measured separately. Nix verification is not claimed until observed. The public dashboard source exists under docs/; Pages deployment status could not be read via the connector, and no settings changes are made.

## Observed successful generation

CI 45707565821, job 139533331756, revision 2c8bf126f25624d7e73fc0ac63fbc05b426d4e06, completed successfully. Nix 2.35.6, rustc 1.95.0, 12/12 IXG2 tests, release build. Generated lock SHA-256 ce6b204c4e6bfa1defbfa52fca0239c8353138b9fcb9968787b6bc1660c8fce1, nixpkgs rev 0dc498bfe49baeb18b0f9891e800b53bb2603193. Exact logged lock persisted; second CI will verify unchanged tracked lock. This verifies development environment, not cross-compiler equality of full archives.

Pinned rerun CI 45707850743, job 139534304816, passed with unchanged tracked lock SHA-256 ce6b204c4e6bfa1defbfa52fca0239c8353138b9fcb9968787b6bc1660c8fce1, 12/12 tests and release build. Nix environment pin verified; later source revisions require their own build checks.
