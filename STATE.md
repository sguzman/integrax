# Continuation state

2026-11-25 — Bootstrap complete. Research mission ongoing.

Active: [C01 — Measurement and near-power primitives](research/CAMPAIGN-01.md).

Next: M1 — pin Nix inputs and obtain official corpus, verify identity, and establish matched control/baseline measurements. If corpus unavailable, proceed with labeled synthetic controls and small inputs. M2 — implement scalable arbitrary-precision search and compare real serialized sizes. M3 — characterize scaling and choose next campaign.

## Verified bootstrap
- Main bootstrap commit 5b406ab7708721e06a36163684fb375184c252c2; all 31 new files and existing license read back in remote tree. Both JSON schemas parsed successfully.
- [CI run 45680262853](https://github.com/sguzman/integrax/actions/runs/45680262853): cargo test --locked and cargo build --release --locked passed.
- IX01 arithmetic mode is limited to 16 input bytes; it selects shorter payloads relative to framed raw mode, not necessarily net compression relative to original input. It is not a full-target compressor.

## Open items
No verified full enwik9 result. Dataset and digest not yet verified. Nix shell authored but lock/build not yet verified. Static dashboard files committed; live Pages deployment not configured/verified. No workers assigned. Official reference threshold 100,424,672 bytes as of 2026-11-25.

Read AGENTS.md before continuing; do not restart bootstrap without a concrete defect.
