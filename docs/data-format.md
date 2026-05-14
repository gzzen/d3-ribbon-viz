# Data format

## CSV

The dataset is a standard CSV where each row is one sample (student). One column must serve as a unique identifier; by default the loader reads the column named `id`.

```
id, attr1, attr2, ..., attrN
1,  val,   val,   ..., val
```

The `id` column is stripped from visualized attributes — it is only used internally as `sampleID`.

**Current file:** `data/student-por-processed.csv`  
649 rows, 35 columns. Relevant attributes for the default view: `studytime`, `failures`, `absences_levels`, `schoolsup`, `paid`, `final_grade_levels`.

---

## label.json

Every attribute that can appear on an axis must have an entry in `data/label.json`. The schema has three attribute types.

### Categorical

Values are unordered named categories. The scale array determines the order in which values appear on the axis (top to bottom, reversed — so the last entry sits at the top).

```json
"schoolsup": {
  "type": "categorical",
  "label": "Extra educational support",
  "scale": [
    { "value": "yes", "label": "Yes" },
    { "value": "no",  "label": "No"  }
  ]
}
```

### Ordinal

Same structure as categorical, but the order in the scale array is meaningful (low to high). The renderer uses a sequential color scale (Blues) instead of the categorical Tableau10 palette.

```json
"studytime": {
  "type": "ordinal",
  "label": "Weekly study time",
  "scale": [
    { "value": "1", "label": "< 2 hrs" },
    { "value": "2", "label": "2–5 hrs" },
    { "value": "3", "label": "5–10 hrs" },
    { "value": "4", "label": "> 10 hrs" }
  ]
}
```

### Numeric

Integer range. The renderer samples the range evenly for the gradient legend and uses a YlOrRd color scale.

```json
"failures": {
  "type": "numeric",
  "label": "Number of past class failures",
  "scale": { "min": 0, "max": 4 }
}
```

> The `unit` field (e.g. `"unit": "years"`) is accepted but not currently rendered.

---

## Attribute types in the visualization

| Type | Color scale | Legend |
|------|-------------|--------|
| `categorical` | Tableau10 (distinguishable hues) | Color swatches |
| `ordinal` | Blues sequential | Color swatches |
| `numeric` | YlOrRd sequential | Gradient bar with min/max labels |

---

## Adapting to a new dataset

1. **Replace the CSV** — place it in `data/` and update `data.csvPath` in [`src/config.js`](../src/config.js).

2. **Write a label.json** — add an entry for each attribute you want to visualize. Attributes not listed here will cause a runtime error if selected.

3. **Update config** — set `data.defaultAttrs` to your desired axis attributes and `data.finalAttr` to the rightmost (outcome) attribute.

4. **Ensure an ID column** — either add an `id` column or change the `idColumn` argument in the `loadCSV` call inside `src/view.js`.

### Adding a single new attribute

1. Add the column to your CSV.
2. Add an entry in `label.json` with the correct `type` and `scale`.
3. Optionally add the attribute name to `data.defaultAttrs` in `src/config.js` to show it by default.

No code changes are needed beyond those two files.
