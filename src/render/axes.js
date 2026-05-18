import { getAttrLabel } from '../utils/metadata.js';
import { wrapLabel } from '../utils.js';

export default class AxisRenderer {

	constructor(vis) {
		this.axisGroup = vis.append('g').attr('class', 'axis-group');
	}

	/** Bind and update SVG axis lines and labels from pre-computed layouts. */
	render(layouts, { axisTop, axisBottom, labelY }) {
		const axes = this.axisGroup
			.selectAll('g.axis')
			.data(layouts, d => d.attr);

		axes.exit().remove();

		const axesEnter = axes.enter()
			.append('g')
			.attr('class', 'axis');

		axesEnter.append('line')
			.attr('class', 'axis-line')
			.attr('y1', axisTop)
			.attr('y2', axisBottom);


		const axesMerge = axesEnter.merge(axes);

		axesMerge.attr('transform', d => `translate(${d.x}, 0)`);
	}

}
