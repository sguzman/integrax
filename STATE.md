# Continuation state

2026-11-26 UTC — C01–C18 closed; [C19](research/CAMPAIGN-19.md) deferred with independently verified mode8; [C20](research/CAMPAIGN-20.md) active (owner priority). Read AGENTS.md, research/README.md, benchmarks/FRONTIER.md.

- F0012 IXB2 blockwise **217,045,597 B** (78.30% reduction), [E0082/V0015](experiments/records/E0082.md), [CI 45718923956](https://github.com/sguzman/integrax/actions/runs/45718923956/job/139571999756). Full strict isolated byte equality and SHA-256, same archive digest as failed first attempt. F0011 220,113,320 B; mode7 wins every paired block in attempt 1. F0013 IXG2 whole-stream **232,493,451 B** (76.75%), [E0085/V0016](experiments/records/E0085.md). All archive-only; no contest-comparable total.
- [C13 closed](research/CAMPAIGN-13-CLOSURE.md); 180 independent IXB1/2 cross-codec comparisons and 370 IXG2 (550 total). Preserve both block modes. C12 sparse patch sample gain only. Prior campaigns and evidence retained in registry.
- Owner authorized returning to public development, competition-restricted licensing and hosted Actions. Competition-restricted license restored; public visibility verified through GitHub API and hosted Actions confirmed working. Advance priority notice sent with owner approval; committee acknowledgment pending. Earlier MIT grants remain valid. No contest submission authorized.
- Nix build verified previously; live dashboard deployment unverified.

Next: inspect E0095 XML lexical span census and bounded factor probe. E0094 independent mode8 verified; C19 full-corpus integration deferred. Known N=32Q unchanged; no frontier claim.

Post-license reference and IX02 CI passed (45723260474/45723260614). E0083 authored; unit tests and six authentic strict roundtrips pending CI.

Attempt 1 [CI 45724016441](https://github.com/sguzman/integrax/actions/runs/45724016441/job/139589149431) stopped in unit tests: 20 passed, one failed because the invalid-mode fixture wrote newly supported mode20 into an empty frame. No authentic compression measurements. Corrected fixture to permanently unsupported byte 255; added mode20 probability bounds, suffix-model equivalence, and recurrence-copy root-state checks. Rerun pending.

E0083 corrected CI passed; mode20 wins all three regions, 6 strict roundtrips and append rejects; 22 tests. E0084 independent BigInt cross-codec verification is the first local job; 20 synthetic cases, prior mode15 observations regression-checked. Local runner end-to-end not yet tested. See [local CI](docs/LOCAL-CI.md).

First local Check #139596572386 published failure in evidence phase (wrkflw exit zero, no validated records). Authentication and Checks upload worked. Actual cause not confirmed without raw diagnostics; enable explicit dispatch and verbose step output, publish redacted failure diagnostics to private Check Runs, retain full local logs. E0084 still unverified.

Second local attempt [Check 139597753829](https://github.com/sguzman/integrax/runs/139597753829) reports successful build and verification steps but wrkflw 0.8.0 emulation hides child stdout even in verbose mode; zero evidence records reached the parser. Implemented fresh per-revision host transfer directory using the original GITHUB_WORKSPACE path confirmed in the diagnostic log. Workflow writes actual step logs, evidence, and a completion revision marker; publisher requires all expected evidence and matching revision, persists step logs locally, and publishes redacted failure diagnostics. No E0084 acceptance yet; host transfer integration requires owner rerun.

E0084 [local Check 139599681105](https://github.com/sguzman/integrax/runs/139599681105) succeeded at revision `6688ad92501ec97b83a23ec00d698681067f34b4`: 20/20 independent BigInt/Rust archive equality, both-direction exact cross-decodes and append rejection, matching decoded hashes; prior mode15 observations regression check passed as required by the script. Local wrkflw execution, file-based evidence transfer and GitHub Checks reporting verified end-to-end (12 s reported runner duration). [Structured evidence](experiments/records/E0084.json). Total independent comparisons: 570. Full-corpus candidate remains unmeasured; adapt isolation and corpus caching for local execution before full trial.

E0085 local full enwik9 mode20 candidate authored after E0083 (all three sample gains) and E0084 (20/20 independent equality). Fixed dictionary, uninterrupted stream. Bubblewrap nonroot user/network/PID/IPC/UTS namespaces, read-only Nix store and codec+archive only, no host corpus mount, preflight hidden sentinel and distinct network namespace before download, repeat checks on actual corpus and during decode. Exact cmp/hash required; archive retained in ignored local cache with digest verification. Full evidence schema positive and false-isolation rejection fixture tested; draft script syntax checked. Actual host sandbox, Nix dependency and full execution not yet verified. No new frontier claimed.

Owner requested live terminal logs while E0085 was running at revision 9455c26e. Added terminal streaming of the real workflow step log for subsequent runs and periodic elapsed-time/output-byte observations during full encoding and decoding; unchanged codec and acceptance gate. Running job remains on its original revision; no restart requested. Live-display changes are not yet host-tested. Collect E0085 evidence from original revision even if main has advanced for logging only.

E0085 attempt [139601748562](https://github.com/sguzman/integrax/runs/139601748562) failed during corpus acquisition: isolation preflight passed, curl HTTP/2 error 92 at 79.70 MiB. Old downloader cleaned partial on exit. Fixed acquisition to preserve compressed partial across failure/signals, resume from actual on-disk offset, use HTTP/1.1, remove total-transfer timeout, retry with bounded attempts, detect complete ZIP, verify corpus before atomic cache publication, refuse silent restart on unsupported ranges. Workflow timeout increased to 360 min. No benchmark result. Resume implementation not yet exercised on owner host.

E0085 second attempt (local Check 139610201792, owner terminal log): live logs worked; HTTP/1.1 range resumption verified across four interruptions, progressing from 199081984 to 261127689 bytes before the final partial transfer. Five-attempt budget exhausted; partial preserved by script. GitHub authentication failed during finalization, so remote check may remain stale. No compression result. Local acquisition now uses unlimited attempts (manual Ctrl-C still preserves partial); hosted default remains five. Standalone acquisition recommended before CI to avoid tying a slow download to check-run authentication. Unlimited mode not yet host-tested.

Owner ended mandatory local CI after repeated corpus download failures. Existing scripts and partial local cache are preserved. Hosted E0085 workflow now queued; result unverified. Priority notice to committee is separate from formal submission.

C15/E0086: bounded exact divisibility survey of the full enwik9 integer, all primes <=97, prime-power valuations with explicit censoring, independent native integer test controls. Hosted push workflow authored; no full factorization or compression claim. C14 E0085 still running at last check. Next inspect both hosted jobs and retain distinct evidence.

E0086 passed [CI 45754251881](https://github.com/sguzman/integrax/actions/runs/45754251881/job/139689015680), N=2^5 Q with Q odd and no odd prime <=97 dividing N; four tests passed, corpus SHA-256 verified, 2.02 s and 2212 KiB RSS. Evidence experiments/records/E0086.json. E0087 authored to independently reproduce group/valuation evidence and extend trial division to 997. E0085 still in progress at last check. No compression frontier change.

E0085 and E0087 passed; F0013 accepted, C14/C15 closed. [E0085 evidence](experiments/records/E0085.json), [E0087 factor ledger](experiments/records/E0087.json). C16 selected; implementation and prior-art review pending. No contest submission or license change.

C16 M1 E0088 authored: standalone Rust/GMP modular multiplication, GCD, exponentiation and Pollard p-1 on bounded planted-factor synthetic moduli up to 67,108,864 bits. Prior art recorded, hosted execution pending. Next collect timing, censored bounds and memory before deciding full-target feasibility.

E0088 passed [CI 45756109910](https://github.com/sguzman/integrax/actions/runs/45756109910/job/139694984064); all four widths, results in experiments/records/E0088.json. E0089 authored to scan authentic N via gcd(N,2^k-1), k=720720 and 12252240, independent BigInt residue and Bezout verification. Results pending. No new known factor yet.

E0089 passed [CI 45756490083](https://github.com/sguzman/integrax/actions/runs/45756490083/job/139696203381): both GCDs=1, independent residue/Bezout verification passed. E0090 single new exponent 232792560 authored; 19-fold scale experiment, verification pending. Known N=32Q unchanged. No frontier or license change.

E0090 verified exact GCD=1; C16 closed. E0091 Lucas p+1 auxiliary search authored, distinct family, pending CI. Known N=32Q unchanged. No frontier or license change.

E0091 passed, GCD=32 only. [Evidence](experiments/records/E0091.json). C18 E0092 affine radix basis/coordinate codec and matched axis-only controls authored, hosted CI pending. No production codec or license change.

E0092 passed, five small affine gains over masks, max 327 B/1 MiB. C18 closed; C19/E0093 mode8 authored, hosted CI pending. Old mode7 and IXB2 tags retained. No license change.

E0093 verified all six sample roundtrips and rejection checks; mode7 historical hashes reproduced. E0094 independent cross-codec authored; hosted CI pending. No license or full-target frontier change.

E0094 passed 30 independent cross-codec comparisons; mode8 retained. Owner approved C20 XML-guided bottom-up arithmetic synthesis. E0095 full corpus lexical profile, exact replay and <=8-byte factor probe authored; hosted CI pending. No license or frontier change.
