
const sync = require('./index.js');

let port = 5935;
new sync.Server('./bin', 'localhost:' + port);
let client = new sync.Client('./src', 'localhost:' + port);

client.on('remove', (r) => {
	console.log('removed', r);
});

client.on('add', (r) => {
	console.log('add', r);
});
