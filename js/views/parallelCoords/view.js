import { loadCSV } from '../../../src/model/DataLoader.js';
import DataProcessor from '../../../src/model/DataProcessor.js';
import * as metadata from '../../utils/metadata.js';
import AxisRenderer from './render/axes.js';
import { computeLayouts } from './layout.js';
import { NodeRenderer } from './render/nodes.js';
import Legend from './render/legend.js';
import RibbonRenderer from './render/ribbons.js';
import Tooltip from './interaction/tooltip.js';
import BackgroundClickHandler from './interaction/handlers/background.js';
import InteractionState from './interaction/state.js';
import OverlayRenderer from './interaction/overlay.js';
import NodeHandlers from './interaction/handlers/node.js';
import { RibbonHoverHandler, RibbonClickHandler } from './interaction/handlers/ribbon.js';
import { data, viewport } from '../../config.js';

export default class ParallelCoordsView {

	constructor(containerSelector = '#pc-view', attrs = data.defaultAttrs) {
		this.containerSelector = containerSelector;
		this.displayAttrs = this._buildAttrs(attrs);
	}

	_buildAttrs(attrs) {
		return [...attrs.slice(0, 5).map(a => a === 'absences' ? 'absences_levels' : a), data.finalAttr];
	}

	async init() {
		await metadata.init();
		const samples = await loadCSV(data.csvPath, { idColumn: 'id' });
		this.dataProcessor = new DataProcessor(samples);

		// Design width matches AxisManager's coordinate system.
		// viewBox + CSS width lets the SVG scale without recomputing axis positions.
		const viewportWidth = window.innerWidth - viewport.rightPad - viewport.sidebarWidth;

		const svg = d3.select(this.containerSelector)
			.append('svg')
			.attr('viewBox', `0 0 ${viewportWidth} ${viewport.height}`)
			.style('width', viewport.svgWidthStyle)
			.style('height', 'auto')
			.style('margin-left', viewport.svgMarginLeft);

		this.axisRenderer = new AxisRenderer(svg);
		this.legend = new Legend(svg);
		this.nodeRenderer = new NodeRenderer(svg);
		this.ribbonRenderer = new RibbonRenderer(svg, this.dataProcessor);

		this.render();

		const tooltip = new Tooltip();
		const bgClick = new BackgroundClickHandler(svg);
		const state = new InteractionState();
		state.on('change', () => this.nodeRenderer.update(state.getSelection()));

		const overlayRenderer = new OverlayRenderer(this.ribbonRenderer);
		const nodeHandlers = new NodeHandlers(state, overlayRenderer, this.ribbonRenderer);
		const ribbonHover = new RibbonHoverHandler(state, overlayRenderer, tooltip, this.dataProcessor);
		const ribbonClick = new RibbonClickHandler(state, overlayRenderer);

		bgClick.register(() => {
			state.reset();
			overlayRenderer.clearH();
		});

		this._nodeHandlers = nodeHandlers;
		this._state = state;
		this._ribbonHover = ribbonHover;
		this._ribbonClick = ribbonClick;

		this.nodeRenderer.attachInteractionHandlers(nodeHandlers, () => state.getSelection());
		this.ribbonRenderer.attachInteractionHandlers(ribbonHover, ribbonClick);
	}

	update(attrs) {
		this.displayAttrs = this._buildAttrs(attrs);
		this.render();
		this.nodeRenderer.attachInteractionHandlers(this._nodeHandlers, () => this._state.getSelection());
		this.ribbonRenderer.attachInteractionHandlers(this._ribbonHover, this._ribbonClick);
	}

	render() {
		const freqMap = new Map();
		for (const attr of this.displayAttrs) {
			freqMap.set(attr, this.dataProcessor.computeNodeFrequencies(attr));
		}

		const viewWidth = window.innerWidth - viewport.rightPad - viewport.sidebarWidth;
		const layouts = computeLayouts(this.displayAttrs, freqMap, viewWidth);

		this.axisRenderer.render(layouts);
		if (!this._legendInitialized) {
			this.legend.init(layouts);
			this._legendInitialized = true;
		} else {
			this.legend.update(layouts);
		}
		this.nodeRenderer.init(layouts);
		this.ribbonRenderer.init(this.nodeRenderer.colorScales, layouts);
	}

}
