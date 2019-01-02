
const path = require('path'),
	fs = require('fs.promisify'),
	sync = require('file.stream'),
	Think = require('think.library');

class Queue extends require('events') {

	constructor(dir, remote, tick = 1) {
		super();
		this._remote = remote;
		this._dir = path.resolve(dir);
		this._client = new sync.Client(this._remote);
		this._client.on('connect', (e) => this.emit('connect', e));
		this._client.on('error', (e) => this.emit('error', e));
		this._client.on('close', (e) => this.emit('close', e));
		this._queue = [];
		this.think = [];
		for (let i = 0; i < tick; i++) {
			this.think.push(new Think(() => {
				return this.tick();
			}, 500));
		}
	}

	tick() {
		if (this._queue.length === 0) {
			return null;
		}
		return this.push(this._queue.splice(0, 1)[0]).catch(() => {
			return this.tick();
		});
	}

	push(action) {
		let file = path.resolve(action.file),
			remote = file.replace(this._dir, '').replace(/\\{1,}/g, '/');

		if (action.type === 'remove') {
			return this._client.remove(remote).then(() => {
				this.emit('remove', remote);
			});
		}
		return new Promise((resolve) => {
			if (action.type === 'add') {
				fs.createReadStream(file)
					.pipe(this._client.createUploadStream(remote))
					.on('close', () => {
						resolve();
					});
			} else {
				throw new Error('unhandled type');
			}
		}).then(() => {
			this.emit('add', remote);
		});
	}

	remove(file) {
		this._queue.push({type: 'remove', file: file});
		return this;
	}

	add(file) {
		this._queue.push({type: 'add', file: file});
		return this;
	}

}

module.exports = Queue;
