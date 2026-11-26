#!/usr/bin/env fish

# Run GitHub Actions locally, then publish native GitHub Checks using one
# account-wide GitHub App. No Docker; the key never enters the Nix store.
set -l manifest scripts/local-ci-job.json
set -l app_dir "$HOME/.config/local-ci"
set -l app_id_file "$app_dir/app-id"
set -l app_key_file "$app_dir/github-app.pem"

function fail --argument-names message
    printf 'ERROR: %s\n' "$message" >&2
    exit 1
end

function base64url
    base64 -w 0 | string replace -a '+' '-' | string replace -a '/' '_' | string trim -c '='
end

# Generate a fresh 1-hour installation token; refresh after long builds.
function new_installation_token --argument-names app_id key_file repo
    set -l now (date +%s)
    set -l issued (math $now - 60)
    set -l expires (math $now + 540)
    set -l header (printf '%s' '{"alg":"RS256","typ":"JWT"}' | base64url)
    set -l claims (jq -nc --argjson iat "$issued" --argjson exp "$expires" \
        --arg iss "$app_id" '{iat:$iat,exp:$exp,iss:$iss}' | base64url)
    if test -z "$header" -o -z "$claims"
        return 1
    end
    set -l signing_input "$header.$claims"
    set -l signature (printf '%s' "$signing_input" | openssl dgst -sha256 \
        -sign "$key_file" -binary 2>/dev/null | base64url)
    if test -z "$signature"
        return 1
    end
    set -l jwt "$signing_input.$signature"

    # Discover installation from the repo; no per-repository configuration.
    set -l installation_id (gh api -H "Authorization: Bearer $jwt" \
        "repos/$repo/installation" --jq .id 2>/dev/null)
    if not string match -rq '^[0-9]+$' -- "$installation_id"
        return 1
    end

    gh api --method POST -H "Authorization: Bearer $jwt" \
        "app/installations/$installation_id/access_tokens" --jq .token 2>/dev/null
end

set -l root (git rev-parse --show-toplevel 2>/dev/null)
if test -z "$root"
    fail 'Run this inside a Git repository.'
end
cd "$root"; or exit 1
set -l job (jq -er '.id | select(test("^E[0-9]{4}$"))' "$manifest"); or fail 'Invalid job ID.'
set -l workflow (jq -er '.workflow | select(test("^[.]github/workflows/local-[a-z0-9-]+[.]yml$"))' "$manifest"); or fail 'Invalid local workflow path.'
set -l expected (jq -er '.expected_count | select(type=="number" and floor==. and .>=1 and .<=100)' "$manifest"); or fail 'Invalid expected result count.'
set -l mode (jq -er '.mode | select(type=="number" and floor==. and .>=0 and .<=255)' "$manifest"); or fail 'Invalid result mode.'
set -l check_name "Integrax $job (local wrkflw/Nix)"
test -f "$workflow"; or fail 'Workflow missing.'


set -l dirty (git status --porcelain --untracked-files=normal)
if test (count $dirty) -gt 0
    fail 'Working tree is dirty; a Check Run must identify the exact tested commit.'
end

if not gh auth status --hostname github.com >/dev/null 2>&1
    fail 'GitHub CLI login missing (nix develop --command gh auth login).'
end
set -l repo (gh repo view --json nameWithOwner,isPrivate --jq 'select(.isPrivate == true) | .nameWithOwner' 2>/dev/null)
if test "$repo" != sguzman/integrax
    fail 'Refusing to publish evidence: expected private sguzman/integrax repository.'
end
set -l sha (git rev-parse HEAD)
set -l remote_head (gh api "repos/$repo/git/ref/heads/main" --jq .object.sha 2>/dev/null)
if test "$remote_head" != "$sha"
    fail "Local checkout is not current main; git pull --ff-only first."
end
if not gh api "repos/$repo/commits/$sha" --jq .sha >/dev/null 2>&1
    fail 'Commit not found on GitHub. Push the commit first.'
end

if not test -r "$app_id_file" -a -r "$app_key_file"
    fail 'GitHub App not configured. See README: create ~/.config/local-ci/app-id and github-app.pem.'
end
set -l app_id (string trim -- (cat "$app_id_file"))
if not string match -rq '^[0-9]+$' -- "$app_id"
    fail 'Invalid ~/.config/local-ci/app-id: use the numeric GitHub App ID.'
end
set -l token (new_installation_token "$app_id" "$app_key_file" "$repo")
if test -z "$token"
    fail 'Cannot authenticate the app installation. Install it with Checks: write.'
end

umask 077
set -l log_dir (git rev-parse --git-path local-ci)
mkdir -p "$log_dir"; or fail 'Could not create local log directory.'
set -l stamp (date -u +%Y%m%dT%H%M%SZ)
set -l started (date -u +%Y-%m-%dT%H:%M:%SZ)
set -l start_seconds (date +%s)
set -l log "$log_dir/$sha-$stamp.log"
set -l create_payload "$log_dir/$sha-$stamp.create.json"
set -l update_payload "$log_dir/$sha-$stamp.update.json"

jq -n --arg name "$check_name" --arg sha "$sha" --arg started "$started" \
    '{name:$name,head_sha:$sha,status:"in_progress",started_at:$started}' > "$create_payload"

# Keep the App token out of the environment of the actual workflow.
set -lx GH_TOKEN "$token"
set -l check_id (gh api --method POST "repos/$repo/check-runs" \
    --input "$create_payload" --jq .id 2>/dev/null)
set -e GH_TOKEN
set -e token
if not string match -rq '^[0-9]+$' -- "$check_id"
    fail 'Could not create a native Check Run (confirm Checks: write).'
end

echo "Running $workflow locally for $repo @ $sha"
echo "GitHub Check Run: $check_name (#$check_id)"
echo "Full local log: $log"

# Retain complete local diagnostics; publish redacted failure output only to the private repository.
set -l phase validation
wrkflw validate "$workflow" > "$log" 2>&1
set -l ci_exit $status
if test $ci_exit -eq 0
    set phase execution
    env -u GH_TOKEN -u GITHUB_TOKEN wrkflw --verbose run --runtime emulation --event workflow_dispatch --no-strict-filter "$workflow" >> "$log" 2>&1
    set ci_exit $status
end

set -l conclusion failure
if test $ci_exit -eq 0
    set conclusion success
end
set -l finished (date -u +%Y-%m-%dT%H:%M:%SZ)
set -l duration (math (date +%s) - $start_seconds)

# Structured success results; redacted failure diagnostics.
set -l public_output
if test $ci_exit -eq 0
    set -l evidence (jq -cRs --argjson expected "$expected" --argjson mode "$mode" -f scripts/local-ci-evidence.jq "$log" 2>"$log.evidence-error")
    if test $status -ne 0 -o -z "$evidence"
        set ci_exit 1
        set conclusion failure
        set phase evidence
        printf "\nEvidence parser diagnostic:\n" >> "$log"
        cat "$log.evidence-error" >> "$log"
    else
        set public_output (jq -nc --arg job "$job" --argjson rows "$evidence" --argjson duration "$duration" '{title:"Local research verification passed",summary:("Passed "+$job+" in "+($duration|tostring)+" seconds."),text:({job:$job,duration_seconds:$duration,rows:$rows}|tojson)}')
    end
end
if test $ci_exit -ne 0
    # Recheck visibility just before uploading diagnostics.
    set -l private (gh repo view "$repo" --json isPrivate --jq .isPrivate 2>/dev/null)
    if test "$private" = true
        node scripts/redact-ci-log.mjs "$log" > "$log.redacted"; or printf 'Redaction failed; diagnostic output withheld.' > "$log.redacted"
    else
        printf 'Repository privacy could not be confirmed; diagnostics withheld.' > "$log.redacted"
    end
    set public_output (jq -nc --arg phase "$phase" --argjson code "$ci_exit" --argjson duration "$duration" --rawfile diagnostics "$log.redacted" '{title:"Local research verification failed",summary:("Failed phase: "+$phase+"; exit "+($code|tostring)+"; "+($duration|tostring)+" seconds. Redacted diagnostics below."),text:$diagnostics}')
end
if test -z "$public_output"
    fail 'Could not construct safe Check Run report.'
end
jq -n --arg conclusion "$conclusion" --arg completed "$finished" --argjson output "$public_output" '{status:"completed",conclusion:$conclusion,completed_at:$completed,output:$output}' > "$update_payload"

# A job may run longer than the 1-hour installation-token lifetime.
set -l final_token (new_installation_token "$app_id" "$app_key_file" "$repo")
if test -z "$final_token"
    echo 'ERROR: CI finished, but app authentication failed before finalizing the check.' >&2
    exit 1
end
set -lx GH_TOKEN "$final_token"
set -l check_url (gh api --method PATCH "repos/$repo/check-runs/$check_id" \
    --input "$update_payload" --jq .html_url 2>/dev/null)
set -l publish_exit $status
set -e GH_TOKEN
set -e final_token
if test $publish_exit -ne 0 -o -z "$check_url"
    echo 'ERROR: CI finished, but the native Check Run could not be finalized.' >&2
    exit 1
end
printf 'Published GitHub Check: %s (%s)\n' "$check_name" "$conclusion"
printf '%s\n' "$public_output" | jq -r '.summary'
printf 'Check details: %s\n' "$check_url"
exit $ci_exit
