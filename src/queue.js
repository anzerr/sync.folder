
const path = require('path'),
	fs = require('fs.promisify'),
	sync = require('file.stream'),
	util = require('./util.js'),
	Think = require('think.library');

class Queue extends require('events') {

	constructor(dir, remote, option = {}) {
		super();
		this._remote = remote;
		this._dir = path.resolve(dir);
		this._client = new sync.Client(this._remote);
		this._client.on('connect', (e) => this.emit('connect', e))
			.on('error', (e) => this.emit('error', e))
			.on('close', (e) => this.emit('close', e));
		this._queue = [];
		this.think = [];
		let tick = option.tick || 2;
		for (let i = 0; i < tick; i++) {
			this.think.push(new Think(() => {
				if (this._queue.length === 0) {
					return new Promise((resolve) => setTimeout(resolve, option.rate || 500));
				}
				return this.tick();
			}, 1));
		}
	}

	tick() {
		if (this._queue.length === 0) {
			return null;
		}
		return this.push(this._queue.splice(0, 1)[0]).then(() => {
			if (this._queue.length !== 0) {
				return this.tick();
			}
		}).catch(() => {
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
		if (action.type === 'add') {
			return Promise.all([
				this._client.hash(remote),
				util.hash(file)
			]).then((res) => {
				if (res[0] !== res[1]) {
					return new Promise((resolve) => {
						fs.createReadStream(file)
							.pipe(this._client.createUploadStream(remote))
							.on('close', () => {
								resolve();
							});
					});
				}
			}).then(() => {
				this.emit('add', remote);
			});
		}
		throw new Error('unhandled type');
	}

	remove(file) {
		this._queue.push({type: 'remove', file: file});
		return this;
	}

	add(file) {
		this._queue.push({type: 'add', file: file});
		return this;
	}

	close() {
		for (let i in this.think) {
			this.think[i].stop();
		}
		this._client.close();
		return this;
	}

}

module.exports = Queue;
