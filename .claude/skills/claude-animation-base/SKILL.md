---
name: claude-animation-base
description: Make hand-painted 2D character animation videos (p5.js + p5.brush, brush-stroke look, fluid character motion, emotions, camera) with the ClaudeAnimationBase starter kit by JohnHeibel. Use when the user wants an animated character video, storyboard-to-MP4 animation, or a painterly/handmade look.
---

# Claude Animation Base

Starter kit (github.com/JohnHeibel/ClaudeAnimationBase) bundled in this skill folder.

1. Read `ANIMATION_GUIDE.md` in this folder fully before writing anything (rules, workflow, API).
2. Copy this folder to a working dir (e.g. `video-anim/`), then `npm install`. Needs Node, Chrome/Chromium and ffmpeg.
3. Storyboard first, then build shot by shot in `src/scenes/`, render contact sheets to check your work, then:
   `node render.mjs --clip --out=out/video.mp4` (add `--chrome=<path>` or `CHROME_PATH`, `--soft-gl` with no GPU).
4. `studio.html` previews/scrubs in Chrome.

Characters live in `src/clawd.js` (views, emotions, eyes, mouths, emotes, dances); camera, light, motion helpers in `src/core.js`; shots and brush-wipe transitions in `src/timeline.js`.
