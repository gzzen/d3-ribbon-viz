import { describe, it, expect, vi, beforeEach } from 'vitest';

const FIXTURE = {
	age: { label: 'Age', type: 'numeric', scale: { min: 15, max: 18 } },
	grade: { label: 'Grade', type: 'ordinal', scale: [
		{ value: 'A', label: 'A grade' },
		{ value: 'B', label: 'B grade' },
	]},
	school: { label: 'School', type: 'categorical', scale: [
		{ value: 'GP', label: 'Gabriel Pereira' },
		{ value: 'MS', label: 'Mousinho da Silveira' },
	]},
};

// Reset module state between test groups so init() can be re-tested.
beforeEach(async () => {
	const mod = await import('../../js/utils/metadata.js');
	mod._reset();
});

describe('metadata', () => {

	describe('before init()', () => {
		it('getAttrLabel throws', async () => {
			const { getAttrLabel } = await import('../../js/utils/metadata.js');
			expect(() => getAttrLabel('age')).toThrow('metadata.init()');
		});

		it('getAttrType throws', async () => {
			const { getAttrType } = await import('../../js/utils/metadata.js');
			expect(() => getAttrType('age')).toThrow('metadata.init()');
		});
	});

	describe('after init()', () => {
		beforeEach(async () => {
			global.fetch = vi.fn().mockResolvedValue({ json: () => Promise.resolve(FIXTURE) });
			const { init } = await import('../../js/utils/metadata.js');
			await init('test-url');
		});

		it('calls fetch with the given url', () => {
			expect(global.fetch).toHaveBeenCalledWith('test-url');
		});

		it('getAttrLabel returns the label', async () => {
			const { getAttrLabel } = await import('../../js/utils/metadata.js');
			expect(getAttrLabel('age')).toBe('Age');
			expect(getAttrLabel('grade')).toBe('Grade');
		});

		it('getAttrType returns the type', async () => {
			const { getAttrType } = await import('../../js/utils/metadata.js');
			expect(getAttrType('age')).toBe('numeric');
			expect(getAttrType('grade')).toBe('ordinal');
			expect(getAttrType('school')).toBe('categorical');
		});

		it('getLabel returns value unchanged for numeric', async () => {
			const { getLabel } = await import('../../js/utils/metadata.js');
			expect(getLabel('age', '17')).toBe('17');
		});

		it('getLabel returns human-readable label for categorical/ordinal', async () => {
			const { getLabel } = await import('../../js/utils/metadata.js');
			expect(getLabel('grade', 'A')).toBe('A grade');
			expect(getLabel('school', 'GP')).toBe('Gabriel Pereira');
		});

		it('getCategories returns null for numeric', async () => {
			const { getCategories } = await import('../../js/utils/metadata.js');
			expect(getCategories('age')).toBeNull();
		});

		it('getCategories returns ordered value array for ordinal/categorical', async () => {
			const { getCategories } = await import('../../js/utils/metadata.js');
			expect(getCategories('grade')).toEqual(['A', 'B']);
			expect(getCategories('school')).toEqual(['GP', 'MS']);
		});

		it('getNumericRange returns null for non-numeric', async () => {
			const { getNumericRange } = await import('../../js/utils/metadata.js');
			expect(getNumericRange('grade')).toBeNull();
		});

		it('getNumericRange returns string array covering min..max', async () => {
			const { getNumericRange } = await import('../../js/utils/metadata.js');
			expect(getNumericRange('age')).toEqual(['15', '16', '17', '18']);
		});
	});

});
