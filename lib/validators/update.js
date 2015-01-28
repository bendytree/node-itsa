

module.exports = function defaultBuilder (defaultVal) {
  var args = [].concat.apply([].slice.call(arguments));
  if (args.length === 0){
    throw "No default value was given in `.default(...)`.";
  }

  return function defaultRunner (val, setter) {
    //make sure there is a parent object
    if (this._parent === undefined) {
      throw "`.default(...)` may not be used unless it is within an object.";
    }

    setter(typeof defaultVal == "function" ? defaultVal() : defaultVal);
  };
};