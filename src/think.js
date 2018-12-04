
class Think {

	constructor(callback, time) {
		this._callback = callback;
		this._time = time;
		this._running = true;
		this._run();
	}

	stop() {
		this._running = false;
		return this;
	}

	start() {
		if (!this._running) {
			this._running = true;
			this._run();
			return true;
		}
		return false;
	}

	_run() {
		if (!this._running) {
			return;
		}

		let tmp = this._callback();
		if (tmp instanceof Promise) {
			tmp.then(() => {
				setTimeout(() => {
					this._run();
				}, this._time);
			}).catch(() => {
				setTimeout(() => {
					this._run();
				}, this._time);
			});
		} else {
			setTimeout(() => {
				this._run();
			}, this._time);
		}
	}

}

module.exports = Think;

