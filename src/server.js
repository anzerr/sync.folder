
const sync = require('file.stream'),
	fs = require('fs.promisify'),
	path = require('path'),
	remove = require('fs.remove');

class Server extends require('events') {

	constructor(cwd, uri, cleanup = false) {
		super();
		this.dead = false;
		this._cwd = cwd;
		this._uri = uri;
		if (cleanup) {
			this.cleanup().then(() => this.init());
		} else {
			this.init();
		}
	}

	init() {
		this._server = new sync.Server(this._cwd, this._uri);
		this._server
			.on('remove', (a) => this.emit('remove', a))
			.on('add', (a) => this.emit('add', a))
			.on('error', (e) => this.emit('error', e))
			.on('open', (e) => this.emit('open', e))
			.on('close', (e) => this.emit('close', e));
	}

	cleanup() {
		return fs.readdir(this._cwd).then((list) => {
			let wait = [];
			for (let i in list) {
				wait.push(remove(path.join(this._cwd, list[i])));
			}
			return Promise.all(wait);
		});
	}

	close() {
		this.dead = true;
		this._server.close();
	}

}

module.exports = Server;
