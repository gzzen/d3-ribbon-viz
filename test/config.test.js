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
		it('has a targetAttr string not in defaultAttrs', () => {
			expect(data.targetAttr).toBeTypeOf('string');
			expect(data.defaultAttrs).not.toContain(data.targetAttr);
		});
	});

	describe('viewport', () => {
		it('heightFraction is between 0 and 1', () => {
			expect(viewport.heightFraction).toBeGreaterThan(0);
			expect(viewport.heightFraction).toBeLessThan(1);
		});
		it('rightPadFraction is between 0 and 1', () => {
			expect(viewport.rightPadFraction).toBeGreaterThan(0);
			expect(viewport.rightPadFraction).toBeLessThan(1);
		});
		it('sidebarFraction is between 0 and 1', () => {
			expect(viewport.sidebarFraction).toBeGreaterThan(0);
			expect(viewport.sidebarFraction).toBeLessThan(1);
		});
		it('fractions leave room for content', () => {
			expect(viewport.rightPadFraction + viewport.sidebarFraction).toBeLessThan(1);
		});
		it('has svgWidthStyle and svgMarginLeft strings', () => {
			expect(viewport.svgWidthStyle).toBeTypeOf('string');
			expect(viewport.svgMarginLeft).toBeTypeOf('string');
		});
	});

	describe('axis', () => {
		it('has all margin fractions as positive numbers between 0 and 1', () => {
			expect(axis.marginLeftFraction).toBeGreaterThan(0);
			expect(axis.marginLeftFraction).toBeLessThan(1);
			expect(axis.marginRightFraction).toBeGreaterThan(0);
			expect(axis.marginRightFraction).toBeLessThan(1);
			expect(axis.marginTopFraction).toBeGreaterThan(0);
			expect(axis.marginTopFraction).toBeLessThan(1);
			expect(axis.marginBottomFraction).toBeGreaterThan(0);
			expect(axis.marginBottomFraction).toBeLessThan(1);
		});
		it('has paddingInnerFraction and nodePadding as non-negative numbers', () => {
			expect(axis.paddingInnerFraction).toBeGreaterThanOrEqual(0);
			expect(axis.nodePadding).toBeGreaterThanOrEqual(0);
		});
		it('inner axis height is positive given current config', () => {
			// axisTop = marginTopFraction + paddingInnerFraction
			// axisBottom = 1 - marginBottomFraction - paddingInnerFraction
			const axisTopFrac    = axis.marginTopFraction    + axis.paddingInnerFraction;
			const axisBottomFrac = 1 - axis.marginBottomFraction - axis.paddingInnerFraction;
			expect(axisBottomFrac - axisTopFrac).toBeGreaterThan(0);
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
