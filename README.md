# Integrax

Number-theoretic approaches to lossless compression.

Integrax investigates short, reversible arithmetic descriptions of large integers, with the [Hutter Prize](https://prize.hutter1.net/) enwik9 corpus as its primary benchmark. Whole-integer descriptions are the main research direction; blockwise and hybrid methods are tracked separately.

Every candidate must account for all encoded information and reconstruct the original bytes exactly.

## Explore
- [Compression frontier](benchmarks/FRONTIER.md)
- [Research campaigns](research/README.md)
- [Mathematical foundations](theory/FOUNDATIONS.md)
- [Experimental protocol](experiments/README.md)
- [Working papers](papers/README.md)

## Development
The dependency-free Rust reference codec establishes the initial experimental interface. Run `cargo test --locked`. See [IX01 format](schemas/IX01.md).

This is exploratory research, not a claim of a new compression record. [Source-available competition-restricted license](LICENSE). Free use, modification and redistribution are permitted except for competing Hutter Prize entries. Earlier MIT grants remain valid; any future contest submission requires a separately eligible license.
