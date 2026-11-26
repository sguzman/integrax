# Historical local CI (optional)

Superseded as the primary workflow by [GitHub-hosted CI](HOSTED-CI.md). Do not require the owner to run these jobs or download enwik9 locally. Existing cache and scripts are preserved. Instructions below describe the former private workflow.

Run one lead-selected job at a time. Reuse the existing GitHub App (Checks: write, installed on all personal repositories) and ~/.config/local-ci credentials from local-ci-testing. No credentials in Git or the Nix store. Existing workflow definitions are preserved; local-only jobs use workflow_dispatch. To stop existing hosted push workflows, disable Actions in repository Settings → Actions → General; native App Check Runs are separate.

```fish
git pull --ff-only
nix develop --command fish scripts/run-local-ci.fish
```

Runner validates then runs the workflow selected in scripts/local-ci-job.json with wrkflw --runtime emulation. Requires a clean current main checkout and existing gh and App authentication. Attaches a native Check Run to the exact tested commit, refreshes the App token after the job. E0084 uses synthetic data only. Full logs and payloads stay in .git/local-ci/ under private permissions; Successful checks contain validated bounded records. Failed checks include redacted verbose diagnostics, capped to GitHub's Check output limit. Raw logs remain local. Repository privacy is rechecked before diagnostic upload. Missing or invalid evidence fails closed. Lead reads the Check Runs API. No unattended polling enabled yet. Full-corpus isolation scripts still need host-specific adaptation and verification before use (doas/user namespaces, not sudo). Run only trusted workflows.

Emulation evidence uses a fresh per-revision directory in the original host checkout under results-local/, not wrkflw stdout. Actual step logs are appended to the local log; evidence copied into .git/local-ci/. The workflow emits a completion revision only after every command succeeds. Transfer is cleaned on normal Fish exit; an interrupted run may leave a stale directory that must be inspected before removal.

E0085 full job uses Linux Bubblewrap with unprivileged user namespaces; no sudo/doas or host configuration change. Preflight before corpus acquisition. Existing data/enwik9 reused if present, otherwise verified cache .git/local-ci/cache/enwik9; local archive retained in .git/local-ci/cache/archives. Temporary decoded output is compared exactly and removed. Local disk space required for corpus, archive, temporary output and builds. Full evidence schema is selected by the manifest; failed checks retain redacted diagnostics. Host isolation must actually pass before any frontier acceptance.

The runner now streams actual workflow step output to the terminal while retaining local diagnostic logs. Full jobs print stage transitions and actual written bytes every ten seconds during encoding/decoding (not estimated percent). To observe an already running older revision, in a second terminal run `tail -F results-local/local-ci-*/steps.log`; stop the observer with Ctrl-C, not the benchmark.

Corpus acquisition is resumable: `.git/local-ci/cache/enwik9.zip.tmp` survives failed or interrupted downloads. HTTP/1.1 range requests resume the file; no wall-clock curl timeout, stalled transfers retried up to five attempts per invocation. If a server refuses resume the script fails without discarding the partial. A verified existing corpus bypasses networking. Do not delete the partial cache. Workflow timeout is six hours; rerunning resumes if it is exceeded.

For slow connections, finish acquisition independently of CI with `nix develop --command env INTEGRAX_DATA_DIR="$PWD/.git/local-ci/cache" INTEGRAX_DOWNLOAD_ATTEMPTS=0 sh datasets/acquire.sh enwik9`. Local full jobs use unlimited attempts too; Ctrl-C preserves the ZIP. The default for other callers is five attempts. Only run one acquisition at a time. Resume rejection still fails closed. A network failure during check finalization is separate from corpus acquisition.
