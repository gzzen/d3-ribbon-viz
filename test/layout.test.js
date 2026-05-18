import { describe, it, expect } from 'vitest';
import { computeLayouts } from '../src/layout.js';
import { axis } from '../src/config.js';

// Fixed viewport so tests are viewport-independent.
const VIEW_WIDTH  = 1000;
const VIEW_HEIGHT = 600;

// Build a freqMap where every attr has the given value→count entries.
function makeFreqMap(attrs, entries) {
	return new Map(attrs.map(a => [a, new Map(entries)]));
}

describe('computeLayouts', () => {
	describe('axis positions', () => {
		it('returns one layout per attribute', () => {
			const attrs = ['a', 'b', 'c'];
			const { layouts } = computeLayouts(attrs, makeFreqMap(attrs, [['v', 1]]), VIEW_WIDTH, VIEW_HEIGHT);
			expect(layouts).toHaveLength(3);
		});

		it('assigns attributes in order', () => {
			const attrs = ['x', 'y', 'z'];
			const { layouts } = computeLayouts(attrs, makeFreqMap(attrs, [['v', 1]]), VIEW_WIDTH, VIEW_HEIGHT);
			expect(layouts.map(l => l.attr)).toEqual(attrs);
		});

		it('places first axis at marginLeft', () => {
			const attrs = ['a', 'b'];
			const { layouts } = computeLayouts(attrs, makeFreqMap(attrs, [['v', 1]]), VIEW_WIDTH, VIEW_HEIGHT);
			const expectedMarginLeft = Math.round(axis.marginLeftFraction * VIEW_WIDTH);
			expect(layouts[0].x).toBe(expectedMarginLeft);
		});

		it('places last axis at viewWidth - marginRight', () => {
			const attrs = ['a', 'b'];
			const { layouts } = computeLayouts(attrs, makeFreqMap(attrs, [['v', 1]]), VIEW_WIDTH, VIEW_HEIGHT);
			const expectedMarginRight = Math.round(axis.marginRightFraction * VIEW_WIDTH);
			expect(layouts[1].x).toBe(VIEW_WIDTH - expectedMarginRight);
		});

		it('spaces three axes evenly', () => {
			const attrs = ['a', 'b', 'c'];
			const { layouts } = computeLayouts(attrs, makeFreqMap(attrs, [['v', 1]]), VIEW_WIDTH, VIEW_HEIGHT);
			const gap1 = layouts[1].x - layouts[0].x;
			const gap2 = layouts[2].x - layouts[1].x;
			expect(gap2).toBeCloseTo(gap1);
		});
	});

	describe('node heights', () => {
		it('total node height across an axis equals axisHeight', () => {
			const attrs = ['a', 'b'];
			const freqMap = makeFreqMap(attrs, [['v1', 30], ['v2', 70]]);
			const { layouts, axisHeight } = computeLayouts(attrs, freqMap, VIEW_WIDTH, VIEW_HEIGHT);
			const totalHeight = layouts[0].nodes.reduce((sum, n) => sum + n.height, 0);
			expect(totalHeight).toBeCloseTo(axisHeight);
		});

		it('node heights are proportional to frequencies', () => {
			const attrs = ['a', 'b'];
			const freqMap = makeFreqMap(attrs, [['v1', 25], ['v2', 75]]);
			const { layouts } = computeLayouts(attrs, freqMap, VIEW_WIDTH, VIEW_HEIGHT);
			const nodes = layouts[0].nodes;
			// reversed order: v2 (75%) comes first
			expect(nodes[0].height / nodes[1].height).toBeCloseTo(75 / 25);
		});

		it('a single-value axis uses the full axis height', () => {
			const attrs = ['a', 'b'];
			const freqMap = makeFreqMap(attrs, [['only', 10]]);
			const { layouts, axisHeight } = computeLayouts(attrs, freqMap, VIEW_WIDTH, VIEW_HEIGHT);
			expect(layouts[0].nodes[0].height).toBeCloseTo(axisHeight);
		});
	});

	describe('node y positions', () => {
		it('first node starts at the top of the axis', () => {
			const attrs = ['a', 'b'];
			const freqMap = makeFreqMap(attrs, [['v1', 50], ['v2', 50]]);
			const { layouts, axisTop } = computeLayouts(attrs, freqMap, VIEW_WIDTH, VIEW_HEIGHT);
			expect(layouts[0].nodes[0].y).toBe(axisTop);
		});

		it('successive nodes stack immediately after the previous one (nodePadding = 0)', () => {
			const attrs = ['a', 'b'];
			const freqMap = makeFreqMap(attrs, [['v1', 50], ['v2', 50]]);
			const { layouts } = computeLayouts(attrs, freqMap, VIEW_WIDTH, VIEW_HEIGHT);
			const [n0, n1] = layouts[0].nodes;
			expect(n1.y).toBeCloseTo(n0.y + n0.height + axis.nodePadding);
		});
	});

	describe('geometry return values', () => {
		it('axisHeight equals axisBottom minus axisTop', () => {
			const attrs = ['a', 'b'];
			const { axisHeight, axisTop, axisBottom } = computeLayouts(
				attrs, makeFreqMap(attrs, [['v', 1]]), VIEW_WIDTH, VIEW_HEIGHT
			);
			expect(axisHeight).toBe(axisBottom - axisTop);
		});

		it('axisHeight is positive', () => {
			const attrs = ['a', 'b'];
			const { axisHeight } = computeLayouts(
				attrs, makeFreqMap(attrs, [['v', 1]]), VIEW_WIDTH, VIEW_HEIGHT
			);
			expect(axisHeight).toBeGreaterThan(0);
		});

		it('labelY is above axisTop', () => {
			const attrs = ['a', 'b'];
			const { axisTop, labelY } = computeLayouts(
				attrs, makeFreqMap(attrs, [['v', 1]]), VIEW_WIDTH, VIEW_HEIGHT
			);
			expect(labelY).toBeLessThan(axisTop);
		});
	});
});
