
const sync = require('./index.js'),
	fs = require('fs.promisify');

process.on('unhandledRejection', (reason, p) => {
	console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

fs.mkdir('./tmp').catch((e) => e).then(() => {
	let port = 5935;
	new sync.Server('./tmp', 'localhost:' + port);
	let client = new sync.Client('./src', 'localhost:' + port);

	client.on('remove', (r) => {
		console.log('removed', r);
	});

	client.on('add', (r) => {
		console.log('add', r);
	});
});
