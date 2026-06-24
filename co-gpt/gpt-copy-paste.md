# GPT Copy-Paste Handoff

Copy everything below and paste it into GPT.

---

# Context Header

**Current Project:**

Exam Visualizer

**Current Phase:**

Review

**Current Goal:**

Check whether the expanded Grade 7 question bank is balanced, clear, and still works with the topic-based map practice structure.

**Current Issue:**

Codex expanded `questions.json` from 6 starter questions to 120 total questions: 20 questions each for Fractions, Integers, Percent, Algebra, Geometry, and Ratios. GPT should review whether the questions are appropriate for Grade 7 practice and whether the topic coverage feels balanced.

**Artifact:**

Implementation Report

**Project Link or Folder:**

GitHub Pages website / GitHub repository for Exam Visualizer

---

# Implementation Report

**Project:**

Exam Visualizer

**Build or Version:**

Expanded Grade 7 Question Bank

**Date:**

2026-06-24

**Phase:** Implementation

---

## What We Built

Codex expanded the Exam Visualizer question bank so each topic tower now has a larger set of practice questions.

The project now has:

- 120 total Grade 7 math questions.
- 20 Fractions questions.
- 20 Integers questions.
- 20 Percent questions.
- 20 Algebra questions.
- 20 Geometry questions.
- 20 Ratios questions.

The existing map, topic hub, Save Progress, Load Progress, Back to Topics, answer feedback, and explanations were kept.

---

## What Was Changed

Codex updated:

- `questions.json`

Each question still uses the existing structure:

- `id`
- `type`
- `topic`
- `title`
- `question`
- `options`
- `answer`
- `explanation`

The topic names were kept exactly the same as the map topics:

- Fractions
- Integers
- Percent
- Algebra
- Geometry
- Ratios

This matters because the map towers and topic entrance cards filter questions by the `topic` field.

---

## What We Tried

- **Test:** Checked that `questions.json` is valid JSON.
- **Result:** The question data is valid.

- **Test:** Counted the total number of questions.
- **Result:** There are 120 questions.

- **Test:** Counted questions by topic.
- **Result:** Each topic has exactly 20 questions.

- **Test:** Checked that every question has a unique id.
- **Result:** All question ids are unique.

- **Test:** Checked that every answer matches one of the listed answer choices.
- **Result:** All answers match valid choices.

- **Test:** Checked that the map's six outer tower topics all have matching questions.
- **Result:** Every outer tower topic has 20 matching questions.

- **Test:** Checked that `app.js` has valid JavaScript syntax.
- **Result:** The app script passes syntax checking.

---

## What Still Needs Work

- The live GitHub Pages version should be tested after pushing.
- A student should try each topic tower and confirm the questions feel clear.
- GPT should review whether the questions are Grade 7 appropriate.
- GPT should check whether any topic needs easier, harder, or more visual questions.

---

## Next Improvements

Possible next improvements:

- Add difficulty labels such as easy, medium, and challenge.
- Add visual diagrams for some geometry questions.
- Add question randomization inside each topic.
- Add review mode for wrong answers.
- Connect question difficulty to the future game reward system.

---

## Notes for Student Testing

During Review, the student should try these actions:

- Open the website.
- Click each outer topic tower.
- Answer several questions from each topic.
- Confirm each topic only shows its own questions.
- Confirm All Questions shows questions from every topic.
- Confirm answer feedback and explanations still appear.
- Save progress and load it again.
- Confirm progress is still restored after using the larger question bank.

GPT, please check whether this expanded Grade 7 question bank is balanced, clear, and appropriate for student practice. Suggest one focused improvement for the next iteration.

