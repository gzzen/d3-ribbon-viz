import { overlay as overlayCfg } from '../../../config.js';
import { isRelated } from '../ribbon/keys.js';

export default class OverlayRenderer {

	constructor(ribbonRenderer) {
		this.ribbonRenderer = ribbonRenderer;
		this.frozen = false;
		this.frozenKey = null;
		this.frozenKeys = [];
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

	clearH() {
		this.ribbonRenderer.ribbonGroup
			.selectAll('path.ribbon')
			.each(function (d) {
				d3.select(this)
					.attr('fill', d.color)
					.attr('opacity', d.isHighlighted ? overlayCfg.baseOpacity : 0.05);
			});
	}

	freeze(ribbonKey) {
		this.frozen = true;
		this.frozenKey = ribbonKey;
		this.frozenKeys = [];
	}

	freezeMultiple(ribbonKeys) {
		this.frozen = true;
		this.frozenKey = null;
		this.frozenKeys = ribbonKeys;
	}

	unfreeze() {
		this.frozen = false;
		this.frozenKey = null;
		this.frozenKeys = [];
		this.clearH();
	}

	isFrozen() {
		return this.frozen;
	}

	isFrozenRelated(ribbonKey) {
		if (!this.frozen) return false;
		if (this.frozenKey) return isRelated(ribbonKey, this.frozenKey);
		return this.frozenKeys.some(k => isRelated(ribbonKey, k));
	}

}


