import { describe, it, expect, vi } from 'vitest';
import InteractionState from '../../src/interaction/state.js';

function makeState() { return new InteractionState(); }

describe('InteractionState — initial state', () => {
	it('has no selection', () => {
		expect(makeState().hasSelection()).toBe(false);
	});

	it('is not frozen', () => {
		expect(makeState().isFrozen()).toBe(false);
	});

	it('getState reflects empty state', () => {
		const s = makeState().getState();
		expect(s.isFrozen).toBe(false);
		expect(s.frozenKeys).toEqual([]);
		expect(Object.keys(s.selection)).toHaveLength(0);
	});
});

describe('InteractionState — selection', () => {
	it('toggle adds an attr-value pair', () => {
		const state = makeState();
		state.toggle('grade', 'A');
		expect(state.isSelected('grade', 'A')).toBe(true);
		expect(state.hasSelection()).toBe(true);
	});

	it('toggle again removes the same pair', () => {
		const state = makeState();
		state.toggle('grade', 'A');
		state.toggle('grade', 'A');
		expect(state.isSelected('grade', 'A')).toBe(false);
		expect(state.hasSelection()).toBe(false);
	});

	it('toggle supports multiple values per attr (OR within axis)', () => {
		const state = makeState();
		state.toggle('grade', 'A');
		state.toggle('grade', 'B');
		expect(state.isSelected('grade', 'A')).toBe(true);
		expect(state.isSelected('grade', 'B')).toBe(true);
	});

	it('toggle supports multiple attrs (AND across axes)', () => {
		const state = makeState();
		state.toggle('grade', 'A');
		state.toggle('study', '2');
		const sel = state.getSelection();
		expect(sel['grade'].has('A')).toBe(true);
		expect(sel['study'].has('2')).toBe(true);
	});

	it('removing the last value for an attr removes the attr key', () => {
		const state = makeState();
		state.toggle('grade', 'A');
		state.toggle('grade', 'A');
		expect(state.getSelection()['grade']).toBeUndefined();
	});

	it('clear empties all selection', () => {
		const state = makeState();
		state.toggle('grade', 'A');
		state.toggle('study', '2');
		state.clear();
		expect(state.hasSelection()).toBe(false);
	});
});

describe('InteractionState — freeze', () => {
	it('freeze sets isFrozen and stores keys', () => {
		const state = makeState();
		state.freeze(['a:1||b:2', 'a:1||b:3']);
		expect(state.isFrozen()).toBe(true);
		expect(state.getFrozenKeys()).toEqual(['a:1||b:2', 'a:1||b:3']);
	});

	it('unfreeze clears frozen state', () => {
		const state = makeState();
		state.freeze(['a:1||b:2']);
		state.unfreeze();
		expect(state.isFrozen()).toBe(false);
		expect(state.getFrozenKeys()).toEqual([]);
	});

	it('isFrozenRelated is false when not frozen', () => {
		expect(makeState().isFrozenRelated('a:1||b:2')).toBe(false);
	});

	it('isFrozenRelated matches exact key', () => {
		const state = makeState();
		state.freeze(['a:1||b:2']);
		expect(state.isFrozenRelated('a:1||b:2')).toBe(true);
	});

	it('isFrozenRelated matches ancestor of frozen key', () => {
		const state = makeState();
		state.freeze(['a:1||b:2||c:3']);
		expect(state.isFrozenRelated('a:1||b:2')).toBe(true);
	});

	it('isFrozenRelated matches descendant of frozen key', () => {
		const state = makeState();
		state.freeze(['a:1||b:2']);
		expect(state.isFrozenRelated('a:1||b:2||c:3')).toBe(true);
	});

	it('isFrozenRelated is false for unrelated keys', () => {
		const state = makeState();
		state.freeze(['a:1||b:2']);
		expect(state.isFrozenRelated('a:2||b:2')).toBe(false);
	});
});

describe('InteractionState — reset', () => {
	it('reset clears both selection and freeze', () => {
		const state = makeState();
		state.toggle('grade', 'A');
		state.freeze(['a:1']);
		state.reset();
		expect(state.hasSelection()).toBe(false);
		expect(state.isFrozen()).toBe(false);
	});
});

describe('InteractionState — events', () => {
	it('toggle emits change', () => {
		const state = makeState();
		const cb = vi.fn();
		state.on('change', cb);
		state.toggle('grade', 'A');
		expect(cb).toHaveBeenCalledTimes(1);
	});

	it('clear emits change', () => {
		const state = makeState();
		const cb = vi.fn();
		state.on('change', cb);
		state.clear();
		expect(cb).toHaveBeenCalledTimes(1);
	});

	it('freeze emits change', () => {
		const state = makeState();
		const cb = vi.fn();
		state.on('change', cb);
		state.freeze(['a:1']);
		expect(cb).toHaveBeenCalledTimes(1);
	});

	it('unfreeze emits change', () => {
		const state = makeState();
		const cb = vi.fn();
		state.on('change', cb);
		state.unfreeze();
		expect(cb).toHaveBeenCalledTimes(1);
	});

	it('reset emits a single change (not two)', () => {
		const state = makeState();
		const cb = vi.fn();
		state.on('change', cb);
		state.reset();
		expect(cb).toHaveBeenCalledTimes(1);
	});

	it('off removes the listener', () => {
		const state = makeState();
		const cb = vi.fn();
		state.on('change', cb);
		state.off('change', cb);
		state.toggle('grade', 'A');
		expect(cb).not.toHaveBeenCalled();
	});

	it('multiple listeners all fire', () => {
		const state = makeState();
		const a = vi.fn(), b = vi.fn();
		state.on('change', a);
		state.on('change', b);
		state.toggle('x', '1');
		expect(a).toHaveBeenCalledTimes(1);
		expect(b).toHaveBeenCalledTimes(1);
	});
});
