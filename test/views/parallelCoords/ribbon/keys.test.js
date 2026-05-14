import { describe, it, expect } from 'vitest';
import { parseKey, buildKey, isRelated, matchingKeys } from '../../../../js/views/parallelCoords/ribbon/keys.js';

// helpers
const seg = (attr, value) => ({ attr, value });
const key = (...pairs) => pairs.map(([a, v]) => `${a}:${v}`).join('||');

describe('parseKey', () => {
	it('parses a single-segment key', () => {
		expect(parseKey('attr:val')).toEqual([seg('attr', 'val')]);
	});

	it('parses a multi-segment key', () => {
		expect(parseKey('a:1||b:2||c:3')).toEqual([seg('a', '1'), seg('b', '2'), seg('c', '3')]);
	});

	it('handles values that contain colons', () => {
		const result = parseKey('url:http:path');
		expect(result[0].attr).toBe('url');
		expect(result[0].value).toBe('http:path');
	});
});

describe('buildKey', () => {
	it('builds a single-segment key', () => {
		expect(buildKey([seg('a', '1')])).toBe('a:1');
	});

	it('builds a multi-segment key', () => {
		expect(buildKey([seg('a', '1'), seg('b', '2')])).toBe('a:1||b:2');
	});

	it('round-trips with parseKey', () => {
		const original = key(['x', 'foo'], ['y', 'bar'], ['z', 'baz']);
		expect(buildKey(parseKey(original))).toBe(original);
	});
});

describe('isRelated', () => {
	it('same key is related to itself', () => {
		expect(isRelated('a:1||b:2', 'a:1||b:2')).toBe(true);
	});

	it('ancestor is related to descendant', () => {
		// a:1 is an ancestor of a:1||b:2
		expect(isRelated('a:1', 'a:1||b:2')).toBe(true);
	});

	it('descendant is related to ancestor (symmetric)', () => {
		expect(isRelated('a:1||b:2', 'a:1')).toBe(true);
	});

	it('unrelated keys are not related', () => {
		expect(isRelated('a:1||b:2', 'a:2||b:2')).toBe(false);
		expect(isRelated('a:1', 'b:1')).toBe(false);
	});

	it('does not match on partial segment text', () => {
		// 'a:10' should not be treated as ancestor of 'a:100||b:1'
		expect(isRelated('a:10', 'a:100||b:1')).toBe(false);
	});
});

describe('matchingKeys', () => {
	const keys = [
		key(['study', '2'], ['fail', '0'], ['grade', 'A']),
		key(['study', '2'], ['fail', '1'], ['grade', 'B']),
		key(['study', '3'], ['fail', '0'], ['grade', 'A']),
		key(['study', '3'], ['fail', '0'], ['grade', 'B']),
	];

	it('returns all keys when constraints is empty', () => {
		expect(matchingKeys(keys, {})).toEqual(keys);
	});

	it('filters by a single-axis constraint', () => {
		const result = matchingKeys(keys, { study: new Set(['2']) });
		expect(result).toHaveLength(2);
		expect(result.every(k => k.includes('study:2'))).toBe(true);
	});

	it('applies AND across axes', () => {
		const result = matchingKeys(keys, {
			study: new Set(['3']),
			grade: new Set(['A']),
		});
		expect(result).toHaveLength(1);
		expect(result[0]).toContain('study:3');
		expect(result[0]).toContain('grade:A');
	});

	it('applies OR within an axis', () => {
		const result = matchingKeys(keys, { grade: new Set(['A', 'B']) });
		expect(result).toHaveLength(4);
	});

	it('returns empty array when no key satisfies all constraints', () => {
		const result = matchingKeys(keys, {
			study: new Set(['2']),
			fail: new Set(['1']),
			grade: new Set(['A']),
		});
		expect(result).toHaveLength(0);
	});

	it('ignores constraints for axes not present in a key', () => {
		// 'absent' axis is not in any key — constraint should block all
		const result = matchingKeys(keys, { absent: new Set(['x']) });
		expect(result).toHaveLength(0);
	});
});
