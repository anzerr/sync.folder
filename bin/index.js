#!/usr/bin/env node

const {Cli, Map} = require('cli.util'),
	path = require('path'),
	url = require('url'),
	sync = require('../index.js'),
	Server = require('static.http');

let cli = new Cli(process.argv, [
		new Map('host').alias(['h', 'H']).arg(),
		new Map('cwd').alias(['c', 'C']).arg()
	]), cwd = process.cwd();

if (cli.argument().is('client')) {
	let uri = cli.has('host') ? cli.get('host') : 'localhost:3000',
		dir = path.resolve(cli.get('cwd') || cwd),
		exclude = cli.has('exclude') ? new RegExp(cli.get('exclude')) : /(\.git|node_modules)/;

	console.log('client config', {dir: dir, uri: uri, exclude: exclude});
	let client = new sync.Client(dir, uri, {
		exclude: (file) => file.match(exclude) === null,
		tick: 2,
		rate: 1000 / 30
	});
	client.on('remove', (r) => console.log('remove', r));
	client.on('add', (r) => console.log('add', r));

	client.on('error', (r) => console.log('error', r.toString()));
	client.on('close', (r) => {
		console.log('close', r);
		client.connect();
	});
	client.on('connect', (r) => console.log('connect', r));
	client.on('open', (r) => console.log('open', r));
	return;
}

if (cli.argument().is('server')) {
	let uri = cli.has('host') ? cli.get('host') : '0.0.0.0:3000',
		dir = path.resolve(cli.get('cwd') || cwd);
	uri = (uri.match(/^.*?:\/\//)) ? uri : 'tcp://' + uri;

	new Server(Number(url.parse(uri).port) + 1, dir, 'html')
		.on('log', console.log)
		.create().then(() => {
			console.log('Server started');
		});

	console.log('server config', dir, uri);
	let server = new sync.Server(dir, '0.0.0.0:3000');
	server.on('remove', (r) => console.log('removed', r));
	server.on('add', (r) => console.log('add', r));

	server.on('error', (r) => console.log('error', r));
	server.on('close', (r) => {
		console.log('close', r);
		server.init();
	});
	server.on('connect', (r) => console.log('connect', r));
	server.on('open', (r) => console.log('open', r));
	return;
}

throw new Error('no valid argument given');
