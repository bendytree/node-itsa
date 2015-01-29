
module.exports = {
  "any": require('./any'),
  "array": require('./array'),
  "arrayOf": require('./arrayOf'),
  "between": require('./between'),
  "boolean": require('./boolean'),
  "custom": require('./custom'),
  "contains": require('./contains'),
  "date": require('./date'),
  "default": require('./default'),
  "email": require('./email'),
  "empty": require('./empty'),
  "endsWith": require('./endsWith'),
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
  "startsWith": require('./startsWith'),
  "string": require('./string'),
  "true": require('./true'),
  "truthy": require('./truthy'),
  "undefined": require('./undefined'),
  "under": require('./under'),
  "update": require('./update'),
  //email, hex, alphanumeric, json, lowercase, uppercase
  //unique on object or array (with optional selector)

  //updaters - created, updated?
  //updaters (to prefix?) - trim,
  //toInt, toBoolean, toString, toDate, toFloat
  //toRandom

  //function?
};
