
const sync = require('file.stream'),
	remove = require('fs.remove');

class Server extends require('events') {

	constructor(cwd, uri) {
		super();
		remove(cwd).then(() => {
			this._server = new sync.Server(cwd, uri);
			this._server.on('remove', (a) => this.emit('remove', a));
			this._server.on('add', (a) => this.emit('add', a));
		});
	}

}

module.exports = Server;
