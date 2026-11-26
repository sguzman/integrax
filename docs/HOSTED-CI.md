# GitHub-hosted research CI

Primary CI: GitHub Actions on standard Linux hosted runners, after the owner changes repository visibility to public and enables Actions. No paid runners. No local corpus acquisition is required.

The existing push workflows remain in place. The next research checkpoint, E0085, is a manual dispatch of **E0085 hosted full enwik9** from main. It reuses the existing Nix-pinned codec and Bubblewrap isolation/evidence procedure, uses a bounded download retry budget, and prints the structured evidence to the hosted run log. It must fail if isolation or exact roundtrip verification fails. Validate its evidence against the existing frontier before acceptance. Hosted E0085 execution passed; see [E0085/V0016](../experiments/records/E0085.md). Subsequent work uses standard public hosted runners.

Local wrkflw tooling and partial corpus downloads are retained, not required, and should not be deleted. No contest submission or record is claimed.

Development uses the competition-restricted source-available license. Earlier MIT grants remain valid; a contest submission must be separately released under an eligible license. Priority notice is not a prize claim.
