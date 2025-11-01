Hashing Visualizer (local web app)

What it is
- A small single-page web app that animates four collision resolution techniques:
  - Separate Chaining (open hashing)
  - Linear Probing
  - Quadratic Probing
  - Double Hashing

Features
- Enter table size and hash expressions (JS expressions using `key` and `tableSize`).
- Enter a list of keys (comma or space separated).
- Prepare insertions (builds internal queues) and animate step-by-step or play automatically.
- Visual layout for each table with highlights for probe/placement.

How to run
1. Open `web/index.html` in your browser (double-click the file or use a local static server).
2. Adjust `Table size`, `Primary hash`, and `Secondary hash` as needed.
3. Paste keys into the keys input and click `Prepare Insertions`.
4. Click `Run` to animate insertion of all keys. Use `Step` to step one action at a time.

Notes & safety
- The app evaluates the hash expressions you type using the JavaScript Function constructor. This runs code in your browser only. Don't paste untrusted JS into this field if you are concerned.
- This is a simple educational tool; it does not attempt advanced resizing or deletion features.

Files
- `index.html` — UI
- `styles.css` — simple styling
- `script.js` — visualization & animation logic

Next improvements (ideas)
- Add search and delete animation
- Show probes count / load factor statistics
- Add automatic resizing and rehashing demonstration
- More input validation and nicer UI polish
