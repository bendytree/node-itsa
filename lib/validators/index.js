
module.exports = {
  "object": require('./object'),
  "string": require('./string'),
  "maxLength": require('./maxLength'),
  "any": require('./any'),
  "equal": require('./equal'),
  "custom": require('./custom'),
  "default": require('./default'),
  "update": require('./update'),
  "array": require('./array'),
  "arrayOf": require('./arrayOf'),
  "matches": require('./matches'),
  //boolean
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
