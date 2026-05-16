/**
 * Attribute selector strip.
 *
 * Active group: fixed, full set always visible, drag-to-reorder.
 * Inactive group: paged — INACTIVE_PAGE items shown at a time,
 *   navigated with ← / → buttons.
 */

const INACTIVE_PAGE = 5;

export default class AttributeSelector {

	/**
	 * @param {HTMLElement} container
	 * @param {SelectorState} state
	 * @param {Function} labelFn - (attr: string) => string
	 */
	constructor(container, state, labelFn) {
		this._container = container;
		this._state = state;
		this._labelFn = labelFn;
		this._offset = 0;       // index of first visible inactive attr
		this._dragSrcIdx = null;

		state.on(() => {
			// clamp offset so it stays valid after the inactive list shrinks
			const max = Math.max(0, this._state.getInactive().length - INACTIVE_PAGE);
			this._offset = Math.min(this._offset, max);
			this._render();
		});
		this._render();
	}


	// ── Rendering ─────────────────────────────────────────────────────────────

	_render() {
		this._container.innerHTML = '';

		const row = document.createElement('div');
		row.className = 'attr-selector';

		row.append(
			this._buildActiveGroup(),
			this._buildDivider(),
			this._buildInactiveNav(),
		);

		this._container.appendChild(row);
	}

	_buildActiveGroup() {
		const group = document.createElement('div');
		group.className = 'attr-group attr-group--active';

		this._state.getActive().forEach((attr, idx) => {
			group.appendChild(this._buildBox(attr, idx));
		});

		return group;
	}

	_buildInactiveNav() {
		const inactive = this._state.getInactive();
		const total    = inactive.length;
		const page     = inactive.slice(this._offset, this._offset + INACTIVE_PAGE);
		const atStart  = this._offset === 0;
		const atEnd    = this._offset + INACTIVE_PAGE >= total;

		const nav = document.createElement('div');
		nav.className = 'attr-nav';

		const prevBtn = this._buildNavBtn('‹', !atStart, () => {
			this._offset = Math.max(0, this._offset - INACTIVE_PAGE);
			this._render();
		});

		const group = document.createElement('div');
		group.className = 'attr-group attr-group--inactive';
		page.forEach(attr => group.appendChild(this._buildInactiveBox(attr)));

		const nextBtn = this._buildNavBtn('›', !atEnd, () => {
			this._offset = Math.min(
				Math.max(0, total - INACTIVE_PAGE),
				this._offset + INACTIVE_PAGE,
			);
			this._render();
		});

		nav.append(prevBtn, group, nextBtn);
		return nav;
	}

	_buildBox(attr, idx) {
		const isLast = this._state.isMinimal();

		const box = document.createElement('div');
		box.className = ['attr-box', 'attr-box--active', isLast ? 'attr-box--last' : '']
			.filter(Boolean).join(' ');
		box.textContent = this._labelFn(attr);
		box.dataset.attr = attr;
		box.draggable = true;

		if (isLast) {
			box.title = 'At least one attribute must remain active';
		} else {
			box.addEventListener('click', () => this._state.toggle(attr));
		}

		box.addEventListener('dragstart',  e => this._onDragStart(e, idx));
		box.addEventListener('dragover',   e => this._onDragOver(e, idx));
		box.addEventListener('dragleave',  e => e.currentTarget.classList.remove('attr-box--drag-over'));
		box.addEventListener('drop',       e => this._onDrop(e, idx));
		box.addEventListener('dragend',    () => this._onDragEnd());

		return box;
	}

	_buildInactiveBox(attr) {
		const isDisabled = this._state.isFull();

		const box = document.createElement('div');
		box.className = ['attr-box', 'attr-box--inactive', isDisabled ? 'attr-box--disabled' : '']
			.filter(Boolean).join(' ');
		box.textContent = this._labelFn(attr);
		box.dataset.attr = attr;

		if (isDisabled) {
			box.title = 'Remove an active attribute first (max 5)';
		} else {
			box.addEventListener('click', () => this._state.toggle(attr));
		}

		return box;
	}

	_buildDivider() {
		const d = document.createElement('div');
		d.className = 'attr-divider';
		return d;
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
