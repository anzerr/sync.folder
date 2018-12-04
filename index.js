
const path = require('path'),
	fs = require('./src/fs.js'),
	Think = require('./src/think.js'),
	Hook = require('./src/hook.js');

class Watcher extends require('events') {

	constructor(home) {
		super();
		this._home = home;
		this._map = {};
		this._last = {};
		console.log('Watcher', home);
		this.think = new Think(() => {
			return this.scan(this._home).then(() => {
				return this.removed();
			});
		}, 500);
	}

	removed() {
		let p = Promise.resolve(), c = 0;
		for (let i in this._map) {
			((file) => {
				if (this._map[file] === null) {
					c++;
					return;
				}
				p = p.then(() => {
					return fs.access(file).then(() => {
						// still works
					}).catch(() => {
						this._map[file] = null;
						this.emit('change', ['removed', file]);
					});
				});
			})(i);
		}
		return p.then(() => {
			if (c > 100) {
				let o = {}, l = {};
				for (let i in this._map) {
					if (!this._map[i]) {
						o[i] = this._map[i];
						l[i] = this._last[i];
					}
				}
				this._last = l;
				this._map = o;
			}
		});
	}

	change(file) {
		if ((this._last[file] || 0) < Date.now() && this._map[file]) {
			this._last[file] = Date.now() + 100;
			this.emit('change', ['change', this._map[file].isDirectory, file]);
		}
	}

	async scan(dir) {
		let list = await fs.readdir(dir), p = Promise.resolve();
		for (let i in list) {
			((file) => {
				p = p.then(() => {
					return fs.stat(file);
				}).then((res) => {
					let setup = Promise.resolve();
					if (!this._map[file]) {
						this._map[file] = new Hook(file);
						this._map[file].on('change', (r) => {
							if (r[0] === 'change') {
								this.change(r[2]);
							}
							if (r[0] === 'add' && this._map[file]) {
								this.emit('change', r);
							}
						});
						setup = this._map[file].setup();
					}

					if (res.isDirectory()) {
						return Promise.all([setup, this.scan(file)]);
					}
					return setup;
				});
			})(path.join(dir, list[i]));
		}
		return p;
	}

}

module.exports = Watcher;
