# GPT Copy-Paste Handoff

Copy everything below and paste it into GPT.

---

# Context Header

**Current Project:**

Exam Visualizer

**Current Phase:**

Review

**Current Goal:**

Check whether the new topic-based practice hub structure is good for Grade 7 math students.

**Current Issue:**

Codex changed the website from one long question list into a topic-based practice hub. GPT should review whether the structure is clear, useful, and ready for student testing.

**Artifact:**

Implementation Report

**Project Link or Folder:**

GitHub Pages website / GitHub repository for Exam Visualizer

---

# Implementation Report

**Project:**

Exam Visualizer

**Build or Version:**

Topic-Based Practice Hub

**Date:**

2026-06-23

**Phase:** Implementation

---

## What We Built

Codex updated the Grade 7 math practice website into a topic-based practice hub.

The website now starts with entrance cards instead of immediately showing every question.

The file structure stayed the same for the website:

- `index.html`
- `style.css`
- `app.js`
- `questions.json`

---

## What Was Added

Codex added a topic field to each question in `questions.json`.

The topic entrances are:

- All Questions
- Fractions
- Integers
- Percent
- Algebra
- Geometry
- Ratios

When a student chooses a topic, the website shows only questions from that topic. All Questions shows every question.

Codex also added a Back to Topics button so students can return to the practice hub.

The existing answer feedback still works:

- The selected answer is checked.
- The correct answer is highlighted.
- Incorrect answers are marked.
- The explanation appears after the student answers.

No score counter was added yet.

---

## What We Tried

- **Test:** Checked whether `questions.json` is valid JSON.
- **Result:** The JSON file is valid.

- **Test:** Checked that all required topics exist in the question data.
- **Result:** Fractions, Integers, Percent, Algebra, Geometry, and Ratios are all present.

- **Test:** Checked that the main files include the new topic hub, topic cards, All Questions entrance, and Back to Topics button.
- **Result:** The topic-based structure is present in the website files.

---

## What Still Needs Work

- The live GitHub Pages version needs to be checked after pushing the update.
- A student should test whether choosing topics feels clear.
- GPT should review whether the topic names and screen flow are good for Grade 7 students.
- More questions can be added later so each topic has more practice.

---

## Next Improvements

Possible next improvements:

- Add more questions to each topic.
- Add a short topic description on each entrance card.
- Add difficulty levels.
- Add a restart button for a topic.
- Add scoring later, but not yet.

---

## Notes for Student Testing

During Review, the student should try these actions:

- Open the GitHub Pages website.
- Confirm the topic hub appears first.
- Click All Questions and check that all questions appear.
- Click Back to Topics.
- Click each math topic and check that only that topic's question appears.
- Answer a question and check that feedback and explanation still work.
- Decide whether the topic hub makes the practice easier to use.

GPT, please check whether the current topic-based structure is good for this project and suggest one focused improvement for the next iteration.
