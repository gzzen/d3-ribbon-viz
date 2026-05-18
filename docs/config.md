# Configuration

All constants live in [`src/config.js`](../src/config.js) as named exports. No value is hard-coded anywhere else.

---

## `data`

Controls the data source and which attributes are displayed by default.

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `csvPath` | `string` | `'data/student-por-processed.csv'` | Path to the dataset CSV, relative to the page URL |
| `defaultAttrs` | `string[]` | `['studytime', 'failures', 'schoolsup', 'paid']` | Axes shown on initial load (left to right, excluding the final attribute) |
| `targetAttr` | `string` | `'final_grade_levels'` | Rightmost axis — always appended after `defaultAttrs` |

---

## `viewport`

Controls the SVG coordinate system and its CSS framing. The design width is computed as `window.innerWidth × (1 - rightPadFraction - sidebarFraction)`; the design height as `window.innerHeight × heightFraction`. `svgWidthStyle` and `svgMarginLeft` are derived getters that mirror `sidebarFraction` so CSS framing and the coordinate space stay in sync.

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `rightPadFraction` | `number` | `0.1` | Fraction of `window.innerWidth` reserved as right whitespace |
| `sidebarFraction` | `number` | `0.11` | Fraction of `window.innerWidth` reserved for the left sidebar |
| `heightFraction` | `number` | `0.50` | Fraction of `window.innerHeight` used for the SVG coordinate height |
| `svgWidthStyle` | `string` *(getter)* | `'calc(100% - 11vw)'` | CSS `width` applied to the `<svg>` element; derived from `sidebarFraction` |
| `svgMarginLeft` | `string` *(getter)* | `'11vw'` | CSS `margin-left` applied to the `<svg>` element; derived from `sidebarFraction` |

---

## `axis`

Geometry of the axis layout. All `Fraction` keys are multiplied by the SVG coordinate dimension at render time to produce absolute units.

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `marginLeftFraction` | `number` | `0.065` | Left margin as fraction of SVG width |
| `marginRightFraction` | `number` | `0.065` | Right margin as fraction of SVG width |
| `marginTopFraction` | `number` | `0.35` | Top margin as fraction of SVG height (reserves space for the legend at the top) |
| `marginBottomFraction` | `number` | `0.05` | Bottom margin as fraction of SVG height |
| `paddingInnerFraction` | `number` | `0` | Additional inset at the top and bottom of each axis column, as fraction of SVG height |
| `nodePadding` | `number` | `0` | Gap in SVG coordinate units between adjacent node rectangles on an axis |

The drawable axis height is derived: `viewHeight × (1 - marginTopFraction - marginBottomFraction - 2 × paddingInnerFraction)`.

---

## `node`

Visual constants for axis node rectangles.

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `width` | `number` | `50` | Default node width in SVG units |
| `widthHovered` | `number` | `55` | Expanded node width during hover |
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
| `columnGap` | `number` | `15` | Horizontal gap between attribute columns |
| `columnWidth` | `number` | `100` | Width reserved per attribute column |
| `labelContentPadding` | `number` | `30` | Gap between the attribute heading and the swatches/bar below it |
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
