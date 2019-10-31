
const sync = require('./index.js'),
	assert = require('assert'),
	fs = require('fs.promisify');

let client = null, server = null;

fs.mkdir('./tmp').catch((e) => e).then(() => {
	return fs.readdir('./src');
}).then((src) => {
	let port = 5935;
	server = new sync.Server('./tmp', 'localhost:' + port);
	client = new sync.Client('./src', 'localhost:' + port);

	client.on('remove', (r) => {
		console.log('removed', r);
	});

	return new Promise((resolve) => {
		let i = 0;
		client.on('add', (r) => {
			i++;
			if (i === src.length) {
				resolve();
			}
			console.log('add', r);
		});
	});
}).then(() => {
	return Promise.all([
		fs.readdir('./tmp'),
		fs.readdir('./src')
	]);
}).then((res) => {
	assert.deepEqual(res[0], res[1]);
}).then(() => {
	client.close();
	client.once('close', () => {
		console.log('closed, client');
		client.connect();
		return new Promise((resolve) => setTimeout(resolve, 1000)).then(() => {
			client.close();
			server.close();
		});
	});
}).catch((err) => {
	throw err;
});
