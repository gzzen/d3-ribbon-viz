import { NodeLayout, AxisLayout } from './utils.js';
import { axis, viewport } from './config.js';

const AXIS_TOP = axis.marginTop + axis.paddingInner;
const AXIS_BOTTOM = viewport.height - axis.marginBottom - axis.paddingInner;

/** Drawable height of each axis column, shared by the ribbon renderer. */
export const AXIS_HEIGHT = AXIS_BOTTOM - AXIS_TOP;

/**
 * Compute axis and node layout positions from attribute frequencies.
 *
 * @param {string[]} attrs - ordered list of attribute names to display
 * @param {Map<string, Map<string, number>>} freqMap - per-attr value→count map
 * @param {number} viewWidth - pixel width of the SVG coordinate space
 * @returns {AxisLayout[]}
 */
export function computeLayouts(attrs, freqMap, viewWidth) {
	const axisCount = attrs.length;
	const layoutWidth = viewWidth - axis.marginLeft - axis.marginRight;

	return attrs.map((attr, i) => {
		const x = axis.marginLeft + (i / (axisCount - 1)) * layoutWidth;
		return new AxisLayout(attr, x, _computeNodeLayout(freqMap.get(attr)));
	});
}

// Distribute axis height among nodes proportional to their frequency counts.
// Entries are reversed so the last category appears at the top of the axis.
function _computeNodeLayout(freqs) {
	let total = 0;
	for (const count of freqs.values()) total += count;

	const nodes = [];
	let currY = AXIS_TOP;
	for (const [value, count] of [...freqs.entries()].reverse()) {
		const height = (count / total) * AXIS_HEIGHT;
		nodes.push(new NodeLayout(value, currY, height));
		currY += height + axis.nodePadding;
	}
	return nodes;
}
