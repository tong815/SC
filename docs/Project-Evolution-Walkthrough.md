# AI Summer Camp - How a Project Evolves

## Teacher Goal

Students are already building their own projects.

Now they need to think about structure, not just features.

A project does not improve only because we add more things. It improves when each part has a clear job.

## Key Sentence

"A good project doesn't become bigger. It becomes better organized."

## GitHub Walkthrough Links

- Repository home: [../](../)
- `index.html`: [../index.html](../index.html)
- `style.css`: [../style.css](../style.css)
- `app.js`: [../app.js](../app.js)
- `questions.json`: (Link to be updated after confirming file path.)
- Current question bank: [../curriculum/question-bank.json](../curriculum/question-bank.json)
- `map.json`: (Link to be updated after confirming file path.)
- Current world map: [../engine/world-map.json](../engine/world-map.json)
- `engine-rules.js`: [../engine/engine-rules.js](../engine/engine-rules.js)
- Story / Chronicle JSON: [../curriculum/chronicles.json](../curriculum/chronicles.json)

## Stage 1 - MVP: One Working Question

**New Problem:** We needed one working interaction.

**New Responsibility:** Show a question, accept an answer, and give feedback.

**New Structure:** MVP page.

**Main File or Layer:** `index.html`, `style.css`, and `app.js`

The project started with one question.

The goal was not to build the whole game yet. The goal was only to make one interaction work:

1. Show a question.
2. Let the student click an answer.
3. Show whether the answer was correct.

At this stage, the most important idea is MVP: Minimum Viable Product.

An MVP is the smallest version that actually works.

Files:

- `index.html` = structure / entry point
- `style.css` = visual presentation
- `app.js` = behavior / coordination

**Teacher Question:**

What file does the browser open first?

**Expected Answer:**

Usually `index.html`. It is the entry point of the webpage.

**Teacher Question:**

Which file defines what is on the screen?

**Expected Answer:**

`index.html` defines the basic page structure and the main elements on the screen.

**Teacher Question:**

Which file makes the page look better?

**Expected Answer:**

`style.css` controls the visual design, such as colors, spacing, layout, and fonts.

**Teacher Question:**

Which file controls what happens after a click?

**Expected Answer:**

`app.js` controls behavior. It decides what happens when the user clicks or interacts.

**Key Lesson:** Start with the smallest version that works.

## Stage 2 - More Questions: Data Layer

**New Problem:** One question was not enough.

**New Responsibility:** Store many questions clearly.

**New Structure:** Data Layer.

**Main File or Layer:** `curriculum/question-bank.json`

One question was not enough.

The project needed many questions.

But putting many questions directly inside JavaScript makes the logic messy. JavaScript should not become a giant storage box for every question.

Questions are not behavior.

Questions are data.

This created the need for a question data file.

In the current project, the question bank is stored here:

- [../curriculum/question-bank.json](../curriculum/question-bank.json)

This means the code can focus on behavior, while the JSON file stores learning content.

**Teacher Question:**

If your own project has 100 players, 100 questions, 100 items, or 100 levels, where should they live?

**Expected Answer:**

They should live in a data structure or data file, not all inside the main JavaScript logic.

**Teacher Question:**

Should they all stay inside JavaScript?

**Expected Answer:**

No. Questions are data, so they should live in a data file such as JSON. JavaScript should control behavior, not store all content.

**Key Lesson:** When content grows, move content out of logic and into data.

## Stage 3 - Topics: Organizing Existing Data

**New Problem:** Many questions became hard to navigate.

**New Responsibility:** Organize questions into clear groups.

**New Structure:** Topic / Category Structure.

**Main File or Layer:** Topic fields inside `curriculum/question-bank.json`

More questions created a new problem.

If there are many questions, students need a way to choose what kind of question they want.

The project grouped questions by topic.

This did not always require a new file. Sometimes the correct solution is improving the structure inside an existing data file.

For example, a question can store its topic:

```text
topic: Addition
topic: Fractions
topic: Geometry
```

That one field helps the app group questions without hardcoding every category in JavaScript.

**Teacher Question:**

Does your project need categories?

**Expected Answer:**

Maybe. If the project has many items, levels, questions, characters, or scenes, categories can help users find them.

**Teacher Question:**

Are your categories stored as data or hardcoded in logic?

**Expected Answer:**

They should usually be stored as data. If categories are hardcoded in logic, the project becomes harder to change later.

**Key Lesson:** Not every improvement needs a new file. Sometimes the right answer is a better structure inside an existing file.

## Stage 4 - Map: Navigation Layer

**New Problem:** Topic buttons worked, but the experience was not exciting.

**New Responsibility:** Help the player explore the world.

**New Structure:** Map / Navigation Layer.

**Main File or Layer:** `engine/world-map.json`

Topic buttons worked, but the experience was not exciting.

A map created exploration and progression.

The map gives students a world to move through. Towers, positions, names, and connections are map data.

In the current project, the world map is stored here:

- [../engine/world-map.json](../engine/world-map.json)

The map describes the world.

It does not define the rules.

For example:

- A tower's name is map data.
- A tower's position is map data.
- A tower's topic can be connected to curriculum data.
- Whether a tower is cleared is not map data.
- How a tower becomes cleared is not map data.

**Teacher Question:**

If your project has locations, scenes, maps, or levels, where should that information live?

**Expected Answer:**

It should usually live in data, because locations and level layouts describe the world.

**Teacher Question:**

Is it data, behavior, or visual style?

**Expected Answer:**

Locations and map layout are data. How they look is visual style. What happens when the player uses them is behavior or rules.

**Key Lesson:** Navigation and world layout are data, not rules.

## Stage 5 - Rule Engine: Laws of the World

**New Problem:** The world needed rules.

**New Responsibility:** Decide what is allowed and what happens after player actions.

**New Structure:** Rule Engine.

**Main File or Layer:** `engine/engine-rules.js`

After adding a map, the project needed rules.

The project had to answer questions like:

- How does a tower become cleared?
- How does the player earn key fragments?
- How does the player forge the central key?
- How does the central tower unlock?

These questions are not map data.

They are not UI.

They belong to a rule engine.

In the current project, the rule engine is stored here:

- [../engine/engine-rules.js](../engine/engine-rules.js)

Important wording:

- Map describes the world.
- Questions describe the content.
- EngineRules describes the laws of the world.
- `app.js` coordinates the application.
- `engine-rules.js` contains pure reusable rules. It should not directly change the webpage. It should only decide the game rules. `app.js` is responsible for updating the webpage after the rules have been applied.

Advanced note: When JavaScript changes the webpage, it is changing the DOM, which is the webpage structure inside the browser.

This is a big software engineering idea:

Rules should be reusable.

Rules should be testable.

Rules should not depend on screen buttons or HTML elements.

**Teacher Question:**

Where should your project rules live?

**Expected Answer:**

They should live in a rules layer or clear rules functions, not mixed randomly with data or page display code.

**Teacher Question:**

Which part of your project decides what is allowed?

**Expected Answer:**

The rule engine should decide what is allowed, such as whether a tower is cleared or a reward is earned.

**Teacher Question:**

Which part decides what happens after a player action?

**Expected Answer:**

The rules decide the result. Then `app.js` coordinates the page update so the player can see what happened.

**Key Lesson:** Rules should be separate from both data and webpage display.

## Stage 6 - Save / Load: Player State

**New Problem:** Progress disappeared when the browser closed.

**New Responsibility:** Remember what happened to the player.

**New Structure:** Save / Load State.

**Main File or Layer:** Save data / player progress

When students close the browser, progress disappears.

Save / Load exists because the player state must survive.

We do not save the questions.

We do not save the map.

We save the player's progress.

Static data is the information that already exists before the player starts.

Examples:

- questions
- map layout
- tower names
- rules
- story records

Dynamic state is what changes while the player plays.

Examples:

- cleared towers
- collected key fragments
- unlocked Chronicles
- answered question statistics
- selected curriculum mode

The save file should remember what happened to the player, not copy the whole project.

**Teacher Question:**

If the user closes your project today, what should still exist tomorrow?

**Expected Answer:**

The user's progress should still exist, such as completed levels, unlocked items, scores, or saved choices.

**Teacher Question:**

What is static data in your project?

**Expected Answer:**

Static data is information that is already part of the project, such as questions, maps, items, characters, or story text.

**Teacher Question:**

What is dynamic player/user state?

**Expected Answer:**

Dynamic state is what changes because of the user, such as progress, unlocked content, current score, or saved choices.

**Key Lesson:** Static data describes the world. Dynamic state remembers what happened to the player.

## Stage 7 - Story / Chronicles: Narrative Layer

**New Problem:** The project worked, but it needed meaning.

**New Responsibility:** Give the system a beginning, characters, records, and purpose.

**New Structure:** Story / Narrative Layer.

**Main File or Layer:** `curriculum/chronicles.json`

The project worked, but it needed meaning.

It needed:

- a beginning
- an ending
- characters
- dialogue
- records
- a reason to continue

Story is also data.

The code displays story data.

The story layer gives meaning to the system.

In the current project, Chronicle story data is stored here:

- [../curriculum/chronicles.json](../curriculum/chronicles.json)

This keeps story text separate from application behavior.

That makes the project easier for students to edit later.

**Teacher Question:**

Does your project need a story, introduction, ending, or character dialogue?

**Expected Answer:**

Maybe. If story helps users understand the goal or feel motivated, it can make the project more engaging.

**Teacher Question:**

Should that story be written inside JavaScript or stored as data?

**Expected Answer:**

It should usually be stored as data. JavaScript should display the story, not hide all the story text inside logic.

**Key Lesson:** Story can also be data.

## Simple Structure Diagram

```text
HTML -> CSS -> app.js -> EngineRules + JSON Data -> Save/Load State
```

This diagram means:

- HTML gives the project a page.
- CSS gives the page visual style.
- `app.js` coordinates the experience.
- EngineRules decides the laws of the world.
- JSON data stores content and world information.
- Save/Load state remembers player progress.

## Evolution Timeline

```text
MVP
  ↓
Question Data
  ↓
Topic Structure
  ↓
Map / Navigation Layer
  ↓
Rule Engine
  ↓
Save / Load State
  ↓
Story / Chronicles Layer
```

```text
New Problem
  ↓
New Responsibility
  ↓
New Structure
  ↓
Maybe a New File
  ↓
Cleaner Project
```

A new feature does not always mean a new file.

First ask whether the project has a new responsibility.

If yes, decide whether to improve an existing structure or create a new layer.

## Student Reflection Section

For my project:

- My HTML is responsible for:
- My CSS is responsible for:
- My JavaScript is responsible for:
- My JSON/data is responsible for:
- My rules are responsible for:
- My user/player state is:
- The next problem my project will face is:
- The next structure I may need is:

Current Stage:

- [ ] MVP
- [ ] Data Layer
- [ ] Topic / Category Structure
- [ ] Map / Navigation Layer
- [ ] Rule Engine
- [ ] Save / Load State
- [ ] Story / Narrative Layer

## Final Message

"Good programmers add features.
Great software engineers improve structure."

"Features make software bigger.
Structure lets software keep growing."

"Before asking AI to add a new feature, ask: Does my project need more code, or does it need a better structure?"
