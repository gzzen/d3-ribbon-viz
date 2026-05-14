# ribbon-visualization

A parallel coordinates visualization that traces pathways between student characteristics and final grade using ribbon diagrams.

Each vertical axis represents one attribute. Ribbons connect adjacent axes, stacking proportionally to how many students share that combination of values. Clicking a node selects it and freezes the ribbons matching the current selection; clicking again or clicking the background clears everything.

---

## Running

The app is a static ES-module page. Serve the project root with any HTTP server:

```bash
# Python
python3 -m http.server 8080

# Node
npx serve .
```

Then open `http://localhost:8080`.

---

## Project structure

```
src/
  view.js               Entry point — bootstraps the entire visualization
  config.js             All hard-coded constants in one place
  layout.js             Pure axis/node geometry computation
  colors.js             Color scale builders (numeric, ordinal, categorical)
  utils.js              Shared data classes and helper functions
  utils/
    metadata.js         Dataset metadata loader (label.json)
  model/
    DataLoader.js       CSV loading with ID injection
    DataProcessor.js    Frequency computation and sample filtering
  render/
    axes.js             SVG axis lines and labels
    nodes.js            SVG node rectangles
    ribbons.js          SVG ribbon paths
    legend.js           SVG legend panel
  ribbon/
    keys.js             Ribbon key encoding, parsing, and matching
    compute.js          Ribbon stacking algorithm
  interaction/
    state.js            Centralized selection + freeze state
    overlay.js          SVG highlight / dim rendering
    tooltip.js          Tooltip display and content building
    handlers/
      node.js           Node hover and click logic
      ribbon.js         Ribbon hover and click logic
      background.js     Background click handler

data/
  student-por-processed.csv    Source dataset
  label.json                   Attribute metadata

test/
  config.test.js
  layout.test.js
  model/       utils/       ribbon/       interaction/
```

---

## Documentation

| Topic | Description |
|-------|-------------|
| [Architecture](architecture.md) | Module map, data flow, dependency boundaries |
| [Data format](data-format.md) | CSV and label.json schema; adapting to a new dataset |
| [Configuration](config.md) | All config options with types and defaults |
| [Interaction model](interaction.md) | How hover, selection, and freeze work |
| [Testing](testing.md) | Test suite structure and how to run it |
