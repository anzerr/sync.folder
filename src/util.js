
const crypto = require('crypto'),
	fs = require('fs.promisify');

class Util {

	constructor() {}

	hash(file) {
		return new Promise((resolve) => {
			fs.createReadStream(file)
				.pipe(crypto.createHash('sha1').setEncoding('hex'))
				.on('finish', function () {
					resolve(this.read());
				});
		});
	}

}

module.exports = new Util();
