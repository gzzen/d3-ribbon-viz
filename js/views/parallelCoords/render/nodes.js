import { getLabel } from '../../../utils/metadata.js';
import { buildColorScale } from '../colors.js';
import { isSelectionActive } from '../utils.js';
import { node as nodeCfg } from '../../../config.js';

export class NodeRenderer {

	constructor(vis, axisManager) {
		this.axisManager = axisManager;
		this.nodeGroup = vis.append('g').attr('class', 'node-group');
		this.colorScales = {};

		this._defineHoverFilter(vis);

		// floating label tooltip — styles in css/style.css under .pc-tooltip
		this.tooltip = d3.select('body').append('div').attr('class', 'pc-tooltip');
	}

	init() {
		this._setAxisColorScale();
		this.render({});
	}

	update(selection) {
		this._setAxisColorScale();
		this.render(selection);
	}

	render(selection) {
		const isActive = isSelectionActive(selection);

		const axisGroups = this.nodeGroup
			.selectAll('g.node-axis')
			.data(this.axisManager.axisLayouts, d => d.attr);

		axisGroups.exit().remove();

		const axisGroupsMerge = axisGroups.enter()
			.append('g').attr('class', 'node-axis')
			.merge(axisGroups);

		axisGroupsMerge.attr('transform', d => `translate(${d.x}, 0)`);

		axisGroupsMerge.each((layout, i, nodes) => {
			this._renderNodes(d3.select(nodes[i]), layout, selection, isActive);
		});
	}

	_renderNodes(axisGroup, layout, selection, isActive) {
		const { attr } = layout;
		const colorScale = this.colorScales[attr];
		const selectedVals = selection[attr] ?? new Set();

		const visibleNodes = layout.nodes.filter(d => d.height > 0);

		const nodes = axisGroup.selectAll('rect.node').data(visibleNodes, d => d.value);
		nodes.exit().remove();

		const nodesMerge = nodes.enter()
			.append('rect')
			.attr('class', 'node')
			.attr('rx', 2).attr('ry', 2)
			.style('cursor', 'pointer')
			.merge(nodes);

		nodesMerge
			.attr('x', -nodeCfg.width / 2)
			.attr('y', d => d.y)
			.attr('width', nodeCfg.width)
			.attr('height', d => d.height)
			.attr('fill', d => {
				const base = colorScale(d.value);
				if (!isActive || selectedVals.has(d.value)) return base;
				return d3.interpolate(base, nodeCfg.dimmedGrey)(nodeCfg.dimmedGreyAmount);
			})
			.attr('opacity', 1)
			.attr('stroke', d => selectedVals.has(d.value) ? nodeCfg.selectedStroke : 'none')
			.attr('stroke-width', d => selectedVals.has(d.value) ? nodeCfg.selectedStrokeWidth : 0)
			.attr('filter', 'none');
	}

	attachInteractionHandlers(clickHandler, hoverHandler, getSelection) {
		const tooltip = this.tooltip;

		this.nodeGroup.selectAll('rect.node')
			.on('click', (event, d) => {
				event.stopPropagation();
				const attr = d3.select(event.currentTarget.parentNode).datum().attr;
				clickHandler.onClick(attr, d.value);
			})
			.on('mouseover', (event, d) => {
				const attr = d3.select(event.currentTarget.parentNode).datum().attr;

				d3.select(event.currentTarget)
					.transition().duration(nodeCfg.hoverTransitionMs)
					.attr('x', -nodeCfg.widthHovered / 2)
					.attr('width', nodeCfg.widthHovered);

				d3.select(event.currentTarget)
					.attr('filter', `url(#${nodeCfg.hoverFilterId})`);

				tooltip.style('display', 'block').text(getLabel(attr, d.value));
				hoverHandler.onMouseover(attr, d.value, getSelection());
			})
			.on('mousemove', (event) => {
				tooltip
					.style('left', (event.pageX + 12) + 'px')
					.style('top', (event.pageY - 28) + 'px');
			})
			.on('mouseout', (event) => {
				d3.select(event.currentTarget)
					.transition().duration(nodeCfg.hoverTransitionMs)
					.attr('x', -nodeCfg.width / 2)
					.attr('width', nodeCfg.width);

				d3.select(event.currentTarget).attr('filter', 'none');
				tooltip.style('display', 'none');
				hoverHandler.onMouseout();
			});
	}

	_setAxisColorScale() {
		this.colorScales = {};
		for (const layout of this.axisManager.axisLayouts) {
			this.colorScales[layout.attr] = buildColorScale(layout.attr);
		}
	}

	_defineHoverFilter(vis) {
		let defs = vis.select('defs');
		if (defs.empty()) defs = vis.append('defs');
		if (!defs.select(`#${nodeCfg.hoverFilterId}`).empty()) return;

		const filter = defs.append('filter')
			.attr('id', nodeCfg.hoverFilterId)
			.attr('x', '-50%').attr('y', '-50%')
			.attr('width', '200%').attr('height', '200%');

		filter.append('feGaussianBlur')
			.attr('in', 'SourceAlpha').attr('stdDeviation', 4).attr('result', 'blur');
		filter.append('feOffset')
			.attr('in', 'blur').attr('dx', 0).attr('dy', 2).attr('result', 'offsetBlur');
		filter.append('feFlood')
			.attr('flood-color', 'rgba(0,0,0,0.45)').attr('result', 'color');
		filter.append('feComposite')
			.attr('in', 'color').attr('in2', 'offsetBlur')
			.attr('operator', 'in').attr('result', 'shadow');

		const merge = filter.append('feMerge');
		merge.append('feMergeNode').attr('in', 'shadow');
		merge.append('feMergeNode').attr('in', 'SourceGraphic');
	}

}
