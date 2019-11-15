#!/usr/bin/env node

const {Cli, Map} = require('cli.util'),
	path = require('path'),
	url = require('url'),
	fs = require('fs.promisify'),
	sync = require('../index.js'),
	Server = require('static.http');

class Bin {

	log(...arg) {
		console.log(...arg);
	}

	hook(obj, cd) {
		obj.on('remove', (r) => this.log('removed', r));
		obj.on('add', (r) => this.log('add', r));
		obj.on('valid', (r) => this.log('valid', r));

		obj.on('error', (r) => this.log('error', r));
		obj.on('close', (r) => {
			this.log('close', r);
			cd();
		});
		obj.on('connect', (r) => this.log('connect', r));
		obj.on('open', (r) => this.log('open', r));
	}

	client(dir, uri, exclude) {
		this.log('client config', {dir: dir, uri: uri, exclude: exclude});
		let client = new sync.Client(dir, uri, {
			exclude: (file) => file.match(exclude) === null,
			tick: 2,
			rate: 1000 / 30
		});
		this.hook(client, () => client.connect());
	}

	server(dir, uri) {
		new Server(Number(url.parse(uri).port) + 1, dir, 'html')
			.on('log', (...arg) => this.log(...arg))
			.create().then(() => this.log('Server started'));

		this.log('server config', dir, uri);
		let server = new sync.Server(dir, uri);
		this.hook(server, () => server.init());
	}

	save(file, data) {
		return this.load(file).then((res) => {
			res[data.uri] = data;
			res[data.uri].exclude = data.exclude.toString();
			return fs.writeFile(file, JSON.stringify(res, null, '\t'));
		});
	}

	load(file) {
		return fs.readFile(file).then((res) => {
			return JSON.parse(res.toString());
		}).catch(() => ({}));
	}

}

let cli = new Cli(process.argv, [
		new Map('host').alias(['h', 'H']).arg(),
		new Map('cwd').alias(['c', 'C']).arg(),
		new Map('exclude').alias(['e', 'E']).arg(),
		new Map('name').alias(['n', 'N']).arg(),
		new Map('save').alias(['s', 'S']),
		new Map('load').alias(['l', 'L'])
	]), cwd = process.cwd(), bin = new Bin();

if (cli.argument().is('client')) {
	let uri = cli.has('host') ? cli.get('host') : 'localhost:3000',
		dir = path.resolve(cli.get('cwd') || cwd),
		exclude = cli.has('exclude') ? new RegExp(cli.get('exclude')) : /(\.git|node_modules)/,
		name = cli.has('name') ? cli.get('name') : 'sync.json';

	if (cli.has('load')) {
		return bin.load(name).then((res) => {
			for (let i in res) {
				bin.client(res[i].dir, res[i].uri, new RegExp(res[i].exclude.slice(1, -1)));
			}
		});
	}

	if (cli.has('save')) {
		return bin.save(name, {dir: dir, uri: uri, exclude: exclude}).then(() => bin.client(dir, uri, exclude));
	}
	return bin.client(dir, uri, exclude);
}

if (cli.argument().is('server')) {
	let uri = cli.has('host') ? cli.get('host') : '0.0.0.0:3000',
		dir = path.resolve(cli.get('cwd') || cwd);

	return bin.server(dir, (uri.match(/^.*?:\/\//)) ? uri : 'tcp://' + uri);
}

throw new Error('no valid argument given');
