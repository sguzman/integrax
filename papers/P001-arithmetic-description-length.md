# Arithmetic description length for large-integer compression

Version 0.1, 2026-11-25. AI-assisted research prospectus; no human or peer review yet.

## Abstract
We propose an experimental framework for representing byte corpora as large integers through exact arithmetic expressions. The objective is serialized description length subject to reconstruction and explicit decoder costs. Power residuals, sparse expressions and alternative representations will be compared with matched controls. No empirical improvement is claimed.

## Model
Use the length-preserving integer mapping and grammar-relative minimum in [Foundations](../theory/FOUNDATIONS.md). A candidate consists of a versioned arithmetic description and exact signed residual.

## Method
Establish raw and conventional baselines, synthetic and seeded random controls, natural-text prefixes and ultimately the full corpus. Record archive and executable sizes, runtime, peak RSS and independent byte equality. Separate whole-integer, blockwise, hybrid and official-score tracks.

## Limitations and planned results
Counting excludes universal compression. Search cost and expression-language bias remain open. A small numerical residual alone does not establish a shorter representation. C01 will investigate genuine serialized savings. Future claims require linked evidence and prior-art review.
