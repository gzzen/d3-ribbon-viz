import { describe, it, expect } from 'vitest';
import { data, viewport, axis, node, ribbon, overlay, legend } from '../src/config.js';

describe('config', () => {

	describe('data', () => {
		it('has a csvPath string', () => {
			expect(data.csvPath).toBeTypeOf('string');
			expect(data.csvPath.length).toBeGreaterThan(0);
		});
		it('has a non-empty defaultAttrs array', () => {
			expect(Array.isArray(data.defaultAttrs)).toBe(true);
			expect(data.defaultAttrs.length).toBeGreaterThan(0);
		});
		it('has a finalAttr string not in defaultAttrs', () => {
			expect(data.finalAttr).toBeTypeOf('string');
			expect(data.defaultAttrs).not.toContain(data.finalAttr);
		});
	});

	describe('viewport', () => {
		it('has positive numeric dimensions', () => {
			expect(viewport.height).toBeGreaterThan(0);
			expect(viewport.rightPad).toBeGreaterThan(0);
			expect(viewport.sidebarWidth).toBeGreaterThan(0);
		});
		it('has svgWidthStyle and svgMarginLeft strings', () => {
			expect(viewport.svgWidthStyle).toBeTypeOf('string');
			expect(viewport.svgMarginLeft).toBeTypeOf('string');
		});
	});

	describe('axis', () => {
		it('has all four margins as positive numbers', () => {
			expect(axis.marginLeft).toBeGreaterThan(0);
			expect(axis.marginRight).toBeGreaterThan(0);
			expect(axis.marginTop).toBeGreaterThan(0);
			expect(axis.marginBottom).toBeGreaterThan(0);
		});
		it('has paddingInner and nodePadding as non-negative numbers', () => {
			expect(axis.paddingInner).toBeGreaterThanOrEqual(0);
			expect(axis.nodePadding).toBeGreaterThanOrEqual(0);
		});
		it('inner axis height is positive given current config', () => {
			const axisTop = axis.marginTop + axis.paddingInner;
			const axisBottom = viewport.height - axis.marginBottom - axis.paddingInner;
			expect(axisBottom - axisTop).toBeGreaterThan(0);
		});
	});

	describe('node', () => {
		it('widthHovered is larger than width', () => {
			expect(node.widthHovered).toBeGreaterThan(node.width);
		});
		it('dimmedGreyAmount is between 0 and 1 exclusive', () => {
			expect(node.dimmedGreyAmount).toBeGreaterThan(0);
			expect(node.dimmedGreyAmount).toBeLessThan(1);
		});
		it('hoverTransitionMs is a positive number', () => {
			expect(node.hoverTransitionMs).toBeGreaterThan(0);
		});
		it('hoverFilterId is a non-empty string', () => {
			expect(node.hoverFilterId).toBeTypeOf('string');
			expect(node.hoverFilterId.length).toBeGreaterThan(0);
		});
	});

	describe('ribbon', () => {
		it('baseOpacity and dimmedOpacity are in [0, 1]', () => {
			expect(ribbon.baseOpacity).toBeGreaterThan(0);
			expect(ribbon.baseOpacity).toBeLessThanOrEqual(1);
			expect(ribbon.dimmedOpacity).toBeGreaterThanOrEqual(0);
			expect(ribbon.dimmedOpacity).toBeLessThan(1);
		});
		it('dimmedOpacity is less than baseOpacity', () => {
			expect(ribbon.dimmedOpacity).toBeLessThan(ribbon.baseOpacity);
		});
	});

	describe('overlay', () => {
		it('highlightOpacity is greater than dimmedOpacity', () => {
			expect(overlay.highlightOpacity).toBeGreaterThan(overlay.dimmedOpacity);
		});
		it('all opacities are in [0, 1]', () => {
			for (const val of [overlay.highlightOpacity, overlay.dimmedOpacity, overlay.baseOpacity]) {
				expect(val).toBeGreaterThanOrEqual(0);
				expect(val).toBeLessThanOrEqual(1);
			}
		});
		it('greyColor is a non-empty string', () => {
			expect(overlay.greyColor).toBeTypeOf('string');
			expect(overlay.greyColor.length).toBeGreaterThan(0);
		});
	});

	describe('legend', () => {
		it('has positive size values', () => {
			expect(legend.panelPadding).toBeGreaterThan(0);
			expect(legend.columnWidth).toBeGreaterThan(0);
			expect(legend.swatchSize).toBeGreaterThan(0);
			expect(legend.gradientBarWidth).toBeGreaterThan(0);
			expect(legend.gradientBarHeight).toBeGreaterThan(0);
		});
		it('has positive gap values', () => {
			expect(legend.columnGap).toBeGreaterThan(0);
			expect(legend.swatchGap).toBeGreaterThan(0);
			expect(legend.swatchLabelGap).toBeGreaterThan(0);
			expect(legend.gradientLabelGap).toBeGreaterThan(0);
		});
		it('has positive font sizes', () => {
			expect(legend.attrLabelFontSize).toBeGreaterThan(0);
			expect(legend.swatchFontSize).toBeGreaterThan(0);
			expect(legend.gradientLabelFontSize).toBeGreaterThan(0);
		});
	});

});
