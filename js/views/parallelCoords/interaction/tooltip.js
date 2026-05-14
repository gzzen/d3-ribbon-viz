import { parseKey } from '../ribbon/keys.js';

// Tooltip display — styles live in css/style.css under .pc-tooltip
export default class Tooltip {

	constructor() {
		this.div = d3.select('body').append('div').attr('class', 'pc-tooltip');
	}

	show(event, html) {
		this.div.style('display', 'block').html(html);
		this.move(event);
	}

	move(event) {
		this.div
			.style('left', (event.pageX + 12) + 'px')
			.style('top', (event.pageY - 28) + 'px');
	}

	hide() {
		this.div.style('display', 'none');
	}

}


// ── Tooltip content builder ───────────────────────────────────────────────────

export function buildTooltipContent(ribbonKey, dataProcessor) {
	const segments = parseKey(ribbonKey);
	const constraints = Object.fromEntries(segments.map(({ attr, value }) => [attr, value]));

	const count = dataProcessor.samples.filter(sample =>
		Object.entries(constraints).every(([attr, value]) => sample[attr] === value)
	).length;

	const lines = segments.map(({ attr, value }) => `<b>${attr}</b> = ${value}`);
	lines.push(`Count: ${count}`);
	return lines.join('<br>');
}
