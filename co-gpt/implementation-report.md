# Implementation Report

**Project:** Exam Visualizer / SC
**Build or Version:** Save / Load Architecture Language Cleanup
**Date:** 2026-06-29
**Phase:** Implementation / Review

## Goal

This was mainly a conceptual cleanup.

The key idea:

```text
Save files remember world state.
They do not save the path of questions used to reach that state.
```

Questions are curriculum challenges. They change the world. The save file records what the world became after those changes.

## Configuration vs State

Configuration tells the software how to behave.

Examples:

- selected curriculum mode
- Easy / Difficult learning path
- tower-to-topic mapping
- question pool
- engine rules
- curriculum config

State tells the software what has already happened.

Examples:

- team members
- player position
- cleared towers
- key fragments
- unlocked Chronicles
- read / witnessed Chronicles
- central tower unlock state
- answered / correct / wrong statistics
- topic and tower progress

## Save Shape

The existing legacy-compatible `progress` object was preserved so old saves keep loading.

New saves now also include:

```json
"metadata": {
  "version": "3.0",
  "curriculum": "easy"
}
```

or:

```json
"metadata": {
  "version": "3.0",
  "curriculum": "difficult"
}
```

This makes curriculum mode a configuration reference, not ordinary world progress.

The runtime still keeps `progress.gameProgress.difficulty` for compatibility with existing app code and older save files.

## Old Save Normalization

Loading now checks curriculum mode in this order:

1. `metadata.curriculum`
2. `curriculum`
3. `progress.metadata.curriculum`
4. `progress.gameProgress.difficulty`
5. `progress.difficulty`
6. default to `easy`

Old saves with `difficulty: "easy"` or `gameProgress.difficulty` still load safely.

Old saves without difficulty / curriculum default to Easy Mode.

Loading still preserves:

- team data
- player position
- key fragments
- cleared towers
- tower progress
- Chronicle progress
- central tower unlock state
- answered / correct / wrong statistics

Loading does not restart the opening flow.

## Schema Update

Updated:

- `save/progress-schema.json`

The schema now explains:

- metadata / configuration reference
- team
- world state
- statistics
- old-save normalization
- why questions are not saved as world state

Important schema note:

```text
Questions are not saved because questions are not world state.
Questions are curriculum challenges. They change the world, and the save file records the result of those changes.
```

## Teaching Text Update

Updated:

- `Think clearly. Describe clearly. Build together..txt`

Added a new section:

```text
Configuration and State
```

The section explains for Grade 5-7 students:

- Configuration tells software how to behave.
- State tells software what has already happened.
- Questions are challenges, not saved world state.
- The save file remembers the result: towers cleared, fragments collected, records unlocked, and progress restored.

The original core message remains:

```text
Think clearly.
Describe clearly.
Build together.
```

## README Update

Updated:

- `README.md`

README now includes:

- Engine: how the world runs
- Curriculum: what the world teaches
- Presentation: how the world appears
- Save: what the world remembers

It also explains:

- curriculum choices are configuration
- save files store state and metadata
- questions themselves are not saved as world state

## Behavior Preserved

No changes were made to:

- opening flow
- Easy / Difficult selection UI
- map gameplay
- tower clearing
- question selection
- HP rules
- Seal Energy
- key fragments
- Chronicle unlocks
- Chronicle Reader
- Time Fragments
- Creator's Trial
- ending

## Files Changed

- `app.js`
- `save/progress-schema.json`
- `Think clearly. Describe clearly. Build together..txt`
- `README.md`
- `co-gpt/context-header.md`
- `co-gpt/implementation-report.md`
- `co-gpt/gpt-copy-paste.md`

## Tests Run

Static checks:

- `node --check app.js`
- `node --check engine/engine-rules.js`
- parsed `engine/world-map.json`
- parsed `curriculum/curriculum-config.json`
- parsed `curriculum/question-bank.json`
- parsed `curriculum/chronicles.json`
- parsed `save/progress-schema.json`
- `git diff --check`

Save/load compatibility harness:

- new save includes `metadata.curriculum`
- old save with `gameProgress.difficulty` still loads as Difficult
- old save without difficulty defaults to Easy
- loading preserves team members
- loading preserves cleared towers
- loading preserves key fragments
- loading preserves unlocked/read Chronicles
- loading preserves answered/correct/wrong statistics

Browser smoke checks:

- app opens through local HTTP
- Easy Mode reaches map
- Easy Tower 1 loads an Addition question
- Difficult Mode reaches map
- Difficult Tower 1 loads a Fractions question
- Save button works and reports `Saved Mode: Easy`
- no console errors were found

## Risks / Limitations

The runtime still stores curriculum mode in `progress.gameProgress.difficulty` internally for compatibility. The architecture documentation now explains that this field should be understood as a compatibility mirror of `metadata.curriculum`, not as ordinary world progress.
