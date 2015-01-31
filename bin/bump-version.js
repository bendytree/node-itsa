
var fs = require("fs");
var pack = require('../package.json');

pack.version = pack.version.substring(0, pack.version.lastIndexOf(".")+1) + (1+parseInt(pack.version.substring(pack.version.lastIndexOf(".")+1)));

fs.writeFileSync(__dirname+"/../package.json", JSON.stringify(pack, null, 2));
