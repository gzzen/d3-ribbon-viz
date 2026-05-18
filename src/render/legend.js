import { getAttrLabel, getAttrType, getLabel, getCategories, getNumericRange } from '../utils/metadata.js';
import { buildColorScale } from '../colors.js';
import { wrapLabel } from '../utils.js';
import { legend as legendCfg } from '../config.js';

export default class Legend {

	constructor(vis) {
		this.vis = vis;
	}

	init(layouts) {
		this.legendGroup = this.vis.append('g').attr('class', 'pc-legend');
		this.panelBackground = this.legendGroup.append('rect')
			.attr('class', 'legend-bg')
			.attr('x', 0).attr('y', 0)
			.attr('rx', 4).attr('ry', 4)
			.attr('fill', '#ffffff5e')
			.attr('stroke', '#ddd').attr('stroke-width', 1);
		this.contentGroup = this.legendGroup.append('g')
			.attr('transform', `translate(${legendCfg.panelPadding}, ${legendCfg.panelPadding})`);
		this._render(layouts);
	}

	update(layouts) {
		this.contentGroup.selectAll('*').remove();
		this._render(layouts);
	}

	_render(layouts) {
		let currentX = 0;
		let maxHeight = 0;

		for (const layout of layouts) {
			const type = getAttrType(layout.attr);
			const colorScale = buildColorScale(layout.attr);
			const col = this.contentGroup.append('g')
				.attr('transform', `translate(${currentX}, 0)`);

			col.append('text')
				.attr('x', 0).attr('y', 0)
				.attr('font-size', legendCfg.attrLabelFontSize)
				.attr('font-weight', 'bold')
				.attr('fill', legendCfg.attrLabelColor)
				.attr('dominant-baseline', 'hanging')
				.text(getAttrLabel(layout.attr))
				.call(wrapLabel, legendCfg.attrLabelWrapWidth);

			const contentStartY = legendCfg.attrLabelFontSize + legendCfg.labelContentPadding;
			const colHeight = type === 'categorical'
				? this._renderCategoricalLegend(col, layout.attr, colorScale, contentStartY)
				: this._renderGradientLegend(col, layout.attr, colorScale, contentStartY);

			maxHeight = Math.max(maxHeight, colHeight);
			currentX += legendCfg.columnWidth + legendCfg.columnGap;
		}

		const panelWidth = currentX - legendCfg.columnGap + legendCfg.panelPadding * 2;
		this.panelBackground
			.attr('width', panelWidth)
			.attr('height', maxHeight + legendCfg.panelPadding * 2);

		const svgWidth = +this.vis.attr('width');
		const legendX = (svgWidth - panelWidth) / 2;
		this.legendGroup.attr('transform', `translate(${legendX}, ${legendCfg.y})`);
	}

	_renderCategoricalLegend(col, attr, colorScale, startY) {
		let currentY = startY;
		for (const value of getCategories(attr)) {
			col.append('rect')
				.attr('x', 0).attr('y', currentY)
				.attr('width', legendCfg.swatchSize).attr('height', legendCfg.swatchSize)
				.attr('rx', 2).attr('fill', colorScale(value));
			col.append('text')
				.attr('x', legendCfg.swatchSize + legendCfg.swatchLabelGap)
				.attr('y', currentY + legendCfg.swatchSize / 2)
				.attr('dominant-baseline', 'middle')
				.attr('font-size', legendCfg.swatchFontSize)
				.attr('fill', legendCfg.swatchLabelColor)
				.text(getLabel(attr, value));
			currentY += legendCfg.swatchSize + legendCfg.swatchGap;
		}
		return currentY;
	}

	_renderGradientLegend(col, attr, colorScale, startY) {
		const values = getNumericRange(attr) ?? getCategories(attr);
		const gradientId = `legend-gradient-${attr}`;

		let defs = this.vis.select('defs');
		if (defs.empty()) defs = this.vis.append('defs');
		defs.select(`#${gradientId}`).remove();

		const gradient = defs.append('linearGradient')
			.attr('id', gradientId)
			.attr('x1', '0%').attr('x2', '0%')
			.attr('y1', '0%').attr('y2', '100%');

		const steps = 10;
		for (let i = 0; i <= steps; i++) {
			const valueIndex = Math.round((1 - i / steps) * (values.length - 1));
			gradient.append('stop')
				.attr('offset', `${(i / steps) * 100}%`)
				.attr('stop-color', colorScale(values[valueIndex]));
		}

		col.append('rect')
			.attr('x', 0).attr('y', startY)
			.attr('width', legendCfg.gradientBarWidth).attr('height', legendCfg.gradientBarHeight)
			.attr('rx', 2).attr('fill', `url(#${gradientId})`);

		const labelX = legendCfg.gradientBarWidth + legendCfg.gradientLabelGap;
		col.append('text')
			.attr('x', labelX).attr('y', startY + legendCfg.gradientLabelOffset)
			.attr('dominant-baseline', 'hanging')
			.attr('font-size', legendCfg.gradientLabelFontSize)
			.attr('fill', legendCfg.gradientLabelColor)
			.text(getLabel(attr, values[values.length - 1]));
		col.append('text')
			.attr('x', labelX).attr('y', startY + legendCfg.gradientBarHeight - legendCfg.gradientLabelOffset)
			.attr('dominant-baseline', 'auto')
			.attr('font-size', legendCfg.gradientLabelFontSize)
			.attr('fill', legendCfg.gradientLabelColor)
			.text(getLabel(attr, values[0]));

		return startY + legendCfg.gradientBarHeight;
	}

}
