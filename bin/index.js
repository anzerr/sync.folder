#!/usr/bin/env node

process.on('unhandledRejection', (reason, p) => {
	console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

const Cli = require('cli.util'),
	path = require('path'),
	url = require('url'),
	sync = require('../index.js'),
	util = require('./util.js'),
	{version} = require('../package.json'),
	fs = require('fs.promisify'),
	Server = require('static.http');

let cli = new Cli(process.argv, {}), cwd = process.cwd();

console.log(cli);

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
	uri = (uri.match(/^.*?:\/\//)) ? uri : 'tcp://' + uri;

	console.log('uri', uri);
	let static = new Server(Number(url.parse(uri).port) + 1, dir)
		.on('log', console.log)
		.create().then(() => {
			console.log('Server started');
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

if (cli.argument().is('dockerfile')) {
	fs.writeFile('Dockerfile', [
		'FROM node:11.1.0-alpine',
		'RUN ' + [
			'apk update',
			'apk upgrade',
			'apk add git bash',
			'mkdir -p /home/anzerr/workdir/',
			'cd /home/anzerr/',
			'git clone https://github.com/anzerr/sync.folder.git',
			'cd sync.folder',
			'git config --global url."https://github.com/".insteadOf git@github.com:',
			'git config --global url."https://".insteadOf git://',
			'git config --global url."https://".insteadOf ssh://',
			'npm install --only=prod'
		].join(' && '),
		'CMD node /home/anzerr/sync.folder/bin/index.js server --host 0.0.0.0:5970 --cwd /home/anzerr/wokrdir'
	].join('\n') + '\n').then(() => console.log('done')).catch(console.log);
}

if (cli.argument().is('build')) {
	util.exec('syncF dockerfile').then(() => {
		return util.exec('docker build --no-cache -t anzerr/env:' + version + ' -t anzerr/env:latest ..', {env: process.env});
	}).then(() => console.log('done')).catch(console.log);
}
