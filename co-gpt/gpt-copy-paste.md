# GPT Copy-Paste Report

Please review this Time Fragment curriculum alignment update for the Exam Visualizer / SC project.

---

# Context Header

**Current Project:**

Exam Visualizer / SC

**Current Phase:**

Time Fragment Curriculum Alignment

**Current Goal:**

Make the historical prototype pages index the existing curriculum data instead of owning hardcoded question/topic examples.

**Current Issue:**

The main world supports Easy Mode and Difficult Mode, but the Time Fragment prototype pages still displayed fixed examples such as fractions in Record I. Codex updated the iframe URL to pass the selected curriculum mode and made the history pages read from `curriculum/curriculum-config.json`, `curriculum/question-bank.json`, and `engine/world-map.json`.

**Artifact:**

Implementation Report

**Project Link or Folder:**

`C:\Users\chena\Desktop\Exam-Visualizer`

---

# Implementation Report

**Project:** Exam Visualizer / SC
**Build or Version:** Time Fragment Curriculum Alignment
**Date:** 2026-06-29
**Phase:** Implementation / Review

## Goal

The Time Fragment / history prototype pages should not be a second content source.

They should be stage viewers:

```text
History pages decide which prototype stage is being demonstrated.
Curriculum files decide which questions, topics, and tower names exist.
```

This keeps Easy Mode and Difficult Mode consistent across the main game and the recovered history pages.

## Architecture Update

The source of truth remains:

- `curriculum/curriculum-config.json`
- `curriculum/question-bank.json`
- `engine/world-map.json`

The history pages now read from these existing files through the shared helper:

- `history/shared/history-utils.js`

No new question files were created.

No Easy / Difficult content was duplicated inside the history pages.

## Passing Current Curriculum Into Time Fragments

Updated:

- `app.js`

Chronicle iframe previews now append the selected curriculum mode:

```text
history/v0-question-only/?curriculum=easy
history/v0-question-only/?curriculum=difficult
```

The same pattern is used for all Time Fragment pages.

## Shared History Loader

Updated:

- `history/shared/history-utils.js`

The shared helper now:

- reads `curriculum` or `mode` from the URL
- defaults invalid or missing values to Easy Mode
- fetches curriculum config
- fetches the question bank
- fetches the world map for tower positions
- builds current tower labels, topics, descriptions, and sample questions
- provides a safe Easy fallback if loading fails

## History Pages Updated

Updated:

- `history/v0-question-only/index.html`
- `history/v1-topic-structure/index.html`
- `history/v2-first-map/index.html`
- `history/v3-rules/index.html`
- `history/v4-memory/index.html`
- `history/v5-complete-prototype/index.html`

Record I now shows one question from the active curriculum.

Record II now shows the active curriculum categories.

Record III now shows the active curriculum tower names and topics.

Record IV now uses active curriculum tower labels and questions in the rules demo.

Record V now shows the active mode and restored tower label in the save/load demo.

Record VI now names the active learning path without hardcoding subject labels.

## Tests Run

Static checks:

- `node --check app.js`
- `node --check engine/engine-rules.js`
- parsed `curriculum/curriculum-config.json`
- parsed `curriculum/question-bank.json`
- parsed `curriculum/chronicles.json`
- parsed `engine/world-map.json`
- `git diff --check`

Browser checks through local HTTP:

- Record I Easy shows an Addition question from `question-bank.json`
- Record I Difficult shows a Fractions question from `question-bank.json`
- Record II Easy shows Easy categories
- Record II Difficult shows Difficult categories
- Record III Easy shows Easy tower labels
- Record III Difficult shows Difficult tower labels
- Record IV Easy shows Addition Tower and an Easy question
- Record IV Difficult shows Fractions Tower and a Difficult question
- Record V Easy shows `Mode: Easy` and `Restored: Addition Tower`
- Record V Difficult shows `Mode: Difficult` and `Restored: Fractions Tower`
- Record VI Easy says Easy Mode is the current learning path
- Record VI Difficult says Difficult Mode is the current learning path
- no browser console errors were found

## Behavior Preserved

No changes were made to main gameplay, save/load, Chronicle unlocking, Time Fragment reveal timing, Creator's Trial, or the ending.

## Risk / Note

The history pages remain small prototype viewers. They now index curriculum data, but they do not reproduce the full main game engine.
