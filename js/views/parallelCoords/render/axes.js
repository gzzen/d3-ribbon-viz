import { getAttrLabel } from '../../../utils/metadata.js';
import { wrapLabel } from '../utils.js';
import { axis, viewport } from '../../../config.js';

const AXIS_TOP = axis.marginTop + axis.paddingInner;
const AXIS_BOTTOM = viewport.height - axis.marginBottom - axis.paddingInner;
const LABEL_Y = axis.marginTop - 10;

export default class AxisRenderer {

	constructor(vis) {
		this.axisGroup = vis.append('g').attr('class', 'axis-group');
	}

	/** Bind and update SVG axis lines and labels from pre-computed layouts. */
	render(layouts) {
		const axes = this.axisGroup
			.selectAll('g.axis')
			.data(layouts, d => d.attr);

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

}
