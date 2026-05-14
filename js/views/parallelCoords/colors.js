import { getAttrType, getCategories, getNumericRange } from '../../utils/metadata.js';

function buildNumericColorScale(attr) {
	const range = getNumericRange(attr);
	const maxIndex = range.length - 1;
	return function (value) {
		const t = range.indexOf(value) / maxIndex;
		return d3.interpolateYlOrRd(t);
	};
}

function buildOrdinalColorScale(attr) {
	const categories = getCategories(attr);
	const maxIndex = categories.length - 1;
	return function (value) {
		const t = 0.2 + (categories.indexOf(value) / maxIndex) * 0.8;
		return d3.interpolateBlues(t);
	};
}

function buildCategoricalColorScale(attr) {
	const categories = getCategories(attr);
	return function (value) {
		const index = categories.indexOf(value);
		return d3.schemeTableau10[index % d3.schemeTableau10.length];
	};
}

export function buildColorScale(attr) {
	const type = getAttrType(attr);
	if (type === 'numeric') return buildNumericColorScale(attr);
	if (type === 'ordinal') return buildOrdinalColorScale(attr);
	return buildCategoricalColorScale(attr);
}
