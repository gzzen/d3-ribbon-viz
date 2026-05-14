# Configuration

All constants live in [`src/config.js`](../src/config.js) as named exports. No value is hard-coded anywhere else.

---

## `data`

Controls the data source and which attributes are displayed by default.

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `csvPath` | `string` | `'data/student-por-processed.csv'` | Path to the dataset CSV, relative to the page URL |
| `defaultAttrs` | `string[]` | `['studytime', 'failures', 'absences_levels', 'schoolsup', 'paid']` | Axes shown on initial load (left to right, excluding the final attribute) |
| `targetAttr` | `string` | `'final_grade_levels'` | Rightmost axis — always appended after `defaultAttrs` |

---

## `viewport`

Controls the SVG coordinate system and its CSS framing. The design width is computed as `window.innerWidth - rightPad - sidebarWidth`; the SVG then scales to fill the available space via `viewBox` + CSS width.

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `rightPad` | `number` | `30` | Pixels subtracted from `window.innerWidth` on the right |
| `sidebarWidth` | `number` | `160` | Pixels reserved for the left sidebar / navigation |
| `height` | `number` | `550` | SVG coordinate height (viewBox units) |
| `svgWidthStyle` | `string` | `'calc(100% - 150px)'` | CSS `width` applied to the `<svg>` element |
| `svgMarginLeft` | `string` | `'150px'` | CSS `margin-left` applied to the `<svg>` element |

---

## `axis`

Geometry of the axis layout within the SVG coordinate space.

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `marginLeft` | `number` | `80` | Distance from the left SVG edge to the first axis |
| `marginRight` | `number` | `80` | Distance from the right SVG edge to the last axis |
| `marginTop` | `number` | `25` | Space above the axis column area (for labels) |
| `marginBottom` | `number` | `120` | Space below the axis column area (for the legend) |
| `paddingInner` | `number` | `30` | Additional inset at the top and bottom of each axis column |
| `nodePadding` | `number` | `0` | Gap in pixels between adjacent node rectangles on an axis |

The drawable axis height is derived: `(height - marginBottom - paddingInner) - (marginTop + paddingInner)`.

---

## `node`

Visual constants for axis node rectangles.

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `width` | `number` | `20` | Default node width in SVG units |
| `widthHovered` | `number` | `30` | Expanded node width during hover |
| `dimmedGrey` | `string` | `'#ffffff'` | Target colour for interpolation when a node is dimmed |
| `dimmedGreyAmount` | `number` | `0.6` | Interpolation factor toward `dimmedGrey` (0 = original, 1 = full grey) |
| `selectedStroke` | `string` | `'#ffffff'` | Stroke colour on selected nodes |
| `selectedStrokeWidth` | `number` | `2` | Stroke width on selected nodes |
| `hoverTransitionMs` | `number` | `120` | Duration of the width scale animation in milliseconds |
| `hoverFilterId` | `string` | `'pc-node-hover-shadow'` | SVG filter ID for the drop-shadow applied on hover |

---

## `ribbon`

Base rendering opacities for ribbon paths (before any overlay is applied).

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `baseOpacity` | `number` | `0.5` | Opacity of ribbons that match the current selection |
| `dimmedOpacity` | `number` | `0.05` | Opacity of ribbons that do not match the current selection |

---

## `overlay`

Visual constants applied by the overlay renderer during hover and freeze.

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `greyColor` | `string` | `'#aaaaaa'` | Fill colour for non-highlighted ribbons |
| `highlightOpacity` | `number` | `0.7` | Opacity of highlighted (related) ribbons |
| `dimmedOpacity` | `number` | `0.15` | Opacity of non-highlighted ribbons during overlay |
| `baseOpacity` | `number` | `0.5` | Opacity restored when the overlay is cleared |

---

## `legend`

Layout and typography for the legend panel at the bottom of the SVG.

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `y` | `number` | `20` | Vertical offset from the bottom of the SVG |
| `panelPadding` | `number` | `10` | Inner padding of the legend background rect |
| `attrLabelFontSize` | `number` | `10` | Font size for the attribute name heading |
| `attrLabelColor` | `string` | `'#444'` | Colour for the attribute name heading |
| `attrLabelWrapWidth` | `number` | `20` | Max characters per line before wrapping the attribute label |
| `columnGap` | `number` | `10` | Horizontal gap between attribute columns |
| `columnWidth` | `number` | `100` | Width reserved per attribute column |
| `labelContentPadding` | `number` | `25` | Gap between the attribute heading and the swatches/bar below it |
| `swatchSize` | `number` | `9` | Width and height of each colour swatch square |
| `swatchGap` | `number` | `3` | Vertical gap between swatches |
| `swatchLabelGap` | `number` | `6` | Gap between a swatch and its text label |
| `swatchFontSize` | `number` | `10` | Font size for swatch labels |
| `swatchLabelColor` | `string` | `'#222'` | Colour for swatch labels |
| `gradientBarWidth` | `number` | `12` | Width of the gradient bar for numeric attributes |
| `gradientBarHeight` | `number` | `40` | Height of the gradient bar |
| `gradientLabelGap` | `number` | `6` | Gap between the gradient bar and its min/max labels |
| `gradientLabelOffset` | `number` | `3` | Vertical inset of min/max label from bar edge |
| `gradientLabelFontSize` | `number` | `9` | Font size for gradient min/max labels |
| `gradientLabelColor` | `string` | `'#222'` | Colour for gradient labels |
