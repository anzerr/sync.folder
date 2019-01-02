
const sync = require('file.stream'),
	fs = require('fs.promisify'),
	path = require('path'),
	remove = require('fs.remove');

class Server extends require('events') {

	constructor(cwd, uri) {
		super();
		fs.readdir(cwd).then((list) => {
			let wait = [];
			for (let i in list) {
				wait.push(remove(path.join(cwd, list[i])));
			}
			return Promise.all(wait);
		}).then(() => {
			this._server = new sync.Server(cwd, uri);
			this._server.on('remove', (a) => this.emit('remove', a));
			this._server.on('add', (a) => this.emit('add', a));
		});
	}

}

module.exports = Server;
