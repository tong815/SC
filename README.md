# Exam Visualizer

Exam Visualizer is an educational math RPG. Students explore a map, enter towers,
answer curriculum questions, recover Chronicles, and eventually reach the
Creator's Trial.

The project is organized by long-term responsibility:

1. **Engine** - how the world works.
2. **Curriculum** - what students learn.
3. **History** - how the project explains its own development.
4. **UI** - how students see and control the experience.
5. **Assets** - future images, icons, and visual resources.
6. **Save** - documentation for permanent player progress.

## File Structure

```text
Exam-Visualizer/
├── engine/                 # World structure, Chronicles, and progression rules
│   ├── world-map.json
│   ├── chronicles.json
│   └── engine-rules.js
├── curriculum/             # Learning content and curriculum mappings
│   ├── curriculum-config.json
│   └── question-bank.json
├── history/                # Historical Time Fragment mini-sites
├── save/                   # Save structure documentation
├── assets/                 # Future visual assets
├── co-gpt/                 # GPT handoff reports
├── index.html              # Static UI containers
├── app.js                  # Data loading, rendering, and browser events
├── style.css               # Presentation and responsive styling
└── README.md
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
- Change curriculum-to-tower mappings in `curriculum/curriculum-config.json`.
- Change map objects and tower positions in `engine/world-map.json`.
- Change progression rules in `engine/engine-rules.js`.
- Change visible screens and interactions in `app.js`.
- Change visual styling in `style.css`.
