
const sync = require('file.stream'),
	remove = require('fs.remove');

class Server {

	constructor(cwd, uri) {
		remove(cwd).then(() => {
			this._server = new sync.Server(cwd, uri);
		});
	}

}

module.exports = Server;
