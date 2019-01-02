#!/usr/bin/env node

process.on('unhandledRejection', (reason, p) => {
	console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

const Cli = require('cli.util'),
	path = require('path'),
	sync = require('../index.js');

let cli = new Cli(process.argv, {}), cwd = process.cwd();

if (cli.argument().is('client')) {
	let client = new sync.Client(path.join(cwd, cli.get('cwd')), cli.has('host') ? cli.get('host') : 'localhost:5935');
	client.on('remove', (r) => console.log('removed', r));
	client.on('add', (r) => console.log('add', r));
	client.on('change', (r) => console.log('change', r));
	return;
}

if (cli.argument().is('server')) {
	let server = new sync.Server(path.join(cwd, cli.get('cwd')), cli.has('host') ? cli.get('host') : '0.0.0.0:5935');
	server.on('remove', (r) => console.log('removed', r));
	server.on('add', (r) => console.log('add', r));
	return;
}
