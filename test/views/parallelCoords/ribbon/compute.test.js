import { describe, it, expect } from 'vitest';
import { computeAllRibbons } from '../../../../js/views/parallelCoords/ribbon/compute.js';
import { AXIS_HEIGHT } from '../../../../js/views/parallelCoords/layout.js';
import { AxisLayout, NodeLayout } from '../../../../js/views/parallelCoords/utils.js';

const colorFn = () => '#abc';

// Build a minimal AxisLayout with two equal-height nodes starting at y=0.
function makeAxis(attr, x, valueCountPairs) {
	const total = valueCountPairs.reduce((s, [, c]) => s + c, 0);
	let currY = 0;
	const nodes = [...valueCountPairs].reverse().map(([value, count]) => {
		const height = (count / total) * AXIS_HEIGHT;
		const node = new NodeLayout(value, currY, height);
		currY += height;
		return node;
	});
	return new AxisLayout(attr, x, nodes);
}

describe('computeAllRibbons', () => {

	describe('edge cases', () => {
		it('returns empty array when layouts has fewer than 2 entries', () => {
			const layouts = [makeAxis('a', 0, [['v', 10]])];
			expect(computeAllRibbons(layouts, [], colorFn)).toEqual([]);
		});

		it('returns empty array when sample list is empty', () => {
			const layouts = [makeAxis('a', 0, [['v', 10]]), makeAxis('b', 100, [['v', 10]])];
			expect(computeAllRibbons(layouts, [], colorFn)).toEqual([]);
		});

		it('skips value combinations with no matching samples', () => {
			const layouts = [
				makeAxis('a', 0, [['x', 5], ['y', 5]]),
				makeAxis('b', 100, [['p', 5], ['q', 5]]),
			];
			// all samples have a=x, b=p — no a=y or b=q samples
			const samples = Array(5).fill({ a: 'x', b: 'p' });
			const ribbons = computeAllRibbons(layouts, samples, colorFn);
			expect(ribbons).toHaveLength(1);
			expect(ribbons[0].leftValue).toBe('x');
			expect(ribbons[0].rightValue).toBe('p');
		});
	});

	describe('ribbon geometry', () => {
		const layouts = [
			makeAxis('study', 0, [['lo', 50], ['hi', 50]]),
			makeAxis('grade', 200, [['A', 50], ['B', 50]]),
		];
		// 10 samples: 4 lo→A, 3 lo→B, 2 hi→A, 1 hi→B
		const samples = [
			...Array(4).fill({ study: 'lo', grade: 'A' }),
			...Array(3).fill({ study: 'lo', grade: 'B' }),
			...Array(2).fill({ study: 'hi', grade: 'A' }),
			...Array(1).fill({ study: 'hi', grade: 'B' }),
		];

		it('generates one ribbon per non-empty cross-product', () => {
			expect(computeAllRibbons(layouts, samples, colorFn)).toHaveLength(4);
		});

		it('ribbon height is count/total * AXIS_HEIGHT', () => {
			const ribbons = computeAllRibbons(layouts, samples, colorFn);
			const loA = ribbons.find(r => r.leftValue === 'lo' && r.rightValue === 'A');
			const expectedHeight = (4 / 10) * AXIS_HEIGHT;
			expect(loA.leftY2 - loA.leftY1).toBeCloseTo(expectedHeight);
			expect(loA.rightY2 - loA.rightY1).toBeCloseTo(expectedHeight);
		});

		it('heights within a node stack without gap', () => {
			const ribbons = computeAllRibbons(layouts, samples, colorFn);
			// Both ribbons starting from 'hi' node
			const hiRibbons = ribbons.filter(r => r.leftValue === 'hi')
				.sort((a, b) => a.leftY1 - b.leftY1);
			expect(hiRibbons[1].leftY1).toBeCloseTo(hiRibbons[0].leftY2);
		});

		it('calls colorFn with correct attr/value arguments', () => {
			const calls = [];
			const trackingColorFn = (la, lv, ra, rv) => { calls.push({ la, lv, ra, rv }); return '#000'; };
			computeAllRibbons(layouts, samples, trackingColorFn);
			expect(calls.length).toBe(4);
			expect(calls.every(c => c.la === 'study' && c.ra === 'grade')).toBe(true);
		});

		it('uses colorFn return value as ribbon color', () => {
			const ribbons = computeAllRibbons(layouts, samples, () => 'crimson');
			expect(ribbons.every(r => r.color === 'crimson')).toBe(true);
		});
	});

	describe('ribbon keys', () => {
		const layouts = [
			makeAxis('a', 0, [['1', 10]]),
			makeAxis('b', 100, [['2', 10]]),
		];
		const samples = Array(10).fill({ a: '1', b: '2' });

		it('key encodes left and right attr:value', () => {
			const [ribbon] = computeAllRibbons(layouts, samples, colorFn);
			expect(ribbon.key).toBe('a:1||b:2');
		});

		it('key across three axes includes full path', () => {
			const threeLayouts = [
				makeAxis('a', 0, [['1', 10]]),
				makeAxis('b', 100, [['2', 10]]),
				makeAxis('c', 200, [['3', 10]]),
			];
			const threeAxisSamples = Array(10).fill({ a: '1', b: '2', c: '3' });
			const ribbons = computeAllRibbons(threeLayouts, threeAxisSamples, colorFn);

			// First pair: a:1||b:2
			const ab = ribbons.find(r => r.leftAttr === 'a');
			expect(ab.key).toBe('a:1||b:2');

			// Second pair: a:1||b:2||c:3 (includes full history)
			const bc = ribbons.find(r => r.leftAttr === 'b');
			expect(bc.key).toBe('a:1||b:2||c:3');
		});
	});

});
