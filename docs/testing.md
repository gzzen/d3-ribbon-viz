# Testing

## Running the tests

```bash
npm test          # single pass
npx vitest        # watch mode (re-runs on file save)
npx vitest run test/ribbon/keys.test.js   # single file
```

The test framework is [Vitest](https://vitest.dev/). All test files are ES modules; no transpilation is needed.

---

## Test files

| File | Module under test | What it covers |
|------|-------------------|----------------|
| `test/config.test.js` | `src/config.js` | Shape validation: required keys present, types correct, invariants (e.g. `widthHovered > width`, `dimmedOpacity < baseOpacity`) |
| `test/layout.test.js` | `src/layout.js` | `AXIS_HEIGHT` value, axis x-positions (first, last, even spacing), node height proportionality, y-position stacking |
| `test/ribbon/keys.test.js` | `src/ribbon/keys.js` | `parseKey` / `buildKey` round-trip, `isRelated` (equal / ancestor / descendant / unrelated / partial-text false match), `matchingKeys` (OR within axis, AND across axes, absent axis) |
| `test/ribbon/compute.test.js` | `src/ribbon/compute.js` | Edge cases (empty layouts, empty samples), ribbon heights, stacking without gaps, `colorFn` call arguments, full-path key encoding across 3 axes |
| `test/interaction/state.test.js` | `src/interaction/state.js` | Initial state, toggle add/remove, multi-value OR, multi-attr AND, clear, freeze/unfreeze, `isFrozenRelated` (exact / ancestor / descendant / unrelated), `reset()` single-event guarantee, `on`/`off` event system |
| `test/utils/metadata.test.js` | `src/utils/metadata.js` | `init()` fetches URL, throws before init, all five lookup functions after init |
| `test/model/DataLoader.test.js` | `src/model/DataLoader.js` | CSV loading, ID injection, `idColumn` and `generateId` strategies |
| `test/model/DataProcessor.test.js` | `src/model/DataProcessor.js` | Node frequency computation, joint frequency computation, sample filtering with AND/OR selection logic |
| `test/ui/selectorState.test.js` | `src/ui/selectorState.js` | Initial state, toggle/activate/deactivate, MAX_ACTIVE cap, reorder, at-least-one invariant, `isFull`/`isMinimal`, `on`/`off` event system |

---

## Testing approach

### What is tested

All **pure logic** modules have unit tests: geometry computation (`layout.js`, `ribbon/compute.js`), key parsing and matching (`ribbon/keys.js`), interaction state transitions (`state.js`), and data loading/processing.

Tests are intentionally written without DOM or D3. Where D3 would normally be called (e.g. `colorFn` in `computeAllRibbons`), a plain function mock is injected instead. This keeps the suite fast and runnable in Node without a browser.

### What is not tested

The four **renderers** (`axes.js`, `nodes.js`, `ribbons.js`, `legend.js`) and the **overlay** are not unit-tested because they are thin wrappers around D3 selection calls — the logic they implement is minimal and visual correctness requires browser rendering. The untested surface area is small by design: each renderer does one thing (binds data to SVG elements) and delegates all computation to a pure module that is tested.

---

## Writing new tests

The existing tests are good templates. A few conventions to follow:

- **No global setup needed** for pure modules — just import and call.
- **For `metadata.js`**, call `_reset()` in `beforeEach` to clear module-level state between tests, then mock `global.fetch`.
- **For `DataProcessor.js`**, use `vi.mock('../../src/utils/metadata.js', ...)` to stub the attribute type lookups.
- **Match the file structure** — tests for `src/foo/bar.js` go in `test/foo/bar.test.js`.
