# Private local CI

Run one lead-selected job at a time. Reuse the existing GitHub App (Checks: write, installed on all personal repositories) and ~/.config/local-ci credentials from local-ci-testing. No credentials in Git or the Nix store. Existing workflow definitions are preserved; local-only jobs use workflow_dispatch. To stop existing hosted push workflows, disable Actions in repository Settings → Actions → General; native App Check Runs are separate.

```fish
git pull --ff-only
nix develop --command fish scripts/run-local-ci.fish
```

Runner validates then runs the workflow selected in scripts/local-ci-job.json with wrkflw --runtime emulation. Requires a clean current main checkout and existing gh and App authentication. Attaches a native Check Run to the exact tested commit, refreshes the App token after the job. E0084 uses synthetic data only. Full logs and payloads stay in .git/local-ci/ under private permissions; only fixed status and validated bounded records go to the private Check Run. Missing or invalid evidence fails closed. Lead reads the Check Runs API. No unattended polling enabled yet. Full-corpus isolation scripts still need host-specific adaptation and verification before use (doas/user namespaces, not sudo). Run only trusted workflows.
