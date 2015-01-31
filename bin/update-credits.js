
var fs = require("fs");
var moment = require("moment");
var version = require('../package.json').version;
var pathToJs = __dirname+"/../dist/itsa.js";

var js = fs.readFileSync(pathToJs, "UTF8");

js = js.replace("ITSA_VERSION_GOES_HERE", version);
js = js.replace("ITSA_BUNDLE_DATE_GOES_HERE", moment().format("MM/DD/YYYY"));

fs.writeFileSync(pathToJs, js);

