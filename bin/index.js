#!/usr/bin/env node

process.on('unhandledRejection', (reason, p) => {
	console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

const Cli = require('cli.util'),
	path = require('path'),
	url = require('url'),
	sync = require('../index.js'),
	Server = require('static.http');

let cli = new Cli(process.argv, {}), cwd = process.cwd();

if (cli.argument().is('client')) {
	let client = new sync.Client(path.join(cwd, cli.get('cwd')), cli.has('host') ? cli.get('host') : 'localhost:5935', {
		exclude: (file) => {
			if (file.match(/(\.git|node_modules)/)) {
				return false;
			}
			return true;
		},
		tick: 2,
		rate: 1000 / 60
	});
	client.on('remove', (r) => console.log('removed', r));
	client.on('add', (r) => console.log('add', r));
	client.on('change', (r) => console.log('change', r));

	client.on('error', (r) => console.log('error', r));
	client.on('close', (r) => {
		console.log('close', r);
		client.close();
		setTimeout(() => process.exit(0), 1000);
	});
	client.on('connect', (r) => console.log('connect', r));
	client.on('open', (r) => console.log('open', r));
	return;
}

if (cli.argument().is('server')) {
	let uri = cli.has('host') ? cli.get('host') : '0.0.0.0:5935',
		dir = path.join(cwd, cli.get('cwd'));

	let static = new Server(Number(url.parse(uri).port) + 1, dir)
		.on('log', console.log)
		.create().then(() => {
			console.log('Server started', static.static.port);
		});

	let server = new sync.Server(dir, uri);
	server.on('remove', (r) => console.log('removed', r));
	server.on('add', (r) => console.log('add', r));

	server.on('error', (r) => console.log('error', r));
	server.on('close', (r) => {
		console.log('close', r);
		server.close();
		static._server.close(); // fix
		setTimeout(() => process.exit(0), 1000);
	});
	server.on('connect', (r) => console.log('connect', r));
	server.on('open', (r) => console.log('open', r));
	return;
}
