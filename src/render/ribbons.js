import { computeAllRibbons } from '../ribbon/compute.js';
import { parseKey } from '../ribbon/keys.js';
import { isSelectionActive } from '../utils.js';
import { ribbon as ribbonCfg } from '../config.js';

export default class RibbonRenderer {

	constructor(vis, dataProcessor) {
		this.dataProcessor = dataProcessor;
		this.ribbonGroup = vis.insert('g', '.node-group').attr('class', 'ribbon-group');
	}

	init(colorScales, layouts, axisHeight) {
		this.colorScales = colorScales;
		this._layouts = layouts;
		this._axisHeight = axisHeight;
		this.render({});
	}

	update(colorScales, selection) {
		this.colorScales = colorScales;
		this.render(selection);
	}

	render(selection) {
		const isActive = isSelectionActive(selection);

		// colorFn is the only D3 call remaining — kept here to avoid importing d3 in compute.js
		const colorFn = (la, lv, ra, rv) =>
			d3.interpolate(this.colorScales[la](lv), this.colorScales[ra](rv))(0.5);

		const allRibbons = computeAllRibbons(this._layouts, this.dataProcessor.samples, colorFn, this._axisHeight);

		for (const ribbon of allRibbons) {
			ribbon.isHighlighted = this._matchesSelection(ribbon, selection, isActive);
		}

		const paths = this.ribbonGroup
			.selectAll('path.ribbon')
			.data(allRibbons, d => d.key);

		paths.exit().remove();

		paths.enter()
			.append('path').attr('class', 'ribbon')
			.merge(paths)
			.attr('d', d => this._buildRibbonPath(d))
			.attr('fill', d => d.color)
			.attr('opacity', d => d.isHighlighted ? ribbonCfg.baseOpacity : ribbonCfg.dimmedOpacity)
			.attr('stroke', 'none');
	}

	// A ribbon is consistent with the selection if, for every axis present in
	// both its key and the selection, its value is one of the selected values.
	// Axes outside the ribbon's span are not checked (they can't be inconsistent).
	_matchesSelection(ribbon, selection, isActive) {
		if (!isActive) return true;
		for (const { attr, value } of parseKey(ribbon.key)) {
			const selected = selection[attr];
			if (selected && selected.size > 0 && !selected.has(value)) return false;
		}
		return true;
	}

	_buildRibbonPath({ leftX, rightX, leftY1, leftY2, rightY1, rightY2 }) {
		const midX = (leftX + rightX) / 2;
		return [
			`M ${leftX} ${leftY1} C ${midX} ${leftY1}, ${midX} ${rightY1}, ${rightX} ${rightY1}`,
			`L ${rightX} ${rightY2}`,
			`C ${midX} ${rightY2}, ${midX} ${leftY2}, ${leftX} ${leftY2}`,
			'Z',
		].join(' ');
	}

	attachInteractionHandlers(hoverHandler, clickHandler) {
		this.ribbonGroup.selectAll('path.ribbon')
			.on('mouseover', (event, d) => hoverHandler.onMouseover(d, event))
			.on('mousemove', (event) => hoverHandler.onMousemove(event))
			.on('mouseout', () => hoverHandler.onMouseout())
			.on('click', (event, d) => clickHandler.onClick(d, event));
	}

}
