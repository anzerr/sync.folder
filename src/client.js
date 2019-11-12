
const Watcher = require('fs.watcher'),
	Queue = require('./client/queue.js');

class Client extends require('events') {

	constructor(dir, server, options = {}) {
		super();
		this._dir = dir;
		this._server = server;
		this._options = options;
		this.connect();
	}

	connect() {
		this._queue = new Queue(this._dir, this._server, this._options);
		this._queue.on('remove', (a) => this.emit('remove', a))
			.on('add', (a) => this.emit('add', a))
			.on('connect', (a) => this.emit('connect', a))
			.on('error', (a) => this.emit('error', a))
			.on('close', (a) => this.emit('close', a));

		let exclude = this._options.exclude;
		this._watcher = new Watcher(this._dir, (file) => {
			this.emit('exclude', file);
			if (exclude && !exclude(file)) {
				return false;
			}
			return true;
		}).on('change', (r) => {
			this._queue.emit('change', r);
			if ((r[0] === 'add' || r[0] === 'change') && !r[1]) {
				this._queue.add(r[2]);
			}
			if (r[0] === 'removed') {
				this._queue.remove(r[1]);
			}
		});
	}

	close() {
		this._watcher.close();
		this._queue.close();
	}

}

module.exports = Client;
