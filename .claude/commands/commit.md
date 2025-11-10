---
description: Commit changes and create/update PR
---

Commit changes to a feature branch and manage PRs:

**First, check the current state:**
1. Run `git status` to see current branch and changes
2. Run `git fetch origin` to ensure latest remote state
3. Determine current branch: if on master, will create feature branch first

**Then, handle branch creation if on master:**
1. If on master:
   - Ask user for feature branch name
   - Run `git switch -c <branch-name>`
2. If already on feature branch:
   - Show current branch name
   - Run `git log origin/master..HEAD --oneline` to see existing commits

**Then, create the commit:**
1. Run `pnpm biome ci ./src` to verify code quality
2. Stage all relevant changes: `git add <files>`
3. Generate a commit message following CLAUDE.md commit message rules
4. Create the commit: `git commit -m "..."`
5. Show the result with `git log origin/master..HEAD --oneline`

**After commit:**
1. Push the commit: `git push -u origin HEAD` (or `git push` if branch tracking already set up)
2. Check if a PR exists using `gh pr view`
3. If a PR already exists, update PR description with `gh pr edit` to reflect all commits
4. If no PR exists, create a PR using `gh pr create`
5. Show the final commit history and PR URL

**Important notes:**
- Never commit directly to master; feature branch will be created if needed
- All changes must pass `pnpm biome ci ./src` before committing
- Commit messages must follow CLAUDE.md rules
- PR will be created or updated automatically
