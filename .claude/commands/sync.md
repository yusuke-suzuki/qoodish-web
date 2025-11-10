---
description: Sync current branch with latest master
---

Sync the current feature branch with the latest master:

**First, check the current state:**
1. Run `git status` to ensure working directory is clean
2. Run `git fetch origin` to get latest changes from remote
3. Run `git log origin/master..HEAD --oneline` to see commits on this branch

**Then, sync with master:**
1. Run `git rebase origin/master` to apply master's changes on top of current branch
2. If conflicts occur:
   - Show conflict markers and ask user to resolve
   - After resolution, run `git rebase --continue`
3. Show the result with `git log origin/master..HEAD --oneline`

**After sync:**
1. Run `pnpm biome ci ./src` to verify code quality still passes
2. Push with `git push --force-with-lease`
3. Show the final commit history

**Important notes:**
- Only works if working directory is clean (no uncommitted changes)
- Rebasing may cause conflicts that need manual resolution
- Always force-push with `--force-with-lease` after rebase for safety
