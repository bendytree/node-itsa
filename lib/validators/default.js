

module.exports = function defaultBuilder (defaultVal) {
  var args = [].concat.apply([].slice.call(arguments));
  if (args.length === 0){
    throw "No default value was given in `.default(...)`.";
  }

  return function defaultRunner (val, setter) {
    //make sure there is a parent object
    if (!setter) {
      throw "`.default(...)` may not be used unless it is within an object.";
    }

    var setDefault = !val;

    if (typeof defaultVal === "boolean") {
      setDefault = [undefined, null].indexOf(val) > -1;
    }

    if (setDefault){
      setter(typeof defaultVal == "function" ? defaultVal() : defaultVal);
    }
  };
};