
### `Intro`
A tool to sync directories on a remote server

#### `Install`
``` bash
npm install --save git+https://git@github.com/anzerr/sync.folder.git
```

``` bash
git clone http://git@github.com/anzerr/sync.folder.git &&
cd sync.folder &&
npm link
```

### `Example`

``` bash
syncF server --host localhost:596 --cwd ./tmp
syncF client --host localhost:596 --cwd ./src
```

``` javascript
const sync = require('sync.folder');

let port = 5935;
new sync.Server('./tmp', 'localhost:' + port);
let client = new sync.Client('./src', 'localhost:' + port);

client.on('remove', (r) => {
	console.log('removed', r);
});

client.on('add', (r) => {
	console.log('add', r);
});
```