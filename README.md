
### `Intro`
![GitHub Actions status | linter](https://github.com/anzerr/sync.folder/workflows/linter/badge.svg)
![GitHub Actions status | publish](https://github.com/anzerr/sync.folder/workflows/publish/badge.svg)
![GitHub Actions status | test](https://github.com/anzerr/sync.folder/workflows/test/badge.svg)

A tool to sync directories on a remote server

#### `Install`
use in project
``` bash
npm install --save git+https://github.com/anzerr/sync.folder.git
npm install --save @anzerr/sync.folder
```
add command
``` bash
git clone git+https://git@github.com/anzerr/sync.folder.git &&
cd sync.folder &&
npm link
```
docker
``` bash
docker run --restart always --name sync -v $(pwd):/cwd -p 3000:3000 -p 3001:3001 -u `id -u $USER` anzerr/sync.folder
syncF client --host 192.168.99.100:3000 --cwd .
```

### `Example`
``` bash
syncF server --host 0.0.0.0:3000 --cwd ./tmp
syncF client --host localhost:3000 --cwd ./src

syncF client --save --name "sync.json" --host 127.0.0.1:3000 --cwd ./server
syncF client --save --name "sync.json" --host 127.0.0.1:3001 --cwd ./client
syncF client --load --name "sync.json"
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