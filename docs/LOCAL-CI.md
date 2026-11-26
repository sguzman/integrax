# Private local CI

Run one lead-selected job at a time. Reuse the existing GitHub App (Checks: write, installed on all personal repositories) and ~/.config/local-ci credentials from local-ci-testing. No credentials in Git or the Nix store. Existing workflow definitions are preserved; local-only jobs use workflow_dispatch. To stop existing hosted push workflows, disable Actions in repository Settings → Actions → General; native App Check Runs are separate.

```fish
git pull --ff-only
nix develop --command fish scripts/run-local-ci.fish
```

Runner validates then runs the workflow selected in scripts/local-ci-job.json with wrkflw --runtime emulation. Requires a clean current main checkout and existing gh and App authentication. Attaches a native Check Run to the exact tested commit, refreshes the App token after the job. E0084 uses synthetic data only. Full logs and payloads stay in .git/local-ci/ under private permissions; Successful checks contain validated bounded records. Failed checks include redacted verbose diagnostics, capped to GitHub's Check output limit. Raw logs remain local. Repository privacy is rechecked before diagnostic upload. Missing or invalid evidence fails closed. Lead reads the Check Runs API. No unattended polling enabled yet. Full-corpus isolation scripts still need host-specific adaptation and verification before use (doas/user namespaces, not sudo). Run only trusted workflows.

Emulation evidence uses a fresh per-revision directory in the original host checkout under results-local/, not wrkflw stdout. Actual step logs are appended to the local log; evidence copied into .git/local-ci/. The workflow emits a completion revision only after every command succeeds. Transfer is cleaned on normal Fish exit; an interrupted run may leave a stale directory that must be inspected before removal.

E0085 full job uses Linux Bubblewrap with unprivileged user namespaces; no sudo/doas or host configuration change. Preflight before corpus acquisition. Existing data/enwik9 reused if present, otherwise verified cache .git/local-ci/cache/enwik9; local archive retained in .git/local-ci/cache/archives. Temporary decoded output is compared exactly and removed. Local disk space required for corpus, archive, temporary output and builds. Full evidence schema is selected by the manifest; failed checks retain redacted diagnostics. Host isolation must actually pass before any frontier acceptance.
