
const path = require('path'),
	fs = require('./fs.js');

class Hook extends require('events') {

	constructor(file) {
		super();
		this._file = file;
	}

	setup() {
		return fs.stat(this._file).then((res) => {
			let dir = res.isDirectory();
			this.isDirectory = dir;
			if (!dir) {
				this.emit('change', ['add', dir, this._file]);
			}
			this._watcher = fs.watch(this._file, {recursive: true}, (eventType, filename) => {
				this.emit('change', [eventType, dir, (dir) ? path.join(this._file, filename) : this._file]);
			});
		});
	}

}

module.exports = Hook;
