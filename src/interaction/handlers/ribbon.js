import { buildTooltipContent } from '../tooltip.js';

export class RibbonHoverHandler {

	constructor(state, overlayRenderer, tooltip, dataProcessor) {
		this.state = state;
		this.overlayRenderer = overlayRenderer;
		this.tooltip = tooltip;
		this.dataProcessor = dataProcessor;
	}

	onMouseover(d, event) {
		if (this.state.isFrozen()) {
			// When frozen, only show tooltip for ribbons on the frozen path.
			if (this.state.isFrozenRelated(d.key)) {
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
		if (this.state.isFrozen()) return;
		this.overlayRenderer.clearH();
	}

}


export class RibbonClickHandler {

	constructor(state, overlayRenderer) {
		this.state = state;
		this.overlayRenderer = overlayRenderer;
	}

	onClick(d, event) {
		event.stopPropagation();
		if (this.state.isFrozen()) {
			this.state.unfreeze();
			this.overlayRenderer.clearH();
		} else {
			this.overlayRenderer.applyH(d.key);
			this.state.freeze([d.key]);
		}
	}

}
