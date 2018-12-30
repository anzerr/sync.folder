
const Watcher = require('fs.watcher'),
	Queue = require('./queue.js');

class Client extends require('events') {

	constructor(dir, server) {
		super();
		this._queue = new Queue(dir, server);
		this._queue.on('remove', (a) => this.emit('remove', a));
		this._queue.on('add', (a) => this.emit('add', a));
		this._watcher = new Watcher(dir).on('change', (r) => {
			if ((r[0] === 'add' || r[0] === 'change') && !r[1]) {
				this._queue.add(r[2]);
			}
			if (r[0] === 'remove') {
				this._queue.remove(r[2]);
			}
		});
	}

}

module.exports = Client;
