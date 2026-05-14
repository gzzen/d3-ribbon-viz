export default class SelectionManager {

	constructor(onChange) {
		this.onChange = onChange;
		this.selection = {};
	}

	toggle(attr, value) {
		if (!this.selection[attr]) this.selection[attr] = new Set();

		if (this.selection[attr].has(value)) {
			this.selection[attr].delete(value);
			if (this.selection[attr].size === 0) delete this.selection[attr];
		} else {
			this.selection[attr].add(value);
		}

		this.onChange(this._format());
	}

	clear() {
		this.selection = {};
		this.onChange([]);
	}

	getSelection() {
		return this.selection;
	}

	isSelected(attr, value) {
		return !!(this.selection[attr] && this.selection[attr].has(value));
	}

	hasSelection() {
		for (const attr in this.selection) {
			if (this.selection[attr].size > 0) return true;
		}
		return false;
	}

	_format() {
		const result = [];
		for (const attr in this.selection) {
			if (this.selection[attr].size > 0) {
				result.push({ [attr]: [...this.selection[attr]] });
			}
		}
		return result;
	}

}
