# CLAUDE.md — designCTRL

## Project Overview
designCTRL is an MEP (Mechanical, Electrical, Plumbing) engineering design application for the CTRL suite. It provides system design, equipment scheduling, submittal generation, commissioning checklists, and engineering drawing capabilities. This is the next step in the MEP process after takeoff estimation (handled by bas-takeoff/pdfCTRL).

## Target Users
Engineers, MEP designers, project managers.

## Stack
- React 19 + TypeScript 5
- Vite 6 (build toolchain)
- Zustand 4.5 (state management)
- Framer Motion 11.3 (animations, liquid glass panels)
- Fabric.js 6 (2D canvas engine)
- Pure CSS (NO Tailwind, NO CSS frameworks)
- Dark theme primary with glassmorphism depth mode

## Design System (from pdfCTRL standard)
- Layout zones: Header Bar, Left Sidebar (tools), Center Canvas, Right Panel (properties/layers/equipment), Status Bar
- 3 appearance modes: Classic Depth, Glassmorphism Depth, Neon Cyberpunk
- 7 canvas accent colors: Cyan, Indigo, Violet, Green, Rose, Amber, Steel
- 7 themes: Mission Control, Winter Wonderland, Night Sky, Drifting in Space, Aurora Borealis, Deep Ocean, Arctic Ice
- Typography: Monospaced uppercase for headings, regular for body
- Corner bracket motifs for featured containers
- Liquid Glass 2.0 pop-up panels (framer-motion spring animations)
- Design vocabulary: depth, flat, glow, pop, soften, harden, breathe, tighten, float, sink

## Architecture Rules
- DO NOT modify pdfCTRL — reference only
- ALL libraries must be free/open-source (MIT, Apache, BSD, LGPL, MPL)
- Start with 2D, plan for 3D integration later
- konva.js, excalidraw, tldraw forks are for a SEPARATE design-drawing-only version

## File Structure
```
designCTRL/
  CLAUDE.md
  package.json
  tsconfig.json
  vite.config.ts
  index.html
  .gitignore
  src/
    main.tsx
    App.tsx
    vite-env.d.ts
    styles/
      globals.css
    components/
      HeaderBar.tsx
      LeftSidebar.tsx
      CenterCanvas.tsx
      RightPanel.tsx
      StatusBar.tsx
      LiquidGlassPanel.tsx
    stores/
      useDesignStore.ts
      useCanvasStore.ts
```

## Commands
- `npm install` — install dependencies
- `npm run dev` — start dev server (Vite, port 5173)
- `npm run build` — production build
- `npm run preview` — preview production build
- `npx tsc --noEmit` — type check

## Future Libraries (planned, not yet integrated)
- @antv/X6 (MIT) — P&ID, control diagrams, equipment connections
- @xyflow/react (MIT) — system flow diagrams, scheduling views
- dxf-parser + three-dxf (MIT) — DWG/DXF import/export
- web-ifc + @thatopen/components (MPL-2.0/MIT) — IFC/BIM
- Three.js + opencascade.js (MIT/LGPL) — 3D viewport, solid modeling
- Yjs + weavejs (MIT) — real-time collaboration

## Symbol Libraries (to build — competitive edge)
- ASHRAE HVAC symbols (dampers, VAVs, AHUs, chillers, boilers, cooling towers, pumps, fans, coils)
- BAS/DDC control symbols (controllers, sensors, actuators, network devices, relays)
- Piping symbols (valves, strainers, flow meters, expansion tanks, PRVs, check valves)
- Ductwork symbols (rectangular/round duct, flex, transitions, takeoffs, fire dampers)
- Electrical symbols for MEP (disconnects, VFDs, starters, panels, transformers)
- Fire protection symbols (sprinkler heads, FDC, PIV, flow switches, tamper switches)

---

## Skills

### code-supervisor-pro
Autonomous supervisory loop for AI coding sessions. Monitors Codespace output, sends prompts and fix briefs. Issues verdicts: PASS, PASS WITH NOTES, HOLD, LOST.

4-phase audit:
1. Error Scan — stderr, stack traces, failed assertions
2. Omission Scan — missing files, incomplete implementations, TODO stubs
3. Architectural Drift Check — verify against CLAUDE.md rules, stack constraints
4. Warning Scan — deprecation warnings, lint issues, performance concerns

Pre-configured stacks: codeCTRL, Vision AiQ, bas-takeoff, MD-AI, cellCTRL, designCTRL.

### system-design
System/architecture design skill. 5-phase framework:
1. Requirements Gathering — functional/non-functional requirements, constraints
2. High-Level Design — component diagram, data flow, API boundaries
3. Deep Dive — detailed design of critical components
4. Scale and Reliability — caching, load balancing, failover, monitoring
5. Trade-off Analysis — compare alternatives, document decisions

### cutting-edge-ui
Specialist in modern UI/UX including macOS Tahoe Liquid Glass, Apple Intelligence design patterns, 3D scenes (Babylon.js, Three.js), GLSL shaders, GSAP motion design, WebGPU, AR/VR interfaces.

Liquid Glass CSS approximation:
- backdrop-filter: blur(40px) saturate(180%) brightness(1.1)
- background: rgba(255,255,255,0.08) with gradient overlays
- border: 0.5px solid rgba(255,255,255,0.2)
- border-radius: 22px
- box-shadow: inset 0 0.5px 0 rgba(255,255,255,0.3), 0 8px 32px rgba(0,0,0,0.3)
- transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1)

### code-review
Structured review for:
- Security (OWASP top 10, input validation, auth)
- Performance (N+1 queries, algorithmic complexity, memory leaks, bundle size)
- Correctness (edge cases, race conditions, error handling)
- Maintainability (naming, DRY, SOLID, documentation)

Outputs structured review with severity ratings (critical/major/minor/info) and verdicts.

### canvas-engineering
Specialist in 2D CAD/engineering canvas operations:
- Fabric.js object management, custom controls, snapping, grid alignment
- SVG import/export, symbol library management
- Layer management (MEP layers: mechanical, electrical, plumbing, fire protection, controls)
- Measurement tools (linear, area, angle, scale calibration)
- Coordinate systems (world coordinates, page coordinates, viewport transforms)
- Print/export layouts (title blocks, scales, viewports)

### mep-domain
Domain knowledge for MEP engineering:
- ASHRAE standards and symbol conventions
- Equipment scheduling (AHU schedules, pump schedules, panel schedules)
- Submittal generation and tracking
- Commissioning checklists and procedures
- P&ID (piping and instrumentation diagrams)
- Control diagrams and sequences of operation
- Load calculations and sizing

