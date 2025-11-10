---
description: Fixup commits and squash with interactive rebase
---

Intelligently handle commit fixup workflow:

**First, check the current state:**
1. Run `git status` to see current branch and changes
2. Run `git fetch origin` to ensure local tracking branches are up to date
3. Run `git log origin/master..HEAD --oneline` to see existing commits on this branch
4. Check if a PR exists for this branch using `gh pr view`
5. Identify which commit needs to be fixed

**Then, execute the fixup workflow:**

**If there are unstaged/staged changes:**
1. Ask user which commit to fixup (show list from step 3)
2. Run `pnpm biome ci ./src` to verify code quality
3. Stage changes: `git add <files>`
4. Create fixup commit: `git commit --fixup=<commit-hash>`
5. Run `git rebase -i --autosquash origin/master` to squash fixup commits
6. Review the resulting commits with `git log origin/master..HEAD --oneline`
7. If commit messages need updates, revise them following CLAUDE.md commit message rules
8. If a PR exists, update PR description with `gh pr edit` to reflect all commits
9. Push with `git push --force-with-lease`
10. Show the final commit history and PR URL if applicable

**If there are no changes:**
1. Run `git rebase -i --autosquash origin/master` to squash any existing fixup commits
2. Review the resulting commits with `git log origin/master..HEAD --oneline`
3. If commit messages need updates, revise them following CLAUDE.md commit message rules
4. If a PR exists, update PR description with `gh pr edit` to reflect all commits
5. Push with `git push --force-with-lease`
6. Show the final commit history and PR URL if applicable

**Important notes:**
- Use fixup commits to amend specific commits in the branch history
- The interactive rebase will automatically squash fixup commits
- Always force-push with `--force-with-lease` after rebase for safety
- PR description will be updated to reflect the final commit history
