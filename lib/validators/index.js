
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
  "integer": require('./integer'),
  "matches": require('./matches'),
  "maxLength": require('./maxLength'),
  "nan": require('./nan'),
  "null": require('./null'),
  "number": require('./number'),
  "object": require('./object'),
  "string": require('./string'),
  "undefined": require('./undefined'),
  "update": require('./update'),
  //non empty string/array/object/, minLength, length\
  //between, over, under (alias before, after)
  //starts with, ends with, contains
  //updaters - created, updated?
  //updaters (to prefix?) - trim, lowercase, uppercase
  //toInt, toBoolean, toString, toDate, toFloat
  //email, hex, alphanumeric, json
  //true, false
  //toRandom
  //falsy, truthy
  //noOtherFields on object
  //unique on object or array (with optional selector)
  //function?
};
