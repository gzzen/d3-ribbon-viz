import { NodeLayout, AxisLayout } from './utils.js';
import { axis } from './config.js';

/**
 * Compute axis and node layout positions from attribute frequencies.
 *
 * @param {string[]} attrs - ordered list of attribute names to display
 * @param {Map<string, Map<string, number>>} freqMap - per-attr value→count map
 * @param {number} viewWidth - pixel width of the SVG coordinate space
 * @param {number} viewHeight - pixel height of the SVG coordinate space
 * @returns {{ layouts: AxisLayout[], axisHeight: number, axisTop: number, axisBottom: number, labelY: number }}
 */
export function computeLayouts(attrs, freqMap, viewWidth, viewHeight) {
	const geom = _resolveGeometry(viewWidth, viewHeight);
	const { marginLeft, marginRight, axisTop, axisBottom, axisHeight } = geom;

	const axisCount = attrs.length;
	const layoutWidth = viewWidth - marginLeft - marginRight;

	const layouts = attrs.map((attr, i) => {
		const x = marginLeft + (i / (axisCount - 1)) * layoutWidth;
		return new AxisLayout(attr, x, _computeNodeLayout(freqMap.get(attr), axisTop, axisHeight));
	});

	return { layouts, axisHeight: geom.axisHeight, axisTop, axisBottom, labelY: geom.labelY };
}

// Compute absolute pixel geometry from config fractions.
function _resolveGeometry(viewWidth, viewHeight) {
	const mL = Math.round(axis.marginLeftFraction   * viewWidth);
	const mR = Math.round(axis.marginRightFraction  * viewWidth);
	const mT = Math.round(axis.marginTopFraction    * viewHeight);
	const mB = Math.round(axis.marginBottomFraction * viewHeight);
	const pI = Math.round(axis.paddingInnerFraction * viewHeight);
	const axisTop    = mT + pI;
	const axisBottom = viewHeight - mB - pI;
	return {
		marginLeft:  mL,
		marginRight: mR,
		axisTop,
		axisBottom,
		axisHeight:  axisBottom - axisTop,
		labelY:      mT - Math.round(axis.labelOffsetFraction * viewHeight),
	};
}

// Distribute axis height among nodes proportional to their frequency counts.
// Entries are reversed so the last category appears at the top of the axis.
function _computeNodeLayout(freqs, axisTop, axisHeight) {
	let total = 0;
	for (const count of freqs.values()) total += count;

	const nodes = [];
	let currY = axisTop;
	for (const [value, count] of [...freqs.entries()].reverse()) {
		const height = (count / total) * axisHeight;
		nodes.push(new NodeLayout(value, currY, height));
		currY += height + axis.nodePadding;
	}
	return nodes;
}
