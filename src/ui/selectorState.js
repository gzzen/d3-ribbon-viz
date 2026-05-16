/** Maximum number of simultaneously active attributes. */
export const MAX_ACTIVE = 5;

/**
 * State for the attribute selector strip.
 *
 * Active attributes are user-ordered; inactive attributes always appear in
 * their original dataset order. At least one attribute must remain active at
 * all times so the visualization is never empty.
 */
export default class SelectorState {

	constructor(allAttrs, initialActive) {
		this._allAttrs = allAttrs;
		this._active = initialActive
			.filter(a => allAttrs.includes(a))
			.slice(0, MAX_ACTIVE);
		// guarantee at least one active attr if possible
		if (this._active.length === 0 && allAttrs.length > 0) {
			this._active = [allAttrs[0]];
		}
		this._listeners = [];
	}


	// ── Mutations ─────────────────────────────────────────────────────────────

	/** Move an inactive attribute to the end of the active list. No-op if already active or list is full. */
	activate(attr) {
		if (this._active.includes(attr)) return;
		if (this._active.length >= MAX_ACTIVE) return;
		this._active = [...this._active, attr];
		this._emit();
	}

	/** Move an active attribute to the inactive group. No-op if not active or it is the last active attribute. */
	deactivate(attr) {
		if (!this._active.includes(attr)) return;
		if (this._active.length === 1) return;
		this._active = this._active.filter(a => a !== attr);
		this._emit();
	}

	/** Toggle active/inactive. */
	toggle(attr) {
		if (this._active.includes(attr)) this.deactivate(attr);
		else this.activate(attr);
	}

	/**
	 * Move an active attribute from one position to another.
	 * Both indices are zero-based positions within the active list.
	 */
	reorder(fromIdx, toIdx) {
		if (fromIdx === toIdx) return;
		if (fromIdx < 0 || fromIdx >= this._active.length) return;
		if (toIdx < 0 || toIdx >= this._active.length) return;
		const next = [...this._active];
		const [item] = next.splice(fromIdx, 1);
		next.splice(toIdx, 0, item);
		this._active = next;
		this._emit();
	}


	// ── Queries ───────────────────────────────────────────────────────────────

	getActive()   { return [...this._active]; }

	/** Inactive attributes in original dataset order. */
	getInactive() { return this._allAttrs.filter(a => !this._active.includes(a)); }

	isActive(attr) { return this._active.includes(attr); }

	/** True when the active list is at MAX_ACTIVE capacity. */
	isFull() { return this._active.length >= MAX_ACTIVE; }

	/** True when the active list is at its minimum (1) and cannot shrink further. */
	isMinimal() { return this._active.length === 1; }


	// ── Events ────────────────────────────────────────────────────────────────

	on(cb)  { this._listeners.push(cb); }
	off(cb) { this._listeners = this._listeners.filter(l => l !== cb); }

	_emit() { this._listeners.forEach(cb => cb()); }

}
