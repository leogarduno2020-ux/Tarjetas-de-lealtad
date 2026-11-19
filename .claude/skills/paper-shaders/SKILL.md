---
name: paper-shaders
description: Use Paper Design shaders (@paper-design/shaders-react / @paper-design/shaders) for animated GPU backgrounds and effects - mesh gradients, swirl, metaballs, liquid metal, grain gradients, warps, etc. Use when a video or UI needs rich animated gradient/shader backgrounds or texture effects.
---

# Paper Shaders

Library: github.com/paper-design/shaders (docs: https://shaders.paper.design). Installed in `video/` (`@paper-design/shaders-react`, `@paper-design/shaders`).

```tsx
import {MeshGradient} from '@paper-design/shaders-react';
<MeshGradient colors={['#5100ff','#00ff80','#ffcc00','#ea00ff']} distortion={1} swirl={0.8} speed={0.2} style={{width:1280,height:720}} />
```

Every shader accepts `colors`, `speed`, size/`scale`, and `style`. List the available components with `ls video/node_modules/@paper-design/shaders-react/dist/shaders` and read each `.d.ts` for its props; full source and per-shader docs are in the upstream repo (`docs/src/shader-defs`).

## In Remotion (deterministic rendering)
Do NOT rely on real-time `speed`. Set `speed={0}` and drive time from the frame: `frame={useCurrentFrame() * 16}` (ms-like offset; the `frame` prop controls the animation phase). Layer a `<ThreeCanvas>` (`@remotion/three`) on top for 3D with camera moves. Render with `--gl=swangle` when no GPU.
