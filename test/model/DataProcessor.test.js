import { describe, it, expect, vi, beforeEach } from 'vitest';
import DataProcessor from '../../src/model/DataProcessor.js';

// Mock label helper so tests don't need the real label.json or a running server
vi.mock('../../src/utils/metadata.js', () => ({
	// numeric: score 0–4
	getNumericRange: vi.fn(attr => (attr === 'score' ? ['0', '1', '2', '3', '4'] : null)),
	// categorical / ordinal
	getCategories: vi.fn(attr => {
		if (attr === 'grade') return ['A', 'B', 'C'];
		if (attr === 'sex')   return ['F', 'M'];
		if (attr === 'level') return ['low', 'medium', 'high'];
		return null;
	}),
}));

// ------------------------------------------------------------------
// Shared mock samples covering numeric, categorical, and ordinal attrs
// ------------------------------------------------------------------
const SAMPLES = [
	{ sampleID: '0', score: '3', grade: 'A', sex: 'F', level: 'high'   },
	{ sampleID: '1', score: '4', grade: 'B', sex: 'M', level: 'medium' },
	{ sampleID: '2', score: '3', grade: 'A', sex: 'F', level: 'low'    },
	{ sampleID: '3', score: '1', grade: 'C', sex: 'M', level: 'high'   },
	{ sampleID: '4', score: '0', grade: 'B', sex: 'F', level: 'medium' },
];

let processor;
beforeEach(() => {
	processor = new DataProcessor(SAMPLES);
});

// ------------------------------------------------------------------
describe('computeNodeFrequencies', () => {
	it('counts correctly for a categorical attribute', () => {
		const freq = processor.computeNodeFrequencies('grade');
		expect(freq.get('A')).toBe(2);
		expect(freq.get('B')).toBe(2);
		expect(freq.get('C')).toBe(1);
	});

	it('counts correctly for a numeric attribute', () => {
		const freq = processor.computeNodeFrequencies('score');
		expect(freq.get('3')).toBe(2);
		expect(freq.get('4')).toBe(1);
		expect(freq.get('1')).toBe(1);
		expect(freq.get('0')).toBe(1);
		expect(freq.get('2')).toBe(0);  // value present in range but not in data
	});

	it('counts correctly for an ordinal attribute', () => {
		const freq = processor.computeNodeFrequencies('level');
		expect(freq.get('high')).toBe(2);
		expect(freq.get('medium')).toBe(2);
		expect(freq.get('low')).toBe(1);
	});

	it('preserves ordered keys from getOrderedValues', () => {
		const freq = processor.computeNodeFrequencies('grade');
		expect([...freq.keys()]).toEqual(['A', 'B', 'C']);
	});
});

// ------------------------------------------------------------------
describe('computeJointFrequencies', () => {
	it('returns correct joint counts', () => {
		const joint = processor.computeJointFrequencies('grade', 'sex');
		expect(joint.get('A||F')).toBe(2);
		expect(joint.get('B||M')).toBe(1);
		expect(joint.get('B||F')).toBe(1);
		expect(joint.get('C||M')).toBe(1);
	});

	it('key format is attr1value||attr2value', () => {
		const joint = processor.computeJointFrequencies('score', 'grade');
		expect(joint.has('3||A')).toBe(true);
	});
});

// ------------------------------------------------------------------
describe('filterSamples', () => {
	it('filters by a single attribute (OR within attr)', () => {
		const result = processor.filterSamples({ sex: new Set(['F']) });
		expect(result).toHaveLength(3);
		result.forEach(s => expect(s.sex).toBe('F'));
	});

	it('applies AND logic across attributes', () => {
		const result = processor.filterSamples({ sex: new Set(['F']), grade: new Set(['A']) });
		expect(result).toHaveLength(2);
		result.forEach(s => {
			expect(s.sex).toBe('F');
			expect(s.grade).toBe('A');
		});
	});

	it('OR logic within an attribute', () => {
		const result = processor.filterSamples({ grade: new Set(['A', 'C']) });
		expect(result).toHaveLength(3);
	});

	it('skips an attribute whose selection set is empty', () => {
		const result = processor.filterSamples({ sex: new Set([]), grade: new Set(['A']) });
		expect(result).toHaveLength(2);
	});

	it('returns empty array when no samples match', () => {
		const result = processor.filterSamples({ sex: new Set(['F']), grade: new Set(['C']) });
		expect(result).toHaveLength(0);
	});
});

// ------------------------------------------------------------------
describe('getFilteredSampleIds', () => {
	it('returns a Set of sampleIDs', () => {
		const ids = processor.getFilteredSampleIds({ sex: new Set(['M']) });
		expect(ids).toBeInstanceOf(Set);
		expect(ids.has('1')).toBe(true);
		expect(ids.has('3')).toBe(true);
		expect(ids.size).toBe(2);
	});

	it('does not include IDs of non-matching samples', () => {
		const ids = processor.getFilteredSampleIds({ sex: new Set(['M']) });
		expect(ids.has('0')).toBe(false);
	});
});

// ------------------------------------------------------------------
describe('getSample', () => {
	it('retrieves the correct sample by sampleID', () => {
		const s = processor.getSample('2');
		expect(s.grade).toBe('A');
		expect(s.sex).toBe('F');
	});

	it('returns null for an unknown sampleID', () => {
		expect(processor.getSample('999')).toBeNull();
	});
});
