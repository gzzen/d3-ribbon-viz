/**
 * Attribute selector — axis-aligned active row + collapsible inactive dropdown.
 *
 * Active boxes are absolutely positioned so each center aligns with its axis.
 * The target variable always appears at the rightmost axis, read-only.
 * Inactive attrs live in a scrollable dropdown toggled by a button at the
 * bottom of whichever row is currently visible.
 *
 * Call syncToLayouts(layouts, svgMarginLeft, svgWidth) after every render
 * so box positions track the axis coordinates.
 */

export default class AttributeSelector {

	constructor(container, state, labelFn, targetAttr) {
		this._container     = container;
		this._state         = state;
		this._labelFn       = labelFn;
		this._targetAttr    = targetAttr;
		this._expanded      = false;
		this._xMap          = null;
		this._svgMarginLeft = null;
		this._svgWidth      = null;
		this._dragSrcIdx    = null;

		state.on(() => this._render());
		this._render();
	}

	syncToLayouts(layouts, svgMarginLeft, svgWidth) {
		this._xMap          = new Map(layouts.map(l => [l.attr, l.x]));
		this._svgMarginLeft = svgMarginLeft;
		this._svgWidth      = svgWidth;
		this._render();
	}


	// ── Rendering ─────────────────────────────────────────────────────────────

	_render() {
		this._container.innerHTML = '';
		const wrapper = document.createElement('div');
		wrapper.className = 'attr-selector-wrapper';
		wrapper.appendChild(this._buildActiveRow());
		wrapper.appendChild(this._buildDropdown());
		this._container.appendChild(wrapper);
	}

	_buildActiveRow() {
		const row = document.createElement('div');
		row.className = 'attr-active-row';
		this._applySvgLayout(row);

		for (const [idx, attr] of this._state.getActive().entries()) {
			row.appendChild(this._buildActiveBox(attr, idx));
		}
		row.appendChild(this._buildTargetBox());
		return row;
	}

	_buildActiveBox(attr, idx) {
		const isLast = this._state.isMinimal();
		const x      = this._xMap?.get(attr) ?? null;

		const box = document.createElement('div');
		box.className = ['attr-box', 'attr-box--active', isLast ? 'attr-box--last' : '']
			.filter(Boolean).join(' ');
		box.textContent = this._labelFn(attr);
		box.title = isLast ? 'At least one attribute must remain active' : this._labelFn(attr);
		box.dataset.attr = attr;
		box.draggable = true;

		if (x !== null) {
			box.style.position  = 'absolute';
			box.style.left      = `${x}px`;
			box.style.top       = '50%';
			box.style.transform = 'translate(-50%, -50%)';
		}

		if (!isLast) box.addEventListener('click', () => this._state.toggle(attr));
		box.addEventListener('dragstart', e => this._onDragStart(e, idx));
		box.addEventListener('dragover',  e => this._onDragOver(e, idx));
		box.addEventListener('dragleave', e => e.currentTarget.classList.remove('attr-box--drag-over'));
		box.addEventListener('drop',      e => this._onDrop(e, idx));
		box.addEventListener('dragend',   () => this._onDragEnd());

		return box;
	}

	_buildTargetBox() {
		const x = this._xMap?.get(this._targetAttr) ?? null;

		const box = document.createElement('div');
		box.className = 'attr-box attr-box--target';
		box.textContent = this._labelFn(this._targetAttr);
		box.title = 'Target variable (read-only)';

		if (x !== null) {
			box.style.position  = 'absolute';
			box.style.left      = `${x}px`;
			box.style.top       = '50%';
			box.style.transform = 'translate(-50%, -50%)';
		}
		return box;
	}

	// SVG-width container that centres both the list and toggle button.
	_buildDropdown() {
		const wrap = document.createElement('div');
		wrap.className = 'attr-dropdown-wrap';
		this._applySvgLayout(wrap);
		wrap.appendChild(this._buildInactiveList());
		wrap.appendChild(this._buildToggleBtn());
		return wrap;
	}

	_buildInactiveList() {
		const list = document.createElement('div');
		list.className = ['attr-inactive-list', this._expanded ? 'expanded' : '']
			.filter(Boolean).join(' ');

		const isFull = this._state.isFull();
		for (const attr of this._state.getInactive()) {
			const item = document.createElement('button');
			item.className = ['attr-dropdown-item', isFull ? 'attr-dropdown-item--disabled' : '']
				.filter(Boolean).join(' ');
			item.textContent = this._labelFn(attr);
			item.disabled = isFull;
			item.title = isFull ? 'Remove an active attribute first (max 5)' : '';
			if (!isFull) item.addEventListener('click', () => this._state.toggle(attr));
			list.appendChild(item);
		}
		return list;
	}

	_buildToggleBtn() {
		const btn = document.createElement('button');
		btn.className = 'attr-toggle-btn';
		btn.textContent = this._expanded ? '▲ Hide' : '▼ Attributes';
		btn.addEventListener('click', () => {
			this._expanded = !this._expanded;
			const list = this._container.querySelector('.attr-inactive-list');
			if (list) list.classList.toggle('expanded', this._expanded);
			btn.textContent = this._expanded ? '▲ Hide' : '▼ Attributes';
		});
		return btn;
	}

	_applySvgLayout(el) {
		if (this._svgMarginLeft !== null) el.style.marginLeft = this._svgMarginLeft;
		if (this._svgWidth      !== null) el.style.width      = `${this._svgWidth}px`;
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
		if (idx !== this._dragSrcIdx) e.currentTarget.classList.add('attr-box--drag-over');
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
