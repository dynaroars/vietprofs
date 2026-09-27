#!/usr/bin/env bash
# One-time owner step: turn on GitHub's auto-delete of merged PR branches and run the
# delete-pr-branches workflow's sweep, which removes every branch whose PRs are all closed.
# Afterwards the workflow keeps branches clean on its own.
set -euo pipefail
repo=dynaroars/vietprofs

gh api -X PATCH "repos/$repo" -F delete_branch_on_merge=true --jq '"delete_branch_on_merge: \(.delete_branch_on_merge)"'
gh workflow run delete-pr-branches.yml -R "$repo"
echo "Sweep started. Waiting for it to finish..."
sleep 5
run=$(gh run list -R "$repo" -w delete-pr-branches.yml -L 1 --json databaseId --jq '.[0].databaseId')
gh run watch "$run" -R "$repo" --exit-status >/dev/null
gh run view "$run" -R "$repo" --log | grep -E 'deleted |keep |Deleted ' | sed 's/^.*\t//'
echo "Remaining branches:"
gh api "repos/$repo/branches" --jq '.[].name'
