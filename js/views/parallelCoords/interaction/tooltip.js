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
	const segments = ribbonKey.split('||');
	const constraints = {};

	for (const segment of segments) {
		const colonIdx = segment.indexOf(':');
		constraints[segment.slice(0, colonIdx)] = segment.slice(colonIdx + 1);
	}

	let count = 0;
	for (const sample of dataProcessor.samples) {
		let match = true;
		for (const attr in constraints) {
			if (sample[attr] !== constraints[attr]) { match = false; break; }
		}
		if (match) count++;
	}

	const lines = segments.map(seg => {
		const colonIdx = seg.indexOf(':');
		return `<b>${seg.slice(0, colonIdx)}</b> = ${seg.slice(colonIdx + 1)}`;
	});
	lines.push(`Count: ${count}`);
	return lines.join('<br>');
}
