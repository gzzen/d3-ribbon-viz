import { RibbonData } from '../utils.js';

/**
 * Compute all ribbon geometries across all adjacent axis pairs.
 *
 * Ribbons stack within each node proportional to sample counts. The full
 * left-to-right path is encoded in each ribbon's key so ancestor/descendant
 * relationships can be determined for overlay highlighting.
 *
 * @param {AxisLayout[]} layouts - ordered axis layouts (output of computeLayouts)
 * @param {Object[]} samples - raw sample objects
 * @param {Function} colorFn - (leftAttr, leftValue, rightAttr, rightValue) => colorString
 * @param {number} axisHeight - drawable height of each axis column in SVG units
 * @returns {RibbonData[]}
 */
export function computeAllRibbons(layouts, samples, colorFn, axisHeight) {
	if (layouts.length < 2) return [];

	const allRibbons = [];
	let sampleGroups = new Map([['', samples]]);

	for (let i = 0; i < layouts.length - 1; i++) {
		const { ribbons, nextSampleGroups } = _computeRibbonPair(
			layouts[i], layouts[i + 1], sampleGroups, samples.length, colorFn, axisHeight
		);
		allRibbons.push(...ribbons);
		sampleGroups = nextSampleGroups;
	}

	return allRibbons;
}


// Compute ribbons for one adjacent pair of axes.
// sampleGroups carries the filtered sample subsets from all prior axes so
// ribbon heights reflect the full path taken, not just this pair.
function _computeRibbonPair(leftLayout, rightLayout, sampleGroups, totalSamples, colorFn, axisHeight) {
	const ribbons = [];
	const nextSampleGroups = new Map();
	const leftOffsets = _initOffsets(leftLayout);
	const rightOffsets = _initOffsets(rightLayout);

	for (const leftNode of leftLayout.nodes) {
		for (const [pathKey, samples] of sampleGroups) {
			const leftFiltered = samples.filter(s => s[leftLayout.attr] === leftNode.value);
			if (leftFiltered.length === 0) continue;

			const newPathKey = pathKey
				? `${pathKey}||${leftLayout.attr}:${leftNode.value}`
				: `${leftLayout.attr}:${leftNode.value}`;
			nextSampleGroups.set(newPathKey, leftFiltered);

			for (const rightNode of rightLayout.nodes) {
				const count = leftFiltered.filter(s => s[rightLayout.attr] === rightNode.value).length;
				if (count === 0) continue;

				const height = (count / totalSamples) * axisHeight;
				const leftY1 = leftNode.y + leftOffsets[leftNode.value];
				const rightY1 = rightNode.y + rightOffsets[rightNode.value];
				const ribbonKey = `${newPathKey}||${rightLayout.attr}:${rightNode.value}`;

				ribbons.push(new RibbonData(
					leftLayout.attr, rightLayout.attr,
					leftNode.value, rightNode.value,
					leftLayout.x, rightLayout.x,
					leftY1, leftY1 + height,
					rightY1, rightY1 + height,
					colorFn(leftLayout.attr, leftNode.value, rightLayout.attr, rightNode.value),
					ribbonKey
				));

				leftOffsets[leftNode.value] += height;
				rightOffsets[rightNode.value] += height;
			}
		}
	}

	return { ribbons, nextSampleGroups };
}


function _initOffsets(layout) {
	const offsets = {};
	for (const node of layout.nodes) offsets[node.value] = 0;
	return offsets;
}
