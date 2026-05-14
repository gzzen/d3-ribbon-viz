import { isRelated } from '../ribbon/keys.js';

/**
 * Centralised interaction state for the parallel coordinates view.
 *
 * Owns two independent concerns:
 *   - Node selection  { attr → Set<value> }, OR within axis, AND across axes
 *   - Ribbon freeze   which ribbon keys are pinned on screen
 *
 * Emits a 'change' event after any mutation so subscribers can re-render
 * without each mutator needing to know its downstream effects.
 */
export default class InteractionState {

	constructor() {
		this._selection = {};     // { attr: Set<value> }
		this._frozenKeys = [];    // string[] — always an array, even for single-key freezes
		this._isFrozen = false;
		this._listeners = {};
	}


	// ── Selection ─────────────────────────────────────────────────────────────

	/** Toggle an attr-value pair in/out of the selection. */
	toggle(attr, value) {
		if (!this._selection[attr]) this._selection[attr] = new Set();

		if (this._selection[attr].has(value)) {
			this._selection[attr].delete(value);
			if (this._selection[attr].size === 0) delete this._selection[attr];
		} else {
			this._selection[attr].add(value);
		}

		this._emit('change');
	}

	/** Clear all selected nodes. */
	clear() {
		this._selection = {};
		this._emit('change');
	}

	getSelection() { return this._selection; }

	hasSelection() {
		return Object.values(this._selection).some(s => s.size > 0);
	}

	isSelected(attr, value) {
		return !!(this._selection[attr]?.has(value));
	}


	// ── Freeze ────────────────────────────────────────────────────────────────

	/** Pin the given ribbon keys on screen until unfrozen. */
	freeze(keys) {
		this._isFrozen = true;
		this._frozenKeys = keys;
		this._emit('change');
	}

	/** Release the frozen state. */
	unfreeze() {
		this._isFrozen = false;
		this._frozenKeys = [];
		this._emit('change');
	}

	/** Clear selection AND freeze in one operation, emitting a single 'change'. */
	reset() {
		this._selection = {};
		this._isFrozen = false;
		this._frozenKeys = [];
		this._emit('change');
	}

	isFrozen() { return this._isFrozen; }

	/** True if ribbonKey is a ancestor, self, or descendant of any frozen key. */
	isFrozenRelated(ribbonKey) {
		if (!this._isFrozen) return false;
		return this._frozenKeys.some(k => isRelated(ribbonKey, k));
	}

	getFrozenKeys() { return this._frozenKeys; }


	// ── Events ────────────────────────────────────────────────────────────────

	on(event, cb) {
		if (!this._listeners[event]) this._listeners[event] = [];
		this._listeners[event].push(cb);
	}

	off(event, cb) {
		if (!this._listeners[event]) return;
		this._listeners[event] = this._listeners[event].filter(l => l !== cb);
	}

	/** Snapshot of all state — useful for assertions in tests. */
	getState() {
		return {
			selection: this._selection,
			frozenKeys: this._frozenKeys,
			isFrozen: this._isFrozen,
		};
	}

	_emit(event) {
		for (const cb of this._listeners[event] ?? []) cb();
	}

}
