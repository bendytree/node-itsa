
module.exports = {
  "any": require('./any'),
  "array": require('./array'),
  "arrayOf": require('./arrayOf'),
  "boolean": require('./boolean'),
  "custom": require('./custom'),
  "date": require('./date'),
  "default": require('./default'),
  "empty": require('./empty'),
  "equal": require('./equal'),
  "false": require('./false'),
  "falsy": require('./falsy'),
  "integer": require('./integer'),
  "matches": require('./matches'),
  "maxLength": require('./maxLength'),
  "nan": require('./nan'),
  "notEmpty": require('./notEmpty'),
  "null": require('./null'),
  "number": require('./number'),
  "object": require('./object'),
  "string": require('./string'),
  "true": require('./true'),
  "truthy": require('./truthy'),
  "undefined": require('./undefined'),
  "update": require('./update'),
  //notEmpty
  //minLength, length(1 or 2)
  //between, over, under (alias before, after)
  //starts with, ends with, contains
  //email, hex, alphanumeric, json
  //unique on object or array (with optional selector)

  //updaters - created, updated?
  //updaters (to prefix?) - trim, lowercase, uppercase
  //toInt, toBoolean, toString, toDate, toFloat
  //toRandom

  //function?
};
