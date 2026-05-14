import { getCategories, getNumericRange } from '../../js/utils/metadata.js';

export default class DataProcessor {

	constructor(samples) {
		this.samples = samples;
	}

	// frequencies (count of samples) for one attribute
	computeNodeFrequencies(attr) {
		const orderedValues = this.getOrderedValues(attr);
		const frequencies = new Map();

		orderedValues.forEach(value => frequencies.set(value, 0));

		this.samples.forEach(sample => {
			const value = sample[attr];
			if (frequencies.has(value)) {
				frequencies.set(value, frequencies.get(value) + 1);
			}
		});

		return frequencies;
	}

	// count number of samples for attr1 × attr2 combinations
	computeJointFrequencies(attr1, attr2) {
		const jointFrequencies = new Map();

		this.samples.forEach(sample => {
			const key = `${sample[attr1]}||${sample[attr2]}`;
			jointFrequencies.set(key, (jointFrequencies.get(key) ?? 0) + 1);
		});

		return jointFrequencies;
	}

	/**
	 * filter samples that match all selections (AND logic across attrs, OR within each attr)
	 * @param {Object<string, Set<string>>} selection
	 * @returns {Object[]}
	 */
	filterSamples(selection) {
		return this.samples.filter(sample => {
			for (const attr in selection) {
				const vals = selection[attr];
				if (vals.size === 0) continue;
				if (!vals.has(sample[attr])) return false;
			}
			return true;
		});
	}

	// return set of sampleIDs matching the selection
	getFilteredSampleIds(selection) {
		return new Set(this.filterSamples(selection).map(s => s.sampleID));
	}

	// get one sample by its sampleID
	getSample(id) {
		return this.samples.find(s => s.sampleID === id) ?? null;
	}

	getOrderedValues(attr) {
		return getNumericRange(attr) ?? getCategories(attr);
	}
}
