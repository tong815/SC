# Implementation Report

**Project:** Exam Visualizer / SC
**Build or Version:** Visual-Novel Chronicle Experience
**Date:** 2026-06-28
**Phase:** Implementation / Review

## What We Updated

Codex upgraded the Chronicle reader into a visual-novel-style Chronicle Experience. A Chronicle no longer shows all dialogue and the Time Fragment immediately. Instead, the player witnesses one dialogue line at a time, then reveals the matching Time Fragment after the final line.

No tower practice mechanics, HP rules, Seal Energy rules, combo rules, Chronicle unlock rules, history folder paths, or save/load structure were redesigned.

## Files Changed

- `app.js`
- `style.css`
- `index.html`
- `co-gpt/context-header.md`
- `co-gpt/implementation-report.md`
- `co-gpt/gpt-copy-paste.md`

## UI Flow Changes

New flow:

1. Open Chronicles.
2. See the Creation Records list.
3. Locked records are disabled.
4. Recovered records are clickable.
5. Click a recovered record.
6. Enter the Chronicle Experience.
7. See `Creation Record I`, `Recovered`, title, and one dialogue line.
8. Advance with:
   - clicking the record area
   - clicking the `Next` button
   - pressing Enter or Space
9. After the final dialogue line, click `Reveal Time Fragment`.
10. The Time Fragment iframe appears.
11. Click `Return to Creation Records`.
12. Back to Map still works from the Chronicle list.

## Dialogue Data

Dialogue still comes from `chronicles.json`.

Each line still uses the existing data shape:

```json
{
  "speaker": "T",
  "text": "Before there is a world, there is a wish."
}
```

No Chronicle dialogue was hardcoded into `app.js`.

## Read / Witnessed State

Read state now means fully witnessed.

Before this change, a Chronicle was marked read immediately when opened.

Now a Chronicle is marked as witnessed only after:

1. the player reaches the final dialogue line, and
2. the Time Fragment is revealed.

The existing save fields were preserved:

- `unlockedChronicleIds`
- `readChronicleIds`
- `currentChronicleId`
- `lastUnlockedChronicleId`

No new save fields were added.

## Time Fragment Reveal

The iframe is hidden during dialogue playback.

After the final line, the screen shows:

`The record opens a path through time...`

Then the existing Time Fragment iframe appears with:

- `Observed Era`
- `Age I/II/III...`
- `Time Fragment Window`
- the matching historical mini-site iframe

## Styling / Animation

`style.css` now supports:

- visual-novel-style speaker stage
- large speaker initials
- centered manuscript dialogue panel
- line fade transition
- recovered/witnessed record indicators
- Creation Records progress grid
- Time Fragment reveal state
- mobile stacking for the speaker layout

The style remains mythic/manuscript-like and avoids modern chat bubbles.

## Tests

Static checks:

- `node --check app.js`
- `node --check gameRules.js`
- parsed `questions.json`
- parsed `map.json`
- parsed `chronicles.json`
- `git diff --check` passed with only normal CRLF warnings

Browser checks:

- Main game opens normally.
- Chronicle list opens normally.
- Locked records cannot be opened.
- Unlocked records open the Chronicle Experience.
- Dialogue shows one line at a time.
- Clicking the record area advances dialogue.
- The visible `Next` button advances dialogue.
- Enter key advances dialogue.
- Time Fragment iframe does not appear before dialogue completion.
- Time Fragment iframe appears after the final dialogue line.
- Chronicle is not marked read/witnessed immediately on open.
- Chronicle becomes witnessed only after Time Fragment reveal.
- `Return to Creation Records` works.
- `Back to Map` works from the Chronicle list.
- First tower clear still unlocks Chronicle I.
- Re-clearing the same tower does not unlock another Chronicle.
- All six Chronicles reveal the correct Time Fragment iframe after their dialogue.
- No console errors were found.

## Risks / Limitations

- The Chronicle Experience currently restarts from the first dialogue line each time a record is opened. This keeps save data simple and avoids adding temporary cutscene progress.
- There are no character portraits yet. Speaker identity is shown with large initials (`T`, `G`, etc.), as requested.
- The full Time Fragment iframe loads only after completion, which is correct for the experience but means students must advance through the short dialogue before viewing the historical mini-site.

## GPT Review Request

GPT, please review:

- Does the Chronicle Experience now feel like witnessing a creation-history cutscene?
- Is one-line-at-a-time dialogue clear and quick enough for Grade 5-7 students?
- Is `Witnessed` a better read-state label than `Read`?
- Does the Time Fragment reveal happen at the right moment?
- Is the speaker presentation mythic without feeling like modern chat?
- Are there any accessibility or clarity issues with click / Next / Enter / Space input?
