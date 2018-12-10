
const util = require('./util.js'),
	Think = require('think.library');

class Queue {

	constructor(dir, remote) {
		this._remote = remote;
		this._dir = dir;
		this._queue = [];
		this.think = new Think(() => {
			if (this._queue.length === 0) {
				return null;
			}
			return this.push(this._queue.splice(0, 1)[0]).catch((e) => {
				console.log(e);
			});
		}, 500);
	}

	push(file) {
		let f = file.replace(this._dir, '').replace(/\\{1,}/g, '/');
		console.log('push', file, this._remote + '/' + f);
		return util.scp(file, this._remote + '/' + f);
	}

	add(file) {
		// let f = file.replace(/^(.{1}):\\/g, '/$1/').replace(/\\{1,}/g, '/');
		this._queue.push(file);
		return this;
	}

}

module.exports = Queue;
