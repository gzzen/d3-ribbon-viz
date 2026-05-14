import { buildTooltipContent } from '../tooltip.js';

export class RibbonHoverHandler {

	constructor(overlayRenderer, tooltip, dataProcessor) {
		this.overlayRenderer = overlayRenderer;
		this.tooltip = tooltip;
		this.dataProcessor = dataProcessor;
	}

	onMouseover(d, event) {
		if (this.overlayRenderer.isFrozen()) {
			if (this.overlayRenderer.isFrozenRelated(d.key)) {
				this.tooltip.show(event, buildTooltipContent(d.key, this.dataProcessor));
			}
			return;
		}
		this.overlayRenderer.applyH(d.key);
		this.tooltip.show(event, buildTooltipContent(d.key, this.dataProcessor));
	}

	onMousemove(event) {
		this.tooltip.move(event);
	}

	onMouseout() {
		this.tooltip.hide();
		if (this.overlayRenderer.isFrozen()) return;
		this.overlayRenderer.clearH();
	}

}


export class RibbonClickHandler {

	constructor(overlayRenderer) {
		this.overlayRenderer = overlayRenderer;
	}

	onClick(d, event) {
		event.stopPropagation();
		if (this.overlayRenderer.isFrozen()) {
			this.overlayRenderer.unfreeze();
		} else {
			this.overlayRenderer.applyH(d.key);
			this.overlayRenderer.freeze(d.key);
		}
	}

}
