let map = null;

export async function init(url = 'data/label.json') {
	const resp = await fetch(url);
	map = await resp.json();
}

function _requireInit() {
	if (!map) throw new Error('metadata.init() must be called before use');
}

export function getAttrLabel(attr) {
	_requireInit();
	return map[attr].label;
}

export function getAttrType(attr) {
	_requireInit();
	return map[attr].type;
}

// Returns human-readable label for a category value.
// For numeric attributes returns the value unchanged.
export function getLabel(attr, value) {
	_requireInit();
	const { type, scale } = map[attr];
	if (type === 'numeric') return value;
	const match = scale.find(d => d.value === String(value));
	return match ? match.label : value;
}

// Returns ordered array of category strings for categorical/ordinal attributes.
export function getCategories(attr) {
	_requireInit();
	const { type, scale } = map[attr];
	if (type === 'numeric') return null;
	return scale.map(d => d.value);
}

// Returns all integer values of a numeric attribute as strings, in ascending order.
export function getNumericRange(attr) {
	_requireInit();
	const { type, scale } = map[attr];
	if (type !== 'numeric') return null;
	const range = [];
	for (let i = scale.min; i <= scale.max; i++) {
		range.push(String(i));
	}
	return range;
}

// Test-only: reset internal state so init() can be called again.
export function _reset() {
	map = null;
}
