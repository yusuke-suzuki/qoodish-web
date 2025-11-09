---
description: Create/update branch, commit changes, and open/update PR
---

Intelligently handle the PR workflow based on the current git state:

**First, check the current state:**
1. Run `git status` to see current branch and changes
2. Run `git log master..HEAD --oneline` to see existing commits
3. Check if a PR already exists for this branch using `gh pr view`
4. Determine if unstaged changes are related to current branch/PR

**Then, decide the workflow:**

**Case A: On master branch (new PR)**
1. Create a new git branch with an appropriate name
2. Stage and commit all relevant changes following CLAUDE.md
3. Push the branch to remote repository
4. Create a PR using `gh pr create` with proper formatting

**Case B: On feature branch, no commits yet**
1. Stage and commit all relevant changes following CLAUDE.md
2. Push the branch to remote repository
3. Create a PR if it doesn't exist, otherwise notify the user

**Case C: On feature branch, commits exist, no PR yet**
1. If there are new changes:
   - Ask user: "Add new commit or amend last commit?"
   - New commit: Create new commit following CLAUDE.md
   - Amend: Check authorship and verify not pushed, then amend
2. Push to remote repository
3. Create a PR using `gh pr create`

**Case D: On feature branch, PR exists, changes relate to PR**
1. If there are new changes:
   - Ask user: "Add new commit or amend last commit?"
   - New commit: Create new commit following CLAUDE.md
   - Amend: Check authorship and verify not pushed, then amend
2. Push to remote repository (PR updates automatically)
3. Show PR URL for reference

**Case E: On feature branch, but changes are unrelated to PR**
1. Switch to master branch
2. Pull latest changes
3. Create a new feature branch with appropriate name
4. Stage and commit changes following CLAUDE.md
5. Push the new branch to remote repository
6. Create a new PR using `gh pr create`

**Always ensure:**
- Run `pnpm biome ci ./src` before any commit to verify code
- Follow commit message format rules (50 char limit)
- Use HEREDOC for PR body formatting
- Never amend commits from other authors
- Never amend commits that have been pushed (unless requested)
