# To-Do List Logic

This is a small single-page todo app. `index.html` provides the task input, list shell, theme button, and the full-window Three.js canvas. `style.css` owns the visual system, responsive layout, and task states. `script.js` owns localStorage-backed task state, theme switching, and the background dragon scene.

## Current Behavior

- Tasks are stored in `localStorage` under `tasks`.
- The theme is stored in `localStorage` under `theme`.
- The Three.js canvas is decorative and does not intercept clicks.
- Task actions stay client-only: add on button click or Enter, toggle by clicking a task row, delete with the row delete button.

## Past Decisions

- 2026-07-05: Replaced the old neon/dragonfly treatment with a cleaner glass task panel and a primitive-built 3D dragon background. Kept the app as static HTML/CSS/JS with the existing Three.js CDN and localStorage behavior.
