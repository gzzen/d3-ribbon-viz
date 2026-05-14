# Interaction model

Three modes of interaction operate independently but layer on top of each other: **hover**, **selection** (click), and **freeze**.

---

## Hover

### Node hover

Hovering over a node temporarily highlights all ribbons whose path passes through that node (AND any currently selected nodes on other axes — see [selection](#selection) below). All other ribbons are dimmed. The highlight clears as soon as the mouse leaves.

If the view is currently frozen, node hover has no effect.

### Ribbon hover

Hovering over a ribbon shows a tooltip listing all attribute-value pairs in that ribbon's path and the number of samples that travel that exact route. The ribbon and its ancestors/descendants along the same path are highlighted.

If the view is frozen, tooltip is shown only for ribbons that are related to the frozen path.

---

## Selection

Clicking a node **toggles** it in or out of the selection:

- **First click on a node** — adds `attr:value` to the selection. Ribbons matching all selected constraints are highlighted and frozen (see below).
- **Click the same node again** — removes it from the selection. If the selection becomes empty the freeze is released.
- **Click a different node on the same axis** — adds a second value on that axis (OR logic: ribbons passing through either value qualify).
- **Click a node on a different axis** — adds a constraint on that axis (AND logic: ribbons must satisfy all axes).

### OR within axis, AND across axes

A ribbon is considered matching if, for every axis that has at least one selected value, the ribbon passes through at least one of those values.

Example:

| Selection | Matching ribbons |
|-----------|-----------------|
| `studytime: {2}` | All ribbons passing through studytime = 2 |
| `studytime: {2, 3}` | All ribbons passing through studytime = 2 OR 3 |
| `studytime: {2}, failures: {0}` | Ribbons through studytime = 2 AND failures = 0 |

### Visual feedback on nodes

When any selection is active, nodes that are NOT selected on a given axis are colour-interpolated toward grey (`node.dimmedGreyAmount`). Selected nodes keep their full colour and gain a white stroke.

---

## Freeze

Clicking a **ribbon** freezes that ribbon's entire path. While frozen:

- Hovering over unrelated ribbons has no visual effect.
- Hovering over a related ribbon (ancestor or descendant path) shows its tooltip.
- Clicking the ribbon again (or the same ribbon) **unfreezes** the view.

A **node click** also produces a freeze — the ribbons matching the current selection are pinned until the selection changes or the background is clicked.

### Related ribbons

Two ribbons are "related" when one's path key is a prefix of the other's, or they are equal. Because each ribbon's key encodes the full left-to-right path from axis 0 to its right axis, a ribbon spanning axes 0–1 with key `study:2||fail:0` is an ancestor of a ribbon spanning 0–2 with key `study:2||fail:0||grade:A`. Highlighting one highlights both.

---

## Clearing state

Clicking the SVG background resets everything: selection is cleared, freeze is released, and all ribbons return to their base opacity.

---

## State machine summary

```
idle
 ├─ node hover   → highlight related ribbons (temporary)
 ├─ ribbon hover → tooltip + highlight path (temporary)
 ├─ node click   → selection toggle + freeze matching ribbons
 ├─ ribbon click → freeze single path
 └─ bg click     → (no-op, already idle)

frozen (node selection or ribbon click)
 ├─ node hover   → (ignored)
 ├─ ribbon hover → tooltip only for related ribbons
 ├─ node click   → update selection + refreeze
 ├─ ribbon click → unfreeze
 └─ bg click     → unfreeze + clear selection
```

---

## Implementation

All mutable interaction state lives in [`src/interaction/state.js`](../src/interaction/state.js) (`InteractionState`). The `OverlayRenderer` in [`src/interaction/overlay.js`](../src/interaction/overlay.js) applies visual changes but holds no state of its own. This separation means the logic can be unit-tested without a DOM.

See the [architecture doc](architecture.md) for how the handlers wire these together.
