export default class NodeClickHandler {

	constructor(selectionManager, overlayRenderer, hoverHandler) {
		this.selectionManager = selectionManager;
		this.overlayRenderer = overlayRenderer;
		this.hoverHandler = hoverHandler;
	}

	onClick(attr, value) {
		this.selectionManager.toggle(attr, value);
		const selection = this.selectionManager.getSelection();

		if (!this.selectionManager.hasSelection()) {
			this.overlayRenderer.unfreeze();
			return;
		}

		const matchingKeys = this._getMatchingRibbonKeys(selection);
		if (matchingKeys.length === 0) {
			this.overlayRenderer.unfreeze();
			return;
		}

		this.overlayRenderer.applyHMultiple(matchingKeys);
		this.overlayRenderer.freezeMultiple(matchingKeys);
	}

	// Returns ribbon keys whose full path satisfies all selected nodes
	// (OR within axis, AND across axes).
	_getMatchingRibbonKeys(selection) {
		const matchingKeys = [];

		this.hoverHandler.ribbonRenderer.ribbonGroup
			.selectAll('path.ribbon')
			.each(function (d) {
				const ribbonValues = {};
				for (const segment of d.key.split('||')) {
					const colonIdx = segment.indexOf(':');
					ribbonValues[segment.slice(0, colonIdx)] = segment.slice(colonIdx + 1);
				}
				for (const selAttr in selection) {
					if (!selection[selAttr].has(ribbonValues[selAttr])) return;
				}
				matchingKeys.push(d.key);
			});

		return matchingKeys;
	}

}
