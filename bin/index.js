#!/usr/bin/env node

process.on('unhandledRejection', (reason, p) => {
	console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

const {Cli, Map} = require('cli.util'),
	path = require('path'),
	url = require('url'),
	sync = require('../index.js'),
	util = require('./util.js'),
	{version} = require('../package.json'),
	fs = require('fs.promisify'),
	Server = require('static.http');

let cli = new Cli(process.argv, [
		new Map('host').alias(['h', 'H']).arg(),
		new Map('cwd').alias(['c', 'C']).arg()
	]), cwd = process.cwd();

if (cli.argument().is('client')) {
	let uri = cli.has('host') ? cli.get('host') : '0.0.0.0:5935',
		dir = path.resolve(cli.get('cwd') || cwd);

	let client = new sync.Client(dir, uri, {
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
	client.on('change', (r) => console.log('change', r.toString()));

	client.on('error', (r) => console.log('error', r.toString()	));
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
		dir = path.resolve(cli.get('cwd') || cwd);
	uri = (uri.match(/^.*?:\/\//)) ? uri : 'tcp://' + uri;

	console.log('uri', uri);
	let static = new Server(Number(url.parse(uri).port) + 1, dir, 'html')
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

let dockerfile = () => {
	return fs.writeFile('Dockerfile', [
		'FROM node:11.1.0-alpine', // need to add ssh so you can do anywhere not just the machine
		'RUN ' + [
			'apk update',
			'apk upgrade',
			'apk add git bash openssh-server', // rsyslog
			// 'mkdir -p /var/run/sshd',
			// 'echo \'root:screencast\' | chpasswd',
			// 'adduser -D -g hadoop -h /home/cat -s /bin/bash cat',
			// 'usermod -p \'*\' cat',
			// 'echo \'cat:screencast\' | chpasswd',
			// 'echo "\$ModLoad inmark.so" >> /etc/rsyslog.conf',
			// 'echo "\$IncludeConfig /etc/rsyslog.d/*.conf" >> /etc/rsyslog.conf',
			// 'echo "auth,authpriv.* /var/log/auth.log" >> /etc/rsyslog.conf',
			// 'sed -i "s/#LogLevel.*/LogLevel DEBUG/g" /etc/ssh/sshd_config',
			// 'sed -i "s/#SyslogFacility.*/SyslogFacility AUTH/g" /etc/ssh/sshd_config',
			// 'sed -i \'s/PermitRootLogin prohibit-password/PermitRootLogin yes/\' /etc/ssh/sshd_config',
			// 'sed -i \'s/#PermitRootLogin/PermitRootLogin/\' /etc/ssh/sshd_config',
			// 'sed -i \'s/#Port 22/Port 2972/\' /etc/ssh/sshd_config',
			// 'sed -i \'s/AuthorizedKeysFile/#AuthorizedKeysFile/\' /etc/ssh/sshd_config',
			// 'sed -i \'s/#PasswordAuthentication/PasswordAuthentication/\' /etc/ssh/sshd_config',
			// 'echo "export VISIBLE=now" >> /etc/profile',
			// 'ssh-keygen -t rsa -N "" -f /etc/ssh/ssh_host_rsa_key',
			'mkdir -p /home/anzerr/workdir/',
			'cd /home/anzerr/',
			'git clone https://github.com/anzerr/sync.folder.git',
			'cd sync.folder',
			'git config --global url."https://github.com/".insteadOf git@github.com:',
			'git config --global url."https://".insteadOf git://',
			'git config --global url."https://".insteadOf ssh://',
			'npm install --only=prod'
		].join(' && '),
		'CMD node /home/anzerr/sync.folder/bin/index.js server --host 0.0.0.0:5970 --cwd /home/anzerr/workdir' // ; /usr/sbin/sshd -f /etc/ssh/sshd_config
	].join('\n') + '\n').then(() => console.log('done')).catch(console.log);
};

if (cli.argument().is('dockerfile')) {
	dockerfile();
}

if (cli.argument().is('build')) {
	dockerfile().then(() => {
		return util.exec('docker build --no-cache -t anzerr/env:' + version + ' -t anzerr/env:latest .', {cwd: path.join(__dirname, '..'), env: process.env});
	}).then(() => console.log('done')).catch(console.log);
}

throw new Error('no valid argument given');
