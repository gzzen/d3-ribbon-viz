import { AXIS_HEIGHT } from './axes.js';
import { isSelectionActive, RibbonData } from '../utils.js';
import { ribbon as ribbonCfg } from '../../../config.js';

export default class RibbonRenderer {

	constructor(vis, axisManager, dataProcessor) {
		this.axisManager = axisManager;
		this.dataProcessor = dataProcessor;
		this.ribbonGroup = vis.insert('g', '.node-group').attr('class', 'ribbon-group');
	}

	init(colorScales) {
		this.colorScales = colorScales;
		this.render({});
	}

	update(colorScales, selection) {
		this.colorScales = colorScales;
		this.render(selection);
	}

	render(selection) {
		const layouts = this.axisManager.axisLayouts;
		const isActive = isSelectionActive(selection);
		const allRibbons = [];
		let sampleGroups = new Map([['', this.dataProcessor.samples]]);

		for (let i = 0; i < layouts.length - 1; i++) {
			const result = this._computeRibbons(layouts[i], layouts[i + 1], sampleGroups);
			for (const ribbon of result.ribbons) {
				ribbon.isHighlighted = this._ribbonMatchesSelection(ribbon, selection, isActive);
				allRibbons.push(ribbon);
			}
			sampleGroups = result.nextSampleGroups;
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

	_computeRibbons(leftLayout, rightLayout, sampleGroups) {
		const totalSamples = this.dataProcessor.samples.length;
		const ribbons = [];
		const nextSampleGroups = new Map();
		const leftOffsets = this._initOffsets(leftLayout);
		const rightOffsets = this._initOffsets(rightLayout);

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

					const leftHeight = (count / totalSamples) * AXIS_HEIGHT;
					const rightHeight = (count / totalSamples) * AXIS_HEIGHT;
					const leftY1 = leftNode.y + leftOffsets[leftNode.value];
					const rightY1 = rightNode.y + rightOffsets[rightNode.value];
					const color = d3.interpolate(
						this.colorScales[leftLayout.attr](leftNode.value),
						this.colorScales[rightLayout.attr](rightNode.value)
					)(0.5);

					ribbons.push(new RibbonData(
						leftLayout.attr, rightLayout.attr,
						leftNode.value, rightNode.value,
						leftLayout.x, rightLayout.x,
						leftY1, leftY1 + leftHeight,
						rightY1, rightY1 + rightHeight,
						color,
						`${newPathKey}||${rightLayout.attr}:${rightNode.value}`
					));

					leftOffsets[leftNode.value] += leftHeight;
					rightOffsets[rightNode.value] += rightHeight;
				}
			}
		}

		return { ribbons, nextSampleGroups };
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

	_initOffsets(layout) {
		const offsets = {};
		for (const node of layout.nodes) offsets[node.value] = 0;
		return offsets;
	}

	_ribbonMatchesSelection(ribbon, selection, isActive) {
		if (!isActive) return true;
		for (const segment of ribbon.key.split('||')) {
			const colonIdx = segment.indexOf(':');
			const attr = segment.slice(0, colonIdx);
			const value = segment.slice(colonIdx + 1);
			const selected = selection[attr];
			if (selected && selected.size > 0 && !selected.has(value)) return false;
		}
		return true;
	}

	attachInteractionHandlers(hoverHandler, clickHandler) {
		this.ribbonGroup.selectAll('path.ribbon')
			.on('mouseover', (event, d) => hoverHandler.onMouseover(d, event))
			.on('mousemove', (event) => hoverHandler.onMousemove(event))
			.on('mouseout', () => hoverHandler.onMouseout())
			.on('click', (event, d) => clickHandler.onClick(d, event));
	}

}
