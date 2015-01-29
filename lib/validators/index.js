
module.exports = {
  "any": require('./any'),
  "array": require('./array'),
  "arrayOf": require('./arrayOf'),
  "between": require('./between'),
  "boolean": require('./boolean'),
  "custom": require('./custom'),
  "date": require('./date'),
  "default": require('./default'),
  "empty": require('./empty'),
  "equal": require('./equal'),
  "false": require('./false'),
  "falsy": require('./falsy'),
  "integer": require('./integer'),
  "len": require('./len'),
  "matches": require('./matches'),
  "maxLength": require('./maxLength'),
  "minLength": require('./minLength'),
  "nan": require('./nan'),
  "notEmpty": require('./notEmpty'),
  "null": require('./null'),
  "number": require('./number'),
  "object": require('./object'),
  "over": require('./over'),
  "string": require('./string'),
  "true": require('./true'),
  "truthy": require('./truthy'),
  "undefined": require('./undefined'),
  "under": require('./under'),
  "update": require('./update'),
  //alias after/before -> over/under
  //starts with, ends with, contains
  //email, hex, alphanumeric, json
  //unique on object or array (with optional selector)

  //updaters - created, updated?
  //updaters (to prefix?) - trim, lowercase, uppercase
  //toInt, toBoolean, toString, toDate, toFloat
  //toRandom

  //function?
};
