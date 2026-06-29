# GPT Copy-Paste Report

Please review this Architecture Naming Refactor for the Exam Visualizer / SC project.

---

# Context Header

**Current Project:**

Exam Visualizer / SC

**Current Phase:**

Architecture Naming Refactor

**Current Goal:**

Review the responsibility-based Engine / Curriculum / History folder structure.

**Current Issue:**

The project previously used file names based on current implementation details, such as `map.json`, `questions.json`, `difficulty-config.json`, and `gameRules.js`. Codex renamed and reorganized these into responsibility-based folders so students can understand what each part owns over the long term.

**Artifact:**

Implementation Report

**Project Link or Folder:**

`C:\Users\chena\Desktop\Exam-Visualizer`

---

# Implementation Report

**Project:** Exam Visualizer / SC
**Build or Version:** Architecture Naming Refactor
**Date:** 2026-06-28
**Phase:** Implementation / Review

## Goal

This was a naming and structure refactor only.

The purpose was to organize files by long-term responsibility:

- `engine/` defines how the world works.
- `curriculum/` defines what students learn.
- `history/` shows the historical development of the project.
- `assets/` prepares a home for future visual assets.
- `save/` documents permanent progress structure.
- `co-gpt/` stores GPT handoff reports.

No new gameplay mechanics were added.

## Folder Restructuring

Created or formalized:

- `engine/`
- `curriculum/`
- `history/`
- `assets/`
- `save/`
- `co-gpt/`

The UI files stayed at the project root for now:

- `index.html`
- `app.js`
- `style.css`

This avoids unnecessary path churn while the students are still learning the basic website shell.

## Old Names To New Names

| Old name | New name | Reason |
| --- | --- | --- |
| `map.json` | `engine/world-map.json` | Describes world structure, map objects, tower positions, and navigation context. |
| `chronicles.json` | `engine/chronicles.json` | Chronicles are part of the world's recovered history and belong with world engine data. |
| `gameRules.js` | `engine/engine-rules.js` | The file now represents world progression rules, not only generic game rules. |
| `difficulty-config.json` | `curriculum/curriculum-config.json` | The config now represents curricula and tower-to-topic mappings, not only difficulty. |
| `questions.json` | `curriculum/question-bank.json` | The file is a learning-content bank, not just a temporary question list. |
| `history/v4-travelers/` | `history/v4-memory/` | The visible stage now teaches Save/Load memory, so the folder name was aligned. |

## Engine Responsibilities

`engine/world-map.json`

- world layout
- tower IDs
- tower positions
- central tower requirements
- blacksmith recipe

`engine/chronicles.json`

- recovered Creation Records
- dialogue
- project stage preview paths
- Time Fragment iframe paths

`engine/engine-rules.js`

- HP and Seal Energy helper rules
- tower clear state
- key fragment rewards
- central tower unlock rules
- Chronicle progress helpers
- save-state normalization helpers

The rule-layer global was renamed from `GameRules` to `EngineRules`.

## Curriculum Responsibilities

`curriculum/curriculum-config.json`

- available curriculum modes
- Easy / Difficult labels
- tower-to-topic mappings
- tower display names
- curriculum-specific tower descriptions

`curriculum/question-bank.json`

- question IDs
- topics
- difficulty values
- prompts
- answer choices
- correct answers
- explanations

## History Responsibilities

`history/` still stores Time Fragment mini-sites.

The folder `history/v4-travelers/` was renamed to `history/v4-memory/` because that stage now represents Save/Load memory.

The Chronicle preview path was updated:

```text
history/v4-memory/
```

## Save Responsibilities

Added:

- `save/progress-schema.json`

This documents the permanent save structure only. It does not store user save files.

Temporary tower-run state remains unsaved:

- current HP
- current streak
- current Seal Energy
- current shuffled deck
- current open Chronicle screen

## Assets Responsibilities

Added:

- `assets/.gitkeep`

This creates a stable folder for future avatars, icons, backgrounds, and other visual assets.

## Path Updates

Updated `index.html`:

- loads `engine/engine-rules.js`

Updated `app.js`:

- loads `curriculum/question-bank.json`
- loads `engine/world-map.json`
- loads `engine/chronicles.json`
- loads `curriculum/curriculum-config.json`
- uses `EngineRules` instead of `GameRules`

Updated `engine/chronicles.json`:

- Record V preview path now points to `history/v4-memory/`

Updated `README.md`:

- documents the new responsibility-based architecture.

## Behavior Preserved

The application should behave the same after this refactor.

No changes were made to:

- map gameplay
- tower objects
- HP rules
- Seal Energy rules
- combo rules
- Chronicle unlock order
- Chronicle Reader behavior
- Creator's Trial
- ending
- save/load behavior
- Easy / Difficult curriculum behavior

## Tests Run

Static checks:

- `node --check app.js`
- `node --check engine/engine-rules.js`
- parsed `curriculum/question-bank.json`
- parsed `curriculum/curriculum-config.json`
- parsed `engine/world-map.json`
- parsed `engine/chronicles.json`
- parsed `save/progress-schema.json`
- verified every configured curriculum tower topic has questions
- verified all question IDs are unique
- `git diff --check`

Browser checks:

- local app loaded through HTTP
- opening screen appeared
- Easy Mode reached map
- Easy Tower 1 opened Addition Tower
- Easy Tower 1 loaded an Addition question
- Difficult Mode reached map
- Difficult Tower 1 opened Fractions Tower
- Difficult Tower 1 loaded a Fractions question
- no console errors were found during the smoke checks

## Architecture Diagram

```text
Engine
  ↓
Curriculum
  ↓
History
  ↓
UI
  ↓
Assets
```

## Remaining Notes

`index.html`, `app.js`, and `style.css` stayed at the root intentionally. Moving them into `ui/` can happen later, but this pass prioritized low-risk responsibility naming.
