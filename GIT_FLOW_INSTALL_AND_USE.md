# Git Flow: Install and Use Guide

## What is it called?
The workflow is called **Git Flow**.
On Windows, the common package names you may see are:
- `git-flow-next` (installed in this repo environment via Scoop)
- `git-flow-avh` (the classic AVH edition)

In VS Code, you usually use Git Flow from the integrated terminal.

---

## 1) Install Git Flow

### Windows options

#### Option A: Scoop
```powershell
scoop bucket add extras
scoop search git-flow
scoop install git-flow-next
```

#### Option B: Chocolatey
```powershell
choco install gitflow-avh -y
```

#### Option C: WSL / Linux
```bash
sudo apt update
sudo apt install git-flow
```

### Verify the installation
```powershell
git flow version
git-flow version
```

If one command fails, try the other. Different installs expose different executable names.

---

## 2) Initialize Git Flow in a repository

Run this in the repository root:

```bash
git flow init
```

Recommended answers for the prompts:
- Production branch: `main`
- Development branch: `develop`
- Feature prefix: `feature/`
- Release prefix: `release/`
- Hotfix prefix: `hotfix/`
- Support prefix: `support/`
- Version tag prefix: `v`

If you want to accept defaults automatically:
```bash
git flow init -d
```

Important:
- Your working tree should be clean before running `git flow init`.
- If you have local changes, commit or stash them first.

---

## 3) Daily Git Flow commands

### Start a feature
```bash
git flow feature start my-feature
```

### Finish a feature
```bash
git flow feature finish my-feature
```

### Start a release
```bash
git flow release start 1.0.0
```

### Finish a release
```bash
git flow release finish 1.0.0
```

### Start a hotfix
```bash
git flow hotfix start 1.0.1
```

### Finish a hotfix
```bash
git flow hotfix finish 1.0.1
```

---

## 4) How to use it in VS Code

1. Open the repository in VS Code.
2. Open the integrated terminal.
3. Run Git Flow commands there.
4. Use the Source Control panel for commits, staging, and pushing.
5. Use Git Graph or GitLens if you want to show the branch structure visually.

---

## 5) How to show it to your teacher

Show these points in order:
1. Explain that the workflow is **Git Flow**.
2. Show `git flow version` to prove it is installed.
3. Show `git branch -a` and `git remote -v`.
4. Show `git flow init` output or your Git Flow config.
5. Show feature branches like `feature/login` or `feature/likes`.
6. Explain how `feature/*` branches merge into `develop`, and how `release/*` branches merge into `main`.

Example demo commands:
```bash
git flow feature start demo-showcase
git add -A
git commit -m "demo: show git flow"
git flow feature finish demo-showcase
```

---

## 6) GitHub upload reminder

To upload the project to GitHub:
```bash
git remote -v
git push -u origin main
git push -u origin develop
```

If you use feature branches, publish them too:
```bash
git push -u origin feature/my-feature
```

---

## 7) Short answer for your report

You can say:
> "This repository uses Git Flow, a branching workflow with `main` for production, `develop` for integration, and separate feature/release/hotfix branches for development and delivery."

