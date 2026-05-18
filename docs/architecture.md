# Architecture

## Data flow

```
data/label.json ──── metadata.init() ─────────────────────────────────┐
                                                                       ↓
data/*.csv ────────── loadCSV() ──→ DataProcessor ──computeNodeFrequencies()──→ computeLayouts()
                                                                                       │
                                                                                       ↓
                                             ┌──── AxisRenderer.render(layouts)
                                             ├──── NodeRenderer.init(layouts)   ──→ D3 SVG
                                             ├──── RibbonRenderer.init(colorScales, layouts)
                                             └──── Legend.init(layouts)

                         User events ──→ handlers/ ──→ InteractionState
                                                              │
                                          ┌───────────────────┤
                                          ↓                   ↓
                                   OverlayRenderer    NodeRenderer.update()
                                   (SVG highlight)    (node color/stroke)
```

---

## Module responsibilities

### Data layer

| Module | Responsibility |
|--------|---------------|
| `utils/metadata.js` | Loads `label.json` once via `init()`. All attribute lookups (label, type, categories, numeric range) go through this module. Must be called before any rendering. |
| `model/DataLoader.js` | Fetches a CSV and injects a `sampleID` field onto every row. |
| `model/DataProcessor.js` | Wraps the sample array. Provides `computeNodeFrequencies(attr)` and `filterSamples(selection)`. |

### Geometry

| Module | Responsibility |
|--------|---------------|
| `layout.js` | Pure function `computeLayouts(attrs, freqMap, viewWidth, viewHeight) → { layouts, axisHeight, axisTop, axisBottom, labelY }`. No DOM, no D3. Takes explicit viewport dimensions so it can be tested without `window`. |
| `ribbon/compute.js` | Pure function `computeAllRibbons(layouts, samples, colorFn) → RibbonData[]`. Implements the stacking algorithm; `colorFn` is injected so the algorithm contains no D3. |
| `ribbon/keys.js` | Key encoding, parsing, and matching. The string format `"attr:val||attr:val"` is the only representation of a ribbon's full axis path — all logic that touches keys lives here. |

### Rendering

All four renderers take pre-computed data and write to the SVG. None of them own state or trigger re-computation.

| Module | Input | Output |
|--------|-------|--------|
| `render/axes.js` | `AxisLayout[]` | Axis lines |
| `render/nodes.js` | `AxisLayout[]`, selection | Coloured node rectangles |
| `render/ribbons.js` | `AxisLayout[]`, color scales | Bezier ribbon paths |
| `render/legend.js` | `AxisLayout[]` | Legend panel (swatches / gradient bars) |

### UI

| Module | Responsibility |
|--------|---------------|
| `ui/selectorState.js` | Manages the ordered list of active attributes (max `MAX_ACTIVE = 5`). Exposes `toggle`, `activate`, `deactivate`, `reorder`. Emits via `on`/`off`. No DOM access. |
| `ui/attributeSelector.js` | Renders the active-attribute row (absolutely positioned boxes aligned to axis x-coordinates) and the collapsible inactive-attribute dropdown. Reacts to `SelectorState` changes and syncs box positions after each render via `syncToLayouts`. Supports drag-and-drop reordering. |

### Interaction

| Module | Responsibility |
|--------|---------------|
| `interaction/state.js` | Single source of truth for selection and freeze. Emits `'change'` on mutation. No DOM access. |
| `interaction/overlay.js` | Reads `ribbonRenderer.ribbonGroup` and writes fill/opacity. Pure side-effects; no state. |
| `interaction/tooltip.js` | Manages the floating `div.pc-tooltip`. Also exports `buildTooltipContent` which parses a ribbon key and counts matching samples. |
| `handlers/node.js` | Hover highlights via `matchingKeys`; click toggles selection and freezes. |
| `handlers/ribbon.js` | Hover shows tooltip; click toggles single-ribbon freeze. |
| `handlers/background.js` | Fires registered callbacks when the SVG background is clicked. |

---

## Key boundaries

**`layout.js` and `ribbon/compute.js` are pure.** They take all inputs as arguments and return plain data objects. This is what makes them unit-testable without a DOM or D3.

**`interaction/state.js` owns all mutable state.** `OverlayRenderer` applies visual changes but holds no state. The handlers mutate state and call overlay for visual side-effects — they never bypass state.

**`ribbon/keys.js` is the single definition of the key format.** The string `"attr:val||attr:val"` is parsed and compared in exactly one place. `parseKey` / `isRelated` / `matchingKeys` are used by overlay, tooltip, and both node handlers.

---

## Rendering cycle

`ParallelCoordsView.render()` is the only entry point that kicks off a full re-render:

1. Build `freqMap` from `DataProcessor`
2. `computeLayouts(attrs, freqMap, viewWidth, viewHeight)` — pure, no side effects
3. `axisRenderer.render(layouts)` — SVG axes
4. `legend.init/update(layouts)` — SVG legend
5. `nodeRenderer.init(layouts)` — builds color scales, renders nodes
6. `ribbonRenderer.init(colorScales, layouts, axisHeight)` — runs stacking algorithm, renders ribbons

Between full renders, `InteractionState` changes trigger only `nodeRenderer.update(selection)` — a lightweight pass that re-applies fill/stroke to existing nodes.

---

## Dependency graph (abbreviated)

```
view.js
  ├─ model/DataLoader.js
  ├─ model/DataProcessor.js
  ├─ utils/metadata.js
  ├─ config.js
  ├─ layout.js ──────────────── utils.js, config.js
  ├─ render/axes.js ──────────── utils/metadata.js, utils.js, config.js
  ├─ render/nodes.js ─────────── utils/metadata.js, colors.js, utils.js, config.js
  ├─ render/ribbons.js ────────── ribbon/compute.js, ribbon/keys.js, utils.js, config.js
  ├─ render/legend.js ─────────── utils/metadata.js, colors.js, utils.js, config.js
  ├─ ribbon/compute.js ────────── utils.js, layout.js
  ├─ ribbon/keys.js               (no internal deps)
  ├─ interaction/state.js ─────── ribbon/keys.js
  ├─ interaction/overlay.js ────── config.js, ribbon/keys.js
  ├─ interaction/tooltip.js ────── ribbon/keys.js
  ├─ handlers/node.js ─────────── ribbon/keys.js
  ├─ handlers/ribbon.js ────────── interaction/tooltip.js
  ├─ handlers/background.js       (no internal deps)
  ├─ ui/selectorState.js          (no internal deps)
  └─ ui/attributeSelector.js ──── ui/selectorState.js
```
