# Exam Visualizer

Exam Visualizer is a minimal exam website that turns a JSON question bank into
interactive multiple-choice questions. A student can select an answer once,
receive immediate correct/incorrect feedback, and read the correct answer and
explanation.

The project deliberately separates three concerns:

1. **Question data layer** — the reusable question content in `questions.json`.
2. **JSON structure layer** — the consistent fields used to describe every question.
3. **Visualization layer** — `app.js` converts the JSON data into interactive HTML,
   while `style.css` controls presentation.

## File structure

```text
SC/
├── index.html      # Page structure and application containers
├── style.css       # Responsive visual styling
├── app.js          # Data loading, rendering, and answer interaction
├── questions.json  # Source question bank
└── README.md       # Project documentation
```

## How to run

Because `app.js` loads `questions.json` with `fetch`, the project should be served
through a small local web server instead of opening `index.html` directly.

### Option 1: Python

Open a terminal in this folder and run:

```powershell
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

### Option 2: VS Code Live Server

Open the folder in VS Code, install the Live Server extension, and choose
**Open with Live Server** from `index.html`.

## JSON question structure

Each question uses this structure:

```json
{
  "id": "q1",
  "type": "multiple-choice",
  "title": "Question topic",
  "question": "Question text",
  "options": [
    { "id": "A", "text": "First answer" },
    { "id": "B", "text": "Second answer" }
  ],
  "answer": "A",
  "explanation": "Why the answer is correct."
}
```

- `id`: unique question identifier
- `type`: question type used by the renderer
- `title`: short question title or topic
- `question`: full question prompt
- `options`: available answers, each with an ID and display text
- `answer`: ID of the correct option
- `explanation`: feedback shown after the student answers

## Possible next steps

- Add score and completion statistics.
- Store student answers and timestamps in local storage or a database.
- Add navigation, filters, categories, and randomized question order.
- Support true/false, fill-in-the-blank, and short-answer questions.
- Create a teacher editor that validates and updates the JSON question bank.
- Add import/export tools for larger question sets.
- Connect the front end to an API for users, classes, and saved exam attempts.
