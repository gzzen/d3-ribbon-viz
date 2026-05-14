import { describe, it, expect } from 'vitest';
import { computeLayouts, AXIS_HEIGHT } from '../../../js/views/parallelCoords/layout.js';
import { axis, viewport } from '../../../js/config.js';

// Fixed view width so tests are viewport-independent.
const VIEW_WIDTH = 1000;

// Build a freqMap where every attr has the given value→count entries.
function makeFreqMap(attrs, entries) {
	return new Map(attrs.map(a => [a, new Map(entries)]));
}

describe('AXIS_HEIGHT', () => {
	it('equals viewport height minus top and bottom margins and padding', () => {
		const expected =
			(viewport.height - axis.marginBottom - axis.paddingInner) -
			(axis.marginTop + axis.paddingInner);
		expect(AXIS_HEIGHT).toBe(expected);
	});

	it('is positive', () => {
		expect(AXIS_HEIGHT).toBeGreaterThan(0);
	});
});

describe('computeLayouts', () => {
	describe('axis positions', () => {
		it('returns one layout per attribute', () => {
			const attrs = ['a', 'b', 'c'];
			const layouts = computeLayouts(attrs, makeFreqMap(attrs, [['v', 1]]), VIEW_WIDTH);
			expect(layouts).toHaveLength(3);
		});

		it('assigns attributes in order', () => {
			const attrs = ['x', 'y', 'z'];
			const layouts = computeLayouts(attrs, makeFreqMap(attrs, [['v', 1]]), VIEW_WIDTH);
			expect(layouts.map(l => l.attr)).toEqual(attrs);
		});

		it('places first axis at marginLeft', () => {
			const attrs = ['a', 'b'];
			const layouts = computeLayouts(attrs, makeFreqMap(attrs, [['v', 1]]), VIEW_WIDTH);
			expect(layouts[0].x).toBe(axis.marginLeft);
		});

		it('places last axis at viewWidth - marginRight', () => {
			const attrs = ['a', 'b'];
			const layouts = computeLayouts(attrs, makeFreqMap(attrs, [['v', 1]]), VIEW_WIDTH);
			expect(layouts[1].x).toBe(VIEW_WIDTH - axis.marginRight);
		});

		it('spaces three axes evenly', () => {
			const attrs = ['a', 'b', 'c'];
			const layouts = computeLayouts(attrs, makeFreqMap(attrs, [['v', 1]]), VIEW_WIDTH);
			const gap1 = layouts[1].x - layouts[0].x;
			const gap2 = layouts[2].x - layouts[1].x;
			expect(gap2).toBeCloseTo(gap1);
		});
	});

	describe('node heights', () => {
		it('total node height across an axis equals AXIS_HEIGHT', () => {
			const attrs = ['a', 'b'];
			const freqMap = makeFreqMap(attrs, [['v1', 30], ['v2', 70]]);
			const layouts = computeLayouts(attrs, freqMap, VIEW_WIDTH);
			const totalHeight = layouts[0].nodes.reduce((sum, n) => sum + n.height, 0);
			expect(totalHeight).toBeCloseTo(AXIS_HEIGHT);
		});

		it('node heights are proportional to frequencies', () => {
			const attrs = ['a', 'b'];
			const freqMap = makeFreqMap(attrs, [['v1', 25], ['v2', 75]]);
			const layouts = computeLayouts(attrs, freqMap, VIEW_WIDTH);
			const nodes = layouts[0].nodes;
			// reversed order: v2 (75%) comes first
			expect(nodes[0].height / nodes[1].height).toBeCloseTo(75 / 25);
		});

		it('a single-value axis uses the full axis height', () => {
			const attrs = ['a', 'b'];
			const freqMap = makeFreqMap(attrs, [['only', 10]]);
			const layouts = computeLayouts(attrs, freqMap, VIEW_WIDTH);
			expect(layouts[0].nodes[0].height).toBeCloseTo(AXIS_HEIGHT);
		});
	});

	describe('node y positions', () => {
		it('first node starts at the top of the axis', () => {
			const AXIS_TOP = axis.marginTop + axis.paddingInner;
			const attrs = ['a', 'b'];
			const freqMap = makeFreqMap(attrs, [['v1', 50], ['v2', 50]]);
			const layouts = computeLayouts(attrs, freqMap, VIEW_WIDTH);
			expect(layouts[0].nodes[0].y).toBe(AXIS_TOP);
		});

		it('successive nodes stack immediately after the previous one (nodePadding = 0)', () => {
			const attrs = ['a', 'b'];
			const freqMap = makeFreqMap(attrs, [['v1', 50], ['v2', 50]]);
			const layouts = computeLayouts(attrs, freqMap, VIEW_WIDTH);
			const [n0, n1] = layouts[0].nodes;
			expect(n1.y).toBeCloseTo(n0.y + n0.height + axis.nodePadding);
		});
	});
});
