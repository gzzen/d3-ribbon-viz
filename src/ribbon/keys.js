/**
 * Utilities for ribbon path keys.
 *
 * A key encodes the full axis path a ribbon travels through, e.g.:
 *   "studytime:2||failures:0||final_grade_levels:A"
 *
 * Keys grow leftward to rightward as ribbons are computed across axes.
 * Prefix-matching determines ancestor/descendant relationships used for
 * overlay highlighting.
 */

/** Parse a key string into an ordered array of {attr, value} pairs. */
export function parseKey(key) {
	return key.split('||').map(segment => {
		const i = segment.indexOf(':');
		return { attr: segment.slice(0, i), value: segment.slice(i + 1) };
	});
}

/** Build a key string from an ordered array of {attr, value} pairs. */
export function buildKey(segments) {
	return segments.map(s => `${s.attr}:${s.value}`).join('||');
}

/**
 * True if keys a and b lie on the same axis path — i.e., one is a prefix
 * (ancestor) of the other, or they are equal.
 */
export function isRelated(a, b) {
	if (a === b) return true;
	if (b.startsWith(a + '||')) return true;
	if (a.startsWith(b + '||')) return true;
	return false;
}

/**
 * Return the subset of keys that satisfy every axis constraint.
 *
 * @param {string[]} keys - ribbon key strings to filter
 * @param {Object<string, Set<string>>} constraints - per-axis allowed values;
 *   a ribbon must match at least one value per axis (OR within axis, AND across axes)
 * @returns {string[]}
 */
export function matchingKeys(keys, constraints) {
	return keys.filter(key => {
		const ribbonValues = {};
		for (const { attr, value } of parseKey(key)) ribbonValues[attr] = value;
		for (const attr in constraints) {
			if (!constraints[attr].has(ribbonValues[attr])) return false;
		}
		return true;
	});
}
