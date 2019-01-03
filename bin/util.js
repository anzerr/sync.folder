
const {spawn} = require('child_process');

class Util {

	constructor() {}

	exec(c, o) {
		return new Promise((resolve) => {
			const cmd = spawn('sh', ['-c', c], o);
			let data = [];
			cmd.stdout.on('data', (d) => {
				process.stdout.write(d);
				data.push(d);
			});
			cmd.stderr.pipe(process.stderr);
			cmd.on('error', (e) => {
				throw e;
			});
			cmd.on('close', () => {
				resolve(Buffer.concat(data));
			});
		});
	}

}

module.exports = new Util();
