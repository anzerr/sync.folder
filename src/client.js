
const Watcher = require('fs.watcher'),
	Queue = require('./queue.js');

class Client extends require('events') {

	constructor(dir, server, options) {
		super();
		this._queue = new Queue(dir, server, options);
		this._queue.on('remove', (a) => this.emit('remove', a));
		this._queue.on('add', (a) => this.emit('add', a));
		this._queue.on('connect', (a) => this.emit('connect', a));
		this._queue.on('error', (a) => this.emit('error', a));
		this._queue.on('close', (a) => this.emit('close', a));
		let exclude = options.exclude;
		this._watcher = new Watcher(dir, (file) => {
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
			if (r[0] === 'remove') {
				this._queue.remove(r[2]);
			}
		});
	}

	close() {
		this._queue.close();
	}

}

module.exports = Client;
