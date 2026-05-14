export default class BackgroundClickHandler {

	constructor(vis) {
		this.callbacks = [];
		vis.on('click.background', (event) => {
			if (event.target !== vis.node()) return;
			for (const cb of this.callbacks) cb();
		});
	}

	register(callback) {
		this.callbacks.push(callback);
	}

	unregister(callback) {
		this.callbacks = this.callbacks.filter(cb => cb !== callback);
	}

}
