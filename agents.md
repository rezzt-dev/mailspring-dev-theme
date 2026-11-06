# MAILSPRING-DEV-THEME: REPOSITORY GUIDE

editorial dark mailspring theme and optional mail-client plugins. this guide covers the repository; nested agent instructions apply within their own folders.

## PROJECT OVERVIEW

| property | verified value |
| --- | --- |
| repository | `rezzt-dev/mailspring-dev-theme` |
| active source | `./` |
| development base for this change | `main` |
| remote default branch | `main` |
| version source | `package.json`: `1.1.0`; `plugins/account-identities/package.json`: `1.0.0`; `plugins/contact-context/package.json`: `1.0.0`; `plugins/focus-and-follow-up/package.json`: `1.0.0`; `plugins/privacy-guard/package.json`: `1.0.0`; `plugins/reading-mode/package.json`: `1.0.0` |
| continuous integration | no tracked github actions workflows |

## TECHNOLOGY STACK

- no dependency manifest is present; inspect the source files directly and do not assume an install command

## PROJECT STRUCTURE

- `assets/`
- `changelog.md`
- `license.md`
- `package.json`
- `plugins/`
- `readme.md`
- `styles/`

management documentation lives in `.docs/manager.md`, `.docs/-github-guides/` and `.docs/repo-audit-and-fix.md`. keep this file and `claude.md` consistent.

## BUILD, RUN AND TEST COMMANDS

from `./`, the available package scripts are:

| command | implementation |
| --- | --- |

from `plugins/account-identities/`, the available package scripts are:

| command | implementation |
| --- | --- |

from `plugins/contact-context/`, the available package scripts are:

| command | implementation |
| --- | --- |
| `npm run test` | `node --test test/*.test.js` |

from `plugins/focus-and-follow-up/`, the available package scripts are:

| command | implementation |
| --- | --- |
| `npm run test` | `node --test test/*.test.js` |

from `plugins/privacy-guard/`, the available package scripts are:

| command | implementation |
| --- | --- |
| `npm run test` | `node --test test/*.test.js` |

from `plugins/reading-mode/`, the available package scripts are:

| command | implementation |
| --- | --- |

for application changes, run these checks from `./`:

```bash
node --test plugins/*/test/*.test.js
```

## MODULE RESPONSIBILITIES

`styles/index.less` composes the theme. `styles/theme-colors.less` and `styles/ui-variables.less` define shared roles; the remaining styles target mail-client surfaces. `assets/fonts/` contains bundled font resources and their licence text.

optional plugins are separate directories under `plugins/`: `account-identities`, `contact-context`, `focus-and-follow-up`, `privacy-guard` and `reading-mode`. inspect each plugin's `package.json` and readme before changing it. the root package is a mailspring theme descriptor and has no npm scripts; do not invent `npm test` or a build command. node's test runner can execute the existing `plugins/*/test/*.test.js` tests. client integration still needs a manual check with a disposable mail profile.

theme installation, plugin installation and distributing a zip are distinct from publishing a github release. keep `package.json`, the changelog and the chosen distributable version aligned only when a release is requested.

## CODE STYLE AND ARCHITECTURAL DECISIONS

keep shared less colour variables consistent; plugin tests must use fixtures rather than real mailboxes; do not log message content or credentials. follow the existing formatter and naming of the changed module. verify manifest versions when dependencies change.

## TESTING STRATEGY

documentation-only changes require `git diff --check`, existing-path checks and a review of the staged file list. run module checks for application changes, with disposable data. report unavailable tooling and failed checks; never claim a check passed without running it.

## SECURITY AND DEPLOYMENT

keep credentials, local configuration, signing material and user data out of commits. do not print secret values while auditing. inspect configuration names and code references instead.

existing legal and community files: `license.md`. when changing dependencies, permissions, storage or network services, review those files against the implementation. record missing policies as audit work; do not invent licence terms or ownership decisions.

deployment, signing, store publication, migrations against hosted databases and repository settings require their own explicit request. this documentation task prepares management instructions and pull requests.

## COMMON TASKS

1. read the relevant module and its nearest agent instructions
2. inspect the working tree and choose the smallest change that solves the request
3. update the affected documentation and changelog with evidence from the diff
4. run checks appropriate to the changed module and report their actual results
5. for git operations, follow the manager and the digest below

## COMMIT, PR, MERGE & RELEASE GUIDELINES

read `.docs/manager.md` first, then the selected guide in `.docs/-github-guides/`. these files are versioned; this digest also works without opening them.

| request | guide |
| --- | --- |
| commit title, body and changelog | `commit-guide.md`, `changelog-guide.md` |
| pull request or merge | `pr-merge-guide.md`, `branching-guide.md` |
| version and release | `release-guide.md`, `changelog-guide.md` |
| permissions and sensitive data | `agent-rules.md` |

- inspect `git status`, both diffs and recent history before describing changes
- use `<prefix> | <imperative summary>` with `update`, `fix`, `hotfix`, `changes` or `changelog`; keep titles within 72 characters
- write commit bodies as 2 to 6 markdown bullets, one logical change per line, with literal paths in backticks
- never add authorship footers, automated attribution, signatures or generation notices; preserve the configured git identity
- update `changelog.md` under `## SIN PUBLICAR / UNRELEASED` in matching `### CASTELLANO` and `### ENGLISH` sections
- use the existing changelog category vocabulary and preserve language parity; describe only changes in the actual diff
- summarize pull requests in 1 to 3 bullets per category and language, at most 110 characters per bullet
- documentation and repository-management work targets `main`; the remote default is `main`; do not silently promote development work to the default branch
- the authorization for a requested action remains valid throughout that task; creating a pull request includes pushing its branch, but does not authorize merging or publishing
- use merge commits when a merge is requested; never force-push, rewrite published history or remove branches without an explicit instruction
- releases use the approved version and an immutable tag on the verified release commit, with english notes from the closed changelog; do not create a release for documentation work
- deliver requested titles, bodies and changelog fragments in separate code blocks; report executed actions with their commit hash or pull request link
