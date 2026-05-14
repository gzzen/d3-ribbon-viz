export default class NodeHoverHandler {

	constructor(overlayRenderer, ribbonRenderer) {
		this.overlayRenderer = overlayRenderer;
		this.ribbonRenderer = ribbonRenderer;
	}

	onMouseover(attr, value, selection) {
		if (this.overlayRenderer.isFrozen()) return;
		const matchingKeys = this._getMatchingRibbonKeys(attr, value, selection);
		if (matchingKeys.length === 0) {
			this.overlayRenderer.clearH();
			return;
		}
		this.overlayRenderer.applyHMultiple(matchingKeys);
	}

	onMouseout() {
		if (this.overlayRenderer.isFrozen()) return;
		this.overlayRenderer.clearH();
	}

	// Returns ribbon keys whose full path satisfies the hovered node plus all
	// currently selected nodes (OR within axis, AND across axes).
	_getMatchingRibbonKeys(attr, value, selection) {
		const matchingKeys = [];

		const requiredByAxis = { [attr]: new Set([value]) };
		for (const selAttr in selection) {
			if (!requiredByAxis[selAttr]) requiredByAxis[selAttr] = new Set();
			for (const selValue of selection[selAttr]) requiredByAxis[selAttr].add(selValue);
		}

		this.ribbonRenderer.ribbonGroup
			.selectAll('path.ribbon')
			.each(function (d) {
				const ribbonValues = {};
				for (const segment of d.key.split('||')) {
					const colonIdx = segment.indexOf(':');
					ribbonValues[segment.slice(0, colonIdx)] = segment.slice(colonIdx + 1);
				}
				for (const reqAttr in requiredByAxis) {
					if (!requiredByAxis[reqAttr].has(ribbonValues[reqAttr])) return;
				}
				matchingKeys.push(d.key);
			});

		return matchingKeys;
	}

}
