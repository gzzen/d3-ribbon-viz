# Ribbon Parallel Coordinates Visualization

[Live demo here.](https://gzzen.github.io/d3-ribbon-viz/)

This is a parallel coordinates visualization that traces pathways between attributes and target variable using color-pathway diagram. This particular instance uses the [student performance dataset](https://archive.ics.uci.edu/dataset/320/student+performance).

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

## Documentation

| Topic | Description |
|-------|-------------|
| [Architecture](architecture.md) | Module map, data flow, dependency boundaries |
| [Data format](data-format.md) | CSV and label.json schema; adapting to a new dataset |
| [Configuration](config.md) | All config options with types and defaults |
| [Interaction model](interaction.md) | How hover, selection, and freeze work |
| [Testing](testing.md) | Test suite structure and how to run it |
