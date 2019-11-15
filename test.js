
const sync = require('./index.js'),
	assert = require('assert'),
	fs = require('fs.promisify');

let client = null, server = null;

fs.mkdir('./tmp').catch((e) => e).then(() => {
	return fs.readdir('./src');
}).then((src) => {
	console.log('files', src);
	let port = 5935;
	client = new sync.Client('./src', 'localhost:' + port);
	server = new sync.Server('./tmp', 'localhost:' + port);

	client.on('remove', (r) => {
		console.log('removed', r);
	});

	return new Promise((resolve) => {
		let i = 0;
		let get = (r, type) => {
			i++;
			console.log(i, src.length);
			if (i === src.length) {
				resolve();
			}
			console.log(type, r);
		};
		client.on('add', (r) => get(r, 'add'));
		client.on('valid', (r) => get(r, 'valid'));
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
		client.on('connect', () => {
			console.log('connected');
		});
		client.connect();
		return new Promise((resolve) => setTimeout(resolve, 1000)).then(() => {
			client.close();
			server.close();
			console.log('done');
			process.exit(0);
		});
	});
}).catch((err) => {
	throw err;
});
