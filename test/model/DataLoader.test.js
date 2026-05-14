import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadCSV } from '../../src/model/DataLoader.js';

// Mock datasets of different types
const NUMERIC_ROWS = [
	{ score: '88', age: '22' },
	{ score: '74', age: '19' },
	{ score: '91', age: '21' },
];

const CATEGORICAL_ROWS = [
	{ id: 'u1', city: 'Boston', employed: 'yes' },
	{ id: 'u2', city: 'Austin', employed: 'no' },
	{ id: 'u3', city: 'Denver', employed: 'yes' },
];

const MIXED_ROWS = [
	{ uid: '101', name: 'Alice', grade: 'A', gpa: '3.9' },
	{ uid: '102', name: 'Bob',   grade: 'B', gpa: '3.1' },
	{ uid: '103', name: 'Carol', grade: 'A', gpa: '3.7' },
];

beforeEach(() => {
	globalThis.d3 = { csv: vi.fn() };
});

describe('loadCSV — generateId option', () => {
	it('assigns 0-based string IDs to each row', async () => {
		globalThis.d3.csv.mockResolvedValue(NUMERIC_ROWS);
		const samples = await loadCSV('mock.csv', { generateId: true });
		expect(samples[0].sampleID).toBe('0');
		expect(samples[1].sampleID).toBe('1');
		expect(samples[2].sampleID).toBe('2');
	});

	it('preserves all original columns', async () => {
		globalThis.d3.csv.mockResolvedValue(NUMERIC_ROWS);
		const samples = await loadCSV('mock.csv', { generateId: true });
		expect(samples[0].score).toBe('88');
		expect(samples[0].age).toBe('22');
	});

	it('works with categorical columns', async () => {
		globalThis.d3.csv.mockResolvedValue(CATEGORICAL_ROWS);
		const samples = await loadCSV('mock.csv', { generateId: true });
		expect(samples[0].city).toBe('Boston');
		expect(samples[1].employed).toBe('no');
	});
});

describe('loadCSV — idColumn option', () => {
	it('uses the specified column as sampleID', async () => {
		globalThis.d3.csv.mockResolvedValue(CATEGORICAL_ROWS);
		const samples = await loadCSV('mock.csv', { idColumn: 'id' });
		expect(samples[0].sampleID).toBe('u1');
		expect(samples[1].sampleID).toBe('u2');
		expect(samples[2].sampleID).toBe('u3');
	});

	it('coerces non-string IDs to strings', async () => {
		globalThis.d3.csv.mockResolvedValue(MIXED_ROWS);
		const samples = await loadCSV('mock.csv', { idColumn: 'uid' });
		expect(typeof samples[0].sampleID).toBe('string');
		expect(samples[0].sampleID).toBe('101');
	});

	it('preserves all original columns including the id column', async () => {
		globalThis.d3.csv.mockResolvedValue(MIXED_ROWS);
		const samples = await loadCSV('mock.csv', { idColumn: 'uid' });
		expect(samples[0].uid).toBe('101');
		expect(samples[0].name).toBe('Alice');
		expect(samples[0].grade).toBe('A');
	});

	it('throws if the specified idColumn is not in the CSV', async () => {
		globalThis.d3.csv.mockResolvedValue(NUMERIC_ROWS);
		await expect(loadCSV('mock.csv', { idColumn: 'missing' })).rejects.toThrow(/idColumn "missing"/);
	});
});

describe('loadCSV — error cases', () => {
	it('throws if neither generateId nor idColumn is provided', async () => {
		await expect(loadCSV('mock.csv', {})).rejects.toThrow();
	});

	it('throws if options are omitted entirely', async () => {
		await expect(loadCSV('mock.csv')).rejects.toThrow();
	});
});

describe('loadCSV — original data is not mutated', () => {
	it('does not add sampleID to the original row objects', async () => {
		const original = [{ name: 'Alice', score: '90' }];
		globalThis.d3.csv.mockResolvedValue(original);
		await loadCSV('mock.csv', { generateId: true });
		expect(original[0]).not.toHaveProperty('sampleID');
	});

	it('does not modify numeric rows when using generateId', async () => {
		const original = [{ score: '88', age: '22' }];
		globalThis.d3.csv.mockResolvedValue(original);
		await loadCSV('mock.csv', { generateId: true });
		expect(original[0]).toStrictEqual({ score: '88', age: '22' });
	});
});
