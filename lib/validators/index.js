
module.exports = {
  "any": require('./any'),
  "array": require('./array'),
  "arrayOf": require('./arrayOf'),
  "boolean": require('./boolean'),
  "custom": require('./custom'),
  "default": require('./default'),
  "equal": require('./equal'),
  "matches": require('./matches'),
  "maxLength": require('./maxLength'),
  "object": require('./object'),
  "string": require('./string'),
  "update": require('./update'),
  //empty (isEmpty lodash)
  //number, integer
  //date
  //null, NaN, undefined
  //non empty string, minLength, length
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
};
