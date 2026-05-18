/**
 * Attribute selector — two-row layout.
 *
 * Active row: absolutely positioned boxes aligned to SVG axis centres.
 *   Rightmost box is the fixed target variable (not removable).
 * Inactive row: paged list, toggled by a tag-shaped button.
 */

const INACTIVE_PAGE = 6;

export default class AttributeSelector {

	/**
	 * @param {HTMLElement} container
	 * @param {SelectorState} state
	 * @param {Function} labelFn - (attr: string) => string
	 * @param {string} targetAttr - the fixed target-variable attribute key
	 */
	constructor(container, state, labelFn, targetAttr) {
		this._container = container;
		this._state = state;
		this._labelFn = labelFn;
		this._targetAttr = targetAttr;
		this._offset = 0;
		this._dragSrcIdx = null;
		this._inactiveVisible = false;
		this._layouts = null;
		this._viewWidth = null;
		this._svgMarginLeft = null;

		state.on(() => {
			const max = Math.max(0, this._state.getInactive().length - INACTIVE_PAGE);
			this._offset = Math.min(this._offset, max);
			this._render();
		});
		this._render();
	}

	/** Called after each chart render to align boxes with axis positions. */
	updateLayouts({ layouts, viewWidth, svgMarginLeft }) {
		this._layouts = layouts;
		this._viewWidth = viewWidth;
		this._svgMarginLeft = svgMarginLeft;
		this._render();
	}


	// ── Rendering ─────────────────────────────────────────────────────────────

	_render() {
		this._container.innerHTML = '';

		const panel = document.createElement('div');
		panel.className = 'attr-selector-panel';
		if (this._viewWidth !== null) {
			panel.style.marginLeft = this._svgMarginLeft;
			panel.style.width = `${this._viewWidth}px`;
		}

		panel.appendChild(this._buildActiveRow());
		if (this._inactiveVisible) {
			panel.appendChild(this._buildInactiveRow());
		}
		panel.appendChild(this._buildToggle());

		this._container.appendChild(panel);
	}

	_buildActiveRow() {
		const row = document.createElement('div');
		row.className = 'attr-active-row' + (this._inactiveVisible ? ' attr-active-row--open' : '');

		const axisX = new Map();
		if (this._layouts) {
			for (const layout of this._layouts) axisX.set(layout.attr, layout.x);
		}

		this._state.getActive().forEach((attr, idx) => {
			row.appendChild(this._buildActiveBox(attr, idx, axisX.get(attr) ?? null));
		});

		const targetX = this._layouts ? this._layouts[this._layouts.length - 1].x : null;
		row.appendChild(this._buildTargetBox(targetX));

		return row;
	}

	_buildInactiveRow() {
		const inactive = this._state.getInactive();
		const total    = inactive.length;
		const page     = inactive.slice(this._offset, this._offset + INACTIVE_PAGE);
		const atStart  = this._offset === 0;
		const atEnd    = this._offset + INACTIVE_PAGE >= total;

		const row = document.createElement('div');
		row.className = 'attr-inactive-row';

		const prevBtn = this._buildNavBtn('‹', !atStart, () => {
			this._offset = Math.max(0, this._offset - INACTIVE_PAGE);
			this._render();
		});

		const group = document.createElement('div');
		group.className = 'attr-group--inactive';
		page.forEach(attr => group.appendChild(this._buildInactiveBox(attr)));

		const nextBtn = this._buildNavBtn('›', !atEnd, () => {
			this._offset = Math.min(Math.max(0, total - INACTIVE_PAGE), this._offset + INACTIVE_PAGE);
			this._render();
		});

		row.append(prevBtn, group, nextBtn);
		return row;
	}

	_buildToggle() {
		const btn = document.createElement('button');
		btn.className = 'attr-row-toggle';
		btn.textContent = this._inactiveVisible ? '▲' : '▼';
		btn.title = this._inactiveVisible ? 'Hide more attributes' : 'Show more attributes';
		btn.addEventListener('click', () => {
			this._inactiveVisible = !this._inactiveVisible;
			this._render();
		});
		return btn;
	}


	// ── Box builders ──────────────────────────────────────────────────────────

	_buildActiveBox(attr, idx, x) {
		const isLast = this._state.isMinimal();

		const box = document.createElement('div');
		box.className = ['attr-box', 'attr-box--active', isLast ? 'attr-box--last' : '']
			.filter(Boolean).join(' ');
		box.textContent = this._labelFn(attr);
		box.title = isLast ? 'At least one attribute must remain active' : this._labelFn(attr);
		box.dataset.attr = attr;
		box.draggable = true;

		if (x !== null) box.style.left = `${x}px`;
		if (!isLast) box.addEventListener('click', () => this._state.toggle(attr));

		box.addEventListener('dragstart', e => this._onDragStart(e, idx));
		box.addEventListener('dragover',  e => this._onDragOver(e, idx));
		box.addEventListener('dragleave', e => e.currentTarget.classList.remove('attr-box--drag-over'));
		box.addEventListener('drop',      e => this._onDrop(e, idx));
		box.addEventListener('dragend',   () => this._onDragEnd());

		return box;
	}

	_buildTargetBox(x) {
		const box = document.createElement('div');
		box.className = 'attr-box attr-box--target';
		box.textContent = this._labelFn(this._targetAttr);
		box.title = 'Target variable (fixed)';
		if (x !== null) box.style.left = `${x}px`;
		return box;
	}

	_buildInactiveBox(attr) {
		const isDisabled = this._state.isFull();

		const box = document.createElement('div');
		box.className = ['attr-box', 'attr-box--inactive', isDisabled ? 'attr-box--disabled' : '']
			.filter(Boolean).join(' ');
		box.textContent = this._labelFn(attr);
		box.title = isDisabled ? 'Remove an active attribute first (max 5)' : this._labelFn(attr);
		box.dataset.attr = attr;

		if (!isDisabled) box.addEventListener('click', () => this._state.toggle(attr));
		return box;
	}

	_buildNavBtn(label, enabled, onClick) {
		const btn = document.createElement('button');
		btn.className = 'attr-nav-btn';
		btn.textContent = label;
		btn.disabled = !enabled;
		if (enabled) btn.addEventListener('click', onClick);
		return btn;
	}


	// ── Drag handlers ─────────────────────────────────────────────────────────

	_onDragStart(e, idx) {
		this._dragSrcIdx = idx;
		e.dataTransfer.effectAllowed = 'move';
		setTimeout(() => e.target.classList.add('attr-box--dragging'), 0);
	}

	_onDragOver(e, idx) {
		e.preventDefault();
		e.dataTransfer.dropEffect = 'move';
		this._clearDragOverHighlights();
		if (idx !== this._dragSrcIdx) {
			e.currentTarget.classList.add('attr-box--drag-over');
		}
	}

	_onDrop(e, toIdx) {
		e.preventDefault();
		if (this._dragSrcIdx !== null && this._dragSrcIdx !== toIdx) {
			this._state.reorder(this._dragSrcIdx, toIdx);
		}
	}

	_onDragEnd() {
		this._dragSrcIdx = null;
		this._clearDragOverHighlights();
		this._container.querySelectorAll('.attr-box--dragging')
			.forEach(el => el.classList.remove('attr-box--dragging'));
	}

	_clearDragOverHighlights() {
		this._container.querySelectorAll('.attr-box--drag-over')
			.forEach(el => el.classList.remove('attr-box--drag-over'));
	}

}
