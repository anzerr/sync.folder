
const fs = require('fs'),
	{promisify} = require('util');

let out = {}, key = [
	'access',
	'appendFile',
	'chmod',
	'chown',
	'copyFile',
	'lchmod',
	'lchown',
	'link',
	'lstat',
	'mkdir',
	'mkdtemp',
	'open',
	'readdir',
	'readFile',
	'readlink',
	'realpath',
	'rename',
	'rmdir',
	'stat',
	'symlink',
	'truncate',
	'unlink',
	'utimes',
	'writeFile'
];

for (let i in fs) {
	out[i] = fs[i];
}

for (let i in key) {
	if (fs[key[i]]) {
		out[key[i]] = promisify(fs[key[i]]);
	}
}

module.exports = out;

