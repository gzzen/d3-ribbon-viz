import { describe, it, expect, vi } from 'vitest';
import SelectorState, { MAX_ACTIVE } from '../../src/ui/selectorState.js';

const ALL  = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
const INIT = ['a', 'b', 'c'];

const make = (all = ALL, init = INIT) => new SelectorState(all, init);

describe('MAX_ACTIVE', () => {
	it('is a positive integer', () => {
		expect(Number.isInteger(MAX_ACTIVE)).toBe(true);
		expect(MAX_ACTIVE).toBeGreaterThan(0);
	});
});

describe('initial state', () => {
	it('active matches initialActive', () => {
		expect(make().getActive()).toEqual(INIT);
	});

	it('inactive is allAttrs minus active, in original order', () => {
		expect(make().getInactive()).toEqual(['d', 'e', 'f', 'g']);
	});

	it('clamps initialActive to MAX_ACTIVE', () => {
		const over = ['a', 'b', 'c', 'd', 'e', 'f'];
		const s = make(ALL, over);
		expect(s.getActive()).toHaveLength(MAX_ACTIVE);
	});

	it('silently drops attrs not present in allAttrs', () => {
		const s = make(ALL, ['a', 'UNKNOWN', 'b']);
		expect(s.getActive()).toEqual(['a', 'b']);
	});

	it('falls back to first attr when initialActive is empty', () => {
		const s = make(ALL, []);
		expect(s.getActive()).toHaveLength(1);
		expect(s.getActive()[0]).toBe(ALL[0]);
	});
});

describe('activate', () => {
	it('appends attr to the end of the active list', () => {
		const s = make();
		s.activate('d');
		expect(s.getActive()).toEqual(['a', 'b', 'c', 'd']);
	});

	it('removes attr from inactive', () => {
		const s = make();
		s.activate('d');
		expect(s.getInactive()).not.toContain('d');
	});

	it('is a no-op when attr is already active', () => {
		const s = make();
		s.activate('a');
		expect(s.getActive()).toEqual(INIT);
	});

	it('is a no-op when the list is at MAX_ACTIVE capacity', () => {
		const s = make(ALL, ['a', 'b', 'c', 'd', 'e']);
		s.activate('f');
		expect(s.getActive()).toHaveLength(MAX_ACTIVE);
		expect(s.getActive()).not.toContain('f');
	});
});

describe('deactivate', () => {
	it('removes attr from the active list', () => {
		const s = make();
		s.deactivate('b');
		expect(s.getActive()).toEqual(['a', 'c']);
	});

	it('attr reappears in inactive in dataset order', () => {
		const s = make();
		s.deactivate('a');
		expect(s.getInactive()).toContain('a');
		// 'a' is first in ALL, so it appears first in inactive
		expect(s.getInactive()[0]).toBe('a');
	});

	it('is a no-op when attr is not active', () => {
		const s = make();
		s.deactivate('g');
		expect(s.getActive()).toEqual(INIT);
	});

	it('is a no-op when it would remove the last active attr', () => {
		const s = make(ALL, ['a']);
		s.deactivate('a');
		expect(s.getActive()).toEqual(['a']);
	});
});

describe('toggle', () => {
	it('activates an inactive attr', () => {
		const s = make();
		s.toggle('d');
		expect(s.isActive('d')).toBe(true);
	});

	it('deactivates an active attr', () => {
		const s = make();
		s.toggle('b');
		expect(s.isActive('b')).toBe(false);
	});
});

describe('reorder', () => {
	it('moves an item forward', () => {
		const s = make();
		s.reorder(0, 2);
		expect(s.getActive()).toEqual(['b', 'c', 'a']);
	});

	it('moves an item backward', () => {
		const s = make();
		s.reorder(2, 0);
		expect(s.getActive()).toEqual(['c', 'a', 'b']);
	});

	it('is a no-op when fromIdx === toIdx', () => {
		const s = make();
		s.reorder(1, 1);
		expect(s.getActive()).toEqual(INIT);
	});

	it('is a no-op for out-of-range indices', () => {
		const s = make();
		s.reorder(-1, 0);
		s.reorder(0, 99);
		expect(s.getActive()).toEqual(INIT);
	});

	it('does not affect inactive order', () => {
		const s = make();
		const inactiveBefore = s.getInactive();
		s.reorder(0, 2);
		expect(s.getInactive()).toEqual(inactiveBefore);
	});
});

describe('isFull / isMinimal', () => {
	it('isFull is false below MAX_ACTIVE', () => {
		expect(make().isFull()).toBe(false);
	});

	it('isFull is true at MAX_ACTIVE', () => {
		const s = make(ALL, ['a', 'b', 'c', 'd', 'e']);
		expect(s.isFull()).toBe(true);
	});

	it('isMinimal is false above 1 active', () => {
		expect(make().isMinimal()).toBe(false);
	});

	it('isMinimal is true with exactly 1 active', () => {
		const s = make(ALL, ['a']);
		expect(s.isMinimal()).toBe(true);
	});
});

describe('getActive / getInactive return copies', () => {
	it('mutating the returned array does not affect state', () => {
		const s = make();
		s.getActive().push('INTRUDER');
		expect(s.getActive()).toHaveLength(INIT.length);
	});
});

describe('events', () => {
	it('activate fires change', () => {
		const cb = vi.fn();
		const s = make();
		s.on(cb);
		s.activate('d');
		expect(cb).toHaveBeenCalledTimes(1);
	});

	it('activate no-op does not fire', () => {
		const cb = vi.fn();
		const s = make();
		s.on(cb);
		s.activate('a'); // already active
		expect(cb).not.toHaveBeenCalled();
	});

	it('activate when full does not fire', () => {
		const cb = vi.fn();
		const s = make(ALL, ['a', 'b', 'c', 'd', 'e']);
		s.on(cb);
		s.activate('f');
		expect(cb).not.toHaveBeenCalled();
	});

	it('deactivate fires change', () => {
		const cb = vi.fn();
		const s = make();
		s.on(cb);
		s.deactivate('b');
		expect(cb).toHaveBeenCalledTimes(1);
	});

	it('deactivate no-op does not fire', () => {
		const cb = vi.fn();
		const s = make();
		s.on(cb);
		s.deactivate('g'); // not active
		expect(cb).not.toHaveBeenCalled();
	});

	it('deactivate last-attr no-op does not fire', () => {
		const cb = vi.fn();
		const s = make(ALL, ['a']);
		s.on(cb);
		s.deactivate('a');
		expect(cb).not.toHaveBeenCalled();
	});

	it('reorder fires change', () => {
		const cb = vi.fn();
		const s = make();
		s.on(cb);
		s.reorder(0, 2);
		expect(cb).toHaveBeenCalledTimes(1);
	});

	it('reorder same-index does not fire', () => {
		const cb = vi.fn();
		const s = make();
		s.on(cb);
		s.reorder(1, 1);
		expect(cb).not.toHaveBeenCalled();
	});

	it('off removes the listener', () => {
		const cb = vi.fn();
		const s = make();
		s.on(cb);
		s.off(cb);
		s.activate('d');
		expect(cb).not.toHaveBeenCalled();
	});

	it('multiple listeners all fire', () => {
		const a = vi.fn(), b = vi.fn();
		const s = make();
		s.on(a); s.on(b);
		s.activate('d');
		expect(a).toHaveBeenCalledTimes(1);
		expect(b).toHaveBeenCalledTimes(1);
	});
});
