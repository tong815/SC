# Exam Visualizer

Exam Visualizer is an educational math RPG. Students explore a map, enter towers,
answer curriculum questions, recover Chronicles, and eventually reach the
Creator's Trial.

The project is organized around three teaching questions:

1. **Engine** - how does the world run?
2. **Curriculum** - what does the world teach?
3. **Presentation** - how does the world appear to the player?

The Save layer adds one more question:

4. **Save** - what does the world remember?

Questions and Chronicles belong to Curriculum because they are learning and
story content. Tower rules belong to Engine because they decide how the world
behaves. Time Fragment webpages belong to the Presentation / History display
because they show recovered project stages to the student.

Curriculum choices are configuration. For example, Easy Mode and Difficult Mode
tell the software which learning path to use. Save files store state and
metadata: what happened in the world, plus which curriculum was being used.
Questions themselves are not saved as world state. They are curriculum
challenges that cause state changes, such as cleared towers, key fragments, and
unlocked Chronicles.

## File Structure

```text
Exam-Visualizer/
|-- engine/                 # World structure and progression logic
|   |-- world-map.json
|   `-- engine-rules.js
|-- curriculum/             # Learning content and recovered story content
|   |-- curriculum-config.json
|   |-- question-bank.json
|   `-- chronicles.json
|-- history/                # Time Fragment stage pages
|-- save/                   # What the world remembers
|-- assets/                 # Future avatars, icons, backgrounds, and images
|-- co-gpt/                 # GPT handoff reports
|-- index.html              # Static UI containers
|-- app.js                  # Data loading, rendering, and browser events
|-- style.css               # Presentation and responsive styling
`-- README.md
```

## Architecture Flow

```text
Curriculum
    -> Engine
    -> Presentation
    -> Player
```

## How To Run

Because `app.js` loads JSON files with `fetch`, serve the project through a
small local web server instead of opening `index.html` directly.

```powershell
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Student Editing Guide

- Add or edit learning questions in `curriculum/question-bank.json`.
- Edit recovered Creation Records in `curriculum/chronicles.json`.
- Change curriculum-to-tower mappings in `curriculum/curriculum-config.json`.
- Change map objects and tower positions in `engine/world-map.json`.
- Change progression rules in `engine/engine-rules.js`.
- Review save structure in `save/progress-schema.json`.
- Change visible screens and interactions in `app.js`.
- Change visual styling in `style.css`.
