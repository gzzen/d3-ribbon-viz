// ── Data classes ──────────────────────────────────────────────────────────────

export class NodeLayout {
	constructor(value, y, height) {
		this.value = value;
		this.y = y;
		this.height = height;
	}
}

export class AxisLayout {
	constructor(attr, x, nodes) {
		this.attr = attr;
		this.x = x;
		this.nodes = nodes;
	}
}

export class RibbonData {
	constructor(leftAttr, rightAttr, leftValue, rightValue,
		leftX, rightX, leftY1, leftY2, rightY1, rightY2, color, pathKey = null) {
		this.leftAttr = leftAttr;
		this.rightAttr = rightAttr;
		this.leftValue = leftValue;
		this.rightValue = rightValue;
		this.leftX = leftX;
		this.rightX = rightX;
		this.leftY1 = leftY1;
		this.leftY2 = leftY2;
		this.rightY1 = rightY1;
		this.rightY2 = rightY2;
		this.color = color;
		this._pathKey = pathKey;
	}

	get key() {
		return this._pathKey ?? `${this.leftAttr}:${this.leftValue}||${this.rightAttr}:${this.rightValue}`;
	}
}


// ── Helper functions ──────────────────────────────────────────────────────────

export function isSelectionActive(selection) {
	for (const attr in selection) {
		if (selection[attr].size > 0) return true;
	}
	return false;
}

// Wraps SVG text labels to a maximum character width per line.
export function wrapLabel(textSelection, maxChars) {
	textSelection.each(function () {
		const el = d3.select(this);
		const label = el.text();
		el.text('');

		const words = label.split(' ');
		const lines = [];
		let currentLine = '';

		for (const word of words) {
			const candidate = currentLine ? `${currentLine} ${word}` : word;
			if (candidate.length > maxChars && currentLine) {
				lines.push(currentLine);
				currentLine = word;
			} else {
				currentLine = candidate;
			}
		}
		if (currentLine) lines.push(currentLine);

		lines.forEach((line, i) => {
			el.append('tspan')
				.attr('x', 0)
				.attr('dy', i === 0 ? 0 : '1.2em')
				.text(line);
		});
	});
}
