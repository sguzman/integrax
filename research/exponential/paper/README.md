# Exponential approximation technical report

[LaTeX source](integrax-exponential.tex) — *Exponential Approximation as a Lossless Integer Codec: A bounded negative result on enwik9* (2026-11-27).

This six-page AI-assisted technical report documents the completed EA01–EA11 campaign, including the mathematical cost model, certified screening, all 18 corpus measurements, failed and successful CI runs, synthetic controls, and limitations. It is a draft pending human author review, not an external submission or a general incompressibility theorem.

## Build

From this directory, using the repository's pinned nixpkgs revision:

```sh
nix shell github:NixOS/nixpkgs/0dc498bfe49baeb18b0f9891e800b53bb2603193#texlive.combined.scheme-medium -c bash -c 'pdflatex -halt-on-error -interaction=nonstopmode integrax-exponential.tex && pdflatex -halt-on-error -interaction=nonstopmode integrax-exponential.tex'
```

The identical source was compiled twice successfully with local pdfLaTeX and all six rendered pages visually inspected. The pinned Nix command above is a proposed reproduction command, not an executed Nix build. The source blob is `44a10d4ca152b7736b4cfc20c60c096684a2822e`.

See [consolidated findings](../FINDINGS.md), [experiment records](../records/) and [successful corpus run](https://github.com/sguzman/integrax/actions/runs/46080789914). The broader C20 project is unaffected.
