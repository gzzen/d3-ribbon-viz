import { overlay as overlayCfg } from '../config.js';
import { isRelated } from '../ribbon/keys.js';

/** Pure SVG renderer for ribbon highlight/dim states. Holds no mutable state. */
export default class OverlayRenderer {

	constructor(ribbonRenderer) {
		this.ribbonRenderer = ribbonRenderer;
	}

	applyH(ribbonKey) {
		this.ribbonRenderer.ribbonGroup
			.selectAll('path.ribbon')
			.each(function (d) {
				const highlighted = isRelated(d.key, ribbonKey);
				d3.select(this)
					.attr('fill', highlighted ? d.color : overlayCfg.greyColor)
					.attr('opacity', highlighted ? overlayCfg.highlightOpacity : overlayCfg.dimmedOpacity);
			});
	}

	applyHMultiple(ribbonKeys) {
		this.ribbonRenderer.ribbonGroup
			.selectAll('path.ribbon')
			.each(function (d) {
				const highlighted = ribbonKeys.some(k => isRelated(d.key, k));
				d3.select(this)
					.attr('fill', highlighted ? d.color : overlayCfg.greyColor)
					.attr('opacity', highlighted ? overlayCfg.highlightOpacity : overlayCfg.dimmedOpacity);
			});
	}

	/** Restore ribbons to their base rendered state (respecting isHighlighted flag). */
	clearH() {
		this.ribbonRenderer.ribbonGroup
			.selectAll('path.ribbon')
			.each(function (d) {
				d3.select(this)
					.attr('fill', d.color)
					.attr('opacity', d.isHighlighted ? overlayCfg.baseOpacity : 0.05);
			});
	}

}
