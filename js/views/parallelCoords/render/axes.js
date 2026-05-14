import { getAttrLabel } from '../../../utils/metadata.js';
import { wrapLabel, NodeLayout, AxisLayout } from '../utils.js';
import { axis, viewport } from '../../../config.js';

const AXIS_TOP = axis.marginTop + axis.paddingInner;
const AXIS_BOTTOM = viewport.height - axis.marginBottom - axis.paddingInner;
export const AXIS_HEIGHT = AXIS_BOTTOM - AXIS_TOP;
const LABEL_Y = axis.marginTop - 10;


export default class AxisManager {

	constructor(vis) {
		this.axisGroup = vis.append('g').attr('class', 'axis-group');
		this._axisLayouts = [];
	}

	init(axisAttrs, freqMap) {
		this._computeLayouts(axisAttrs, freqMap);
		this.render();
	}

	update(axisAttrs, freqMap) {
		this._computeLayouts(axisAttrs, freqMap);
		this.render();
	}

	render() {
		const axes = this.axisGroup
			.selectAll('g.axis')
			.data(this._axisLayouts, d => d.attr);

		axes.exit().remove();

		const axesEnter = axes.enter()
			.append('g')
			.attr('class', 'axis');

		axesEnter.append('line')
			.attr('class', 'axis-line')
			.attr('y1', AXIS_TOP)
			.attr('y2', AXIS_BOTTOM);

		axesEnter.append('text')
			.attr('class', 'axis-label')
			.attr('y', LABEL_Y);

		const axesMerge = axesEnter.merge(axes);

		axesMerge.attr('transform', d => `translate(${d.x}, 0)`);

		axesMerge.select('line.axis-line')
			.attr('x1', 0)
			.attr('x2', 0);

		axesMerge.select('text.axis-label')
			.attr('x', 0)
			.text(d => getAttrLabel(d.attr))
			.call(wrapLabel, 20);
	}

	_computeLayouts(axisAttrs, freqMap) {
		this._axisLayouts = [];
		const axisCount = axisAttrs.length;
		const width = window.innerWidth - viewport.rightPad - viewport.sidebarWidth;
		const layoutWidth = width - axis.marginLeft - axis.marginRight;

		for (let i = 0; i < axisCount; i++) {
			const attr = axisAttrs[i];
			const x = axis.marginLeft + (i / (axisCount - 1)) * layoutWidth;
			const nodes = this._computeNodeLayout(freqMap.get(attr));
			this._axisLayouts.push(new AxisLayout(attr, x, nodes));
		}
	}

	_computeNodeLayout(freqs) {
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

	get axisLayouts() { return this._axisLayouts; }

	getAxisLayout(attr) {
		return this._axisLayouts.find(l => l.attr === attr) ?? null;
	}

	getNodeLayout(attr, value) {
		const axisLayout = this.getAxisLayout(attr);
		if (!axisLayout) return null;
		return axisLayout.nodes.find(n => n.value === value) ?? null;
	}

}
