import { matchingKeys } from '../../ribbon/keys.js';

/**
 * Handles both hover and click interactions on axis nodes.
 *
 * Hover: highlights ribbons passing through the hovered node (AND any
 *   currently selected nodes across other axes).
 * Click: toggles node selection, then freezes the matching ribbon highlight.
 */
export default class NodeHandlers {

	constructor(state, overlayRenderer, ribbonRenderer) {
		this.state = state;
		this.overlayRenderer = overlayRenderer;
		this.ribbonRenderer = ribbonRenderer;
	}


	// ── Hover ─────────────────────────────────────────────────────────────────

	onMouseover(attr, value, selection) {
		if (this.state.isFrozen()) return;
		const constraints = this._mergeHoverIntoSelection(attr, value, selection);
		const keys = matchingKeys(this._allRibbonKeys(), constraints);
		if (keys.length === 0) {
			this.overlayRenderer.clearH();
			return;
		}
		this.overlayRenderer.applyHMultiple(keys);
	}

	onMouseout() {
		if (this.state.isFrozen()) return;
		this.overlayRenderer.clearH();
	}


	// ── Click ─────────────────────────────────────────────────────────────────

	onClick(attr, value) {
		this.state.toggle(attr, value);
		const selection = this.state.getSelection();

		if (!this.state.hasSelection()) {
			this.state.unfreeze();
			this.overlayRenderer.clearH();
			return;
		}

		const keys = matchingKeys(this._allRibbonKeys(), selection);
		if (keys.length === 0) {
			this.state.unfreeze();
			this.overlayRenderer.clearH();
			return;
		}

		this.overlayRenderer.applyHMultiple(keys);
		this.state.freeze(keys);
	}


	// ── Helpers ───────────────────────────────────────────────────────────────

	_allRibbonKeys() {
		const keys = [];
		this.ribbonRenderer.ribbonGroup.selectAll('path.ribbon').each(d => keys.push(d.key));
		return keys;
	}

	// Adds the hovered node's constraint to the current selection so hover
	// highlights respect AND-across-axes logic with any active selections.
	_mergeHoverIntoSelection(attr, value, selection) {
		const constraints = { [attr]: new Set([value]) };
		for (const selAttr in selection) {
			if (!constraints[selAttr]) constraints[selAttr] = new Set();
			for (const v of selection[selAttr]) constraints[selAttr].add(v);
		}
		return constraints;
	}

}
