
var fs = require("fs");
var moment = require("moment");
var version = require('../package.json').version;
var pathToJs = __dirname+"/../dist/itsa.js";

var js = fs.readFileSync(pathToJs, "UTF8");

var header = "\
/*! \
  * @license \
  * itsa ITSA_VERSION_GOES_HERE <https://github.com/bendytree/node-itsa> \
  * Copyright ITSA_BUNDLE_DATE_GOES_HERE Josh Wright <http://www.joshwright.com> \
  * MIT LICENSE <https://github.com/bendytree/node-itsa/blob/master/LICENSE> \
  */ \
";

header = header.replace("ITSA_VERSION_GOES_HERE", version);
header = header.replace("ITSA_BUNDLE_DATE_GOES_HERE", moment().format("MM/DD/YYYY"));

fs.writeFileSync(pathToJs, header + js);

