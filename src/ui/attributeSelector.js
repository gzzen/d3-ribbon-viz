/**
 * Attribute selector strip — renders the active/inactive attribute boxes and
 * wires click and drag-to-reorder interactions to a SelectorState instance.
 *
 * Not unit-tested: it is a thin DOM layer over SelectorState, which is fully
 * tested independently.
 */
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
		this._dragSrcIdx = null;

		state.on(() => this._render());
		this._render();
	}


	// ── Rendering ─────────────────────────────────────────────────────────────

	_render() {
		this._container.innerHTML = '';

		const row = document.createElement('div');
		row.className = 'attr-selector';

		row.append(
			this._buildGroup('active'),
			this._buildDivider(),
			this._buildGroup('inactive'),
		);

		this._container.appendChild(row);
	}

	_buildGroup(type) {
		const group = document.createElement('div');
		group.className = `attr-group attr-group--${type}`;

		const attrs = type === 'active'
			? this._state.getActive()
			: this._state.getInactive();

		for (let i = 0; i < attrs.length; i++) {
			group.appendChild(this._buildBox(attrs[i], type, i));
		}

		return group;
	}

	_buildBox(attr, type, idx) {
		const isActive   = type === 'active';
		const isDisabled = !isActive && this._state.isFull();
		const isLast     = isActive && this._state.isMinimal();

		const box = document.createElement('div');
		box.className = [
			'attr-box',
			`attr-box--${type}`,
			isDisabled ? 'attr-box--disabled' : '',
			isLast     ? 'attr-box--last'     : '',
		].filter(Boolean).join(' ');

		box.textContent = this._labelFn(attr);
		box.dataset.attr = attr;

		if (isDisabled) {
			box.title = 'Remove an active attribute first (max 5)';
		} else if (isLast) {
			box.title = 'At least one attribute must remain active';
		} else {
			box.addEventListener('click', () => this._state.toggle(attr));
		}

		if (isActive) {
			box.draggable = true;
			box.addEventListener('dragstart',  e => this._onDragStart(e, idx));
			box.addEventListener('dragover',   e => this._onDragOver(e, idx));
			box.addEventListener('dragleave',  e => e.currentTarget.classList.remove('attr-box--drag-over'));
			box.addEventListener('drop',       e => this._onDrop(e, idx));
			box.addEventListener('dragend',    () => this._onDragEnd());
		}

		return box;
	}

	_buildDivider() {
		const d = document.createElement('div');
		d.className = 'attr-divider';
		return d;
	}


	// ── Drag handlers ─────────────────────────────────────────────────────────

	_onDragStart(e, idx) {
		this._dragSrcIdx = idx;
		e.dataTransfer.effectAllowed = 'move';
		// Defer class addition so it doesn't affect the drag ghost image.
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
