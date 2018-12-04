
const {spawn} = require('child_process');

class Util {

	exec(c, o) {
		return new Promise((resolve) => {
			const cmd = spawn('sh', ['-c', c], o);
			let data = [];
			cmd.stdout.on('data', (d) => {
				process.stdout.write(d);
				if (d.toString().match('password')) {
					cmd.stdout.write('cat');
				}
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

	scp(origin, remote) {
		return new Promise((resolve) => {
			const cmd = spawn('pscp', ['-pw', 'cat', '-p', '-r', origin, remote]);
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
				console.log('resolve');
				resolve(Buffer.concat(data));
			});
		});
	}

}

module.exports = new Util();
