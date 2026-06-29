# Implementation Report

**Project:** Exam Visualizer / SC
**Build or Version:** Chronicle Curriculum Responsibility Cleanup
**Date:** 2026-06-29
**Phase:** Implementation / Review

## Goal

This was a naming and responsibility cleanup only.

The purpose was to correct one conceptual boundary from the previous architecture refactor:

```text
Chronicles are curriculum content, not engine behavior.
```

No gameplay behavior was changed.

## Why Chronicles Moved

`chronicles.json` stores:

- Creation Record titles
- descriptions
- dialogue
- Time Fragment mappings
- stage history text

These records teach students how the project and world were built. They are read and learned by the player, so they belong in Curriculum.

They do not define HP, Seal Energy, tower clearing, unlock rules, or save normalization. Those responsibilities remain in Engine.

## Path Change

Moved:

```text
engine/chronicles.json
```

to:

```text
curriculum/chronicles.json
```

Updated `app.js` to load:

```js
loadJson("curriculum/chronicles.json")
```

No Chronicle data content was changed.

No Time Fragment iframe paths were changed.

## Updated Folder Responsibilities

### Engine

Question:

```text
How does the world run?
```

Files:

- `engine/world-map.json`
- `engine/engine-rules.js`

Responsibilities:

- world map structure
- tower IDs and positions
- central tower structure
- blacksmith recipe
- HP helpers
- Seal Energy helpers
- tower clear rules
- key fragment rules
- central tower unlock rules
- Chronicle unlock helper logic
- save normalization helpers

### Curriculum

Question:

```text
What does the world teach?
```

Files:

- `curriculum/curriculum-config.json`
- `curriculum/question-bank.json`
- `curriculum/chronicles.json`

Responsibilities:

- Easy / Difficult curriculum modes
- tower-to-topic mappings
- tower display names and curriculum descriptions
- learning questions
- answers and explanations
- Creation Records
- Chronicle dialogue
- project history content

### Presentation

Question:

```text
How does the world appear to the player?
```

Files and folders:

- `index.html`
- `app.js`
- `style.css`
- `history/`
- `assets/`

Responsibilities:

- visible UI containers
- browser event wiring
- rendering map, towers, practice, Chronicles, and Time Fragments
- visual styling
- historical mini-site display pages
- future visual assets

## Architecture Diagram

```text
Curriculum
    -> Engine
    -> Presentation
    -> Player
```

## Behavior Preserved

No changes were made to:

- opening flow
- difficulty selection
- team naming
- map gameplay
- tower labels
- Easy / Difficult topic mapping
- question selection
- HP rules
- Seal Energy
- key fragments
- Chronicle unlock order
- Chronicle Library
- Chronicle Reader
- Time Fragment reveal
- Creator's Trial
- ending
- save/load behavior

## Files Changed

- `app.js`
- `README.md`
- `co-gpt/context-header.md`
- `co-gpt/implementation-report.md`
- `co-gpt/gpt-copy-paste.md`
- `engine/chronicles.json` moved to `curriculum/chronicles.json`

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

Browser smoke checks:

- local app loaded through HTTP
- opening flow appeared
- Easy Mode reached the map
- Easy Tower 1 loaded an Addition question
- Difficult Mode reached the map
- Difficult Tower 1 loaded a Fractions question
- Chronicle Library opened
- Creation Records loaded from `curriculum/chronicles.json`
- an individual Chronicle Reader opened
- no console errors were found during the smoke checks

## Risks / Limitations

`history/` remains named `history/` for now. It still serves as the Time Fragment presentation area, and renaming it was intentionally left for a later decision.
