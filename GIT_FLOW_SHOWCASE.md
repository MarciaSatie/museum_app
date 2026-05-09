# Git Flow Showcase — How to demonstrate your setup

This file explains how to verify and present your Git + Git Flow setup to a teacher, and includes a short report from this repository's local Git config.

---

## Quick repo report (auto-collected)
- Remote `origin`: https://github.com/MarciaSatie/museum_app.git
- Remote `codecommit-origin`: https://git-codecommit.us-west-2.amazonaws.com/v1/repos/museum_app
- Branches configured in this repo (from `.git/config`):
  - `main` (production)
  - `develop` (integration)
  - `feature/likes` (example feature)
  - `feature/login` (example feature)
- git-flow configuration (prefixes):
  - feature: `feature/`
  - bugfix: `bugfix/`
  - release: `release/`
  - hotfix: `hotfix/`
  - support: `support/`

This indicates `git flow init` has been run and basic branch prefixes are configured.

---

## Commands to run during the demo (run in the repo root)

1. Show git and git-flow versions

```bash
git --version
git flow version
```

2. Show remotes and branches

```bash
git remote -v
git branch -a
```

3. Show branch topology and recent commits (graph)

```bash
git log --graph --decorate --oneline --all --abbrev-commit -n 30
```

4. Show git-flow branches and status

```bash
# list feature branches
git flow feature list
# list releases and hotfixes
git flow release list
git flow hotfix list
```

5. Demonstrate a small feature lifecycle (safe demo)

Option A: create and publish a temporary feature (safe, does not finish it)

```bash
# start feature
git flow feature start demo-showcase
# make a tiny change (example: touch or echo into a file)
# commit it
git add -A
git commit -m "demo: small change for git-flow showcase"
# publish branch so teacher can inspect on GitHub
git flow feature publish demo-showcase
# (show the remote feature branch on GitHub)
```

Option B: finish a feature locally (merges into `develop`) — only do this if you want to show a full finish

```bash
# finish feature (merges back to develop)
git flow feature finish demo-showcase
# push develop to origin
git push origin develop
```

6. Show current working tree cleanliness and stash/commit options

```bash
git status --short
# if changes exist, either commit or stash
git add -A && git commit -m "WIP: save before demo"   # or
git stash push -m "temp demo stash"
```

7. Show tags and releases (after finishing a release)

```bash
git tag --list
git show v1.2.0   # replace with a tag you actually created
```

---

## How to present to your teacher (recommended script)
1. Explain Git Flow branches: `main` (production), `develop` (integration), `feature/*`, `release/*`, `hotfix/*`.
2. Run `git flow version` to show Git Flow is installed.
3. Run `git branch -a` and `git remote -v` to show branches and remote origin.
4. Start a small `demo-showcase` feature, commit a tiny change, publish it and open the branch URL in GitHub. This demonstrates the feature branch lifecycle and PR workflow.
5. Optionally finish the feature locally (merge into `develop`) to show the merge step.
6. Show a release finish or hotfix finish if you want to demonstrate tagging and production fixes.

---

## Files added to support this demo
- `RELEASE.md` — already added in the repo root with detailed git-flow commands and recommended answers for `git flow init`.
- `GIT_FLOW_SHOWCASE.md` — this file (you can hand this to the teacher or open it during your demo).

---

If you want, I can:
- add a small demo script (`scripts/demo-gitflow.sh`) that runs the non-destructive commands automatically,
- or add a PR template and GitHub Actions CI file before you publish branches.

Tell me which extra option you want me to apply.
