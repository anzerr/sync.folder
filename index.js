
const sync = require('file.stream'),
	Client = require('./src/client.js');

module.exports = {
	Server: sync.Server,
	Client: Client
};
