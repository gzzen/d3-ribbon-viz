import { loadCSV } from '../../../src/model/DataLoader.js';
import DataProcessor from '../../../src/model/DataProcessor.js';
import * as metadata from '../../utils/metadata.js';
import AxisManager from './render/axes.js';
import { NodeRenderer } from './render/nodes.js';
import Legend from './render/legend.js';
import RibbonRenderer from './render/ribbons.js';
import Tooltip from './interaction/tooltip.js';
import BackgroundClickHandler from './interaction/handlers/background.js';
import SelectionManager from './interaction/selectionManager.js';
import OverlayRenderer from './interaction/overlay.js';
import NodeHoverHandler from './interaction/handlers/nodeHover.js';
import NodeClickHandler from './interaction/handlers/nodeClick.js';
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

		this.axisManager = new AxisManager(svg);
		this.legend = new Legend(svg);
		this.nodeRenderer = new NodeRenderer(svg, this.axisManager);
		this.ribbonRenderer = new RibbonRenderer(svg, this.axisManager, this.dataProcessor);

		this.render();

		const tooltip = new Tooltip();
		const bgClick = new BackgroundClickHandler(svg);
		const selMgr = new SelectionManager((selection) => {
			this.nodeRenderer.update(selMgr.getSelection());
		});
		const overlayRenderer = new OverlayRenderer(this.ribbonRenderer);
		const nodeHover = new NodeHoverHandler(overlayRenderer, this.ribbonRenderer);
		const nodeClick = new NodeClickHandler(selMgr, overlayRenderer, nodeHover);
		const ribbonHover = new RibbonHoverHandler(overlayRenderer, tooltip, this.dataProcessor);
		const ribbonClick = new RibbonClickHandler(overlayRenderer);

		bgClick.register(() => selMgr.clear());
		bgClick.register(() => overlayRenderer.unfreeze());

		this._nodeClick = nodeClick;
		this._nodeHover = nodeHover;
		this._selMgr = selMgr;
		this._ribbonHover = ribbonHover;
		this._ribbonClick = ribbonClick;

		this.nodeRenderer.attachInteractionHandlers(nodeClick, nodeHover, () => selMgr.getSelection());
		this.ribbonRenderer.attachInteractionHandlers(ribbonHover, ribbonClick);
	}

	update(attrs) {
		this.displayAttrs = this._buildAttrs(attrs);
		this.render();
		this.nodeRenderer.attachInteractionHandlers(this._nodeClick, this._nodeHover, () => this._selMgr.getSelection());
		this.ribbonRenderer.attachInteractionHandlers(this._ribbonHover, this._ribbonClick);
	}

	render() {
		const freqMap = new Map();
		for (const attr of this.displayAttrs) {
			freqMap.set(attr, this.dataProcessor.computeNodeFrequencies(attr));
		}

		this.axisManager.init(this.displayAttrs, freqMap);
		if (!this._legendInitialized) {
			this.legend.init(this.axisManager.axisLayouts);
			this._legendInitialized = true;
		} else {
			this.legend.update(this.axisManager.axisLayouts);
		}
		this.nodeRenderer.init();
		this.ribbonRenderer.init(this.nodeRenderer.colorScales);
	}

}
