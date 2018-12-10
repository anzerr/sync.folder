#!/usr/bin/env node

const path = require('path'),
	Watcher = require('fs.watcher'),
	Queue = require('./queue.js');

const [,, ...args] = process.argv, cwd = process.cwd();

if (args[0] && args[1]) {
	const dir = path.join(cwd, args[0]), q = new Queue(dir, args[1] || '');
	return new Watcher(dir).on('change', (r) => {
		// console.log('change', r);
		if ((r[0] === 'add' || r[0] === 'change') && !r[1]) {
			q.add(r[2]);
		}
		if (r[0] === 'remove') {
			q.remove(r[2]);
		}
	});
}

return console.log('usage is <dir> cat@192.168.1.130:/tmp/workdir');
