
var helpers = require("../helpers");

module.exports = function toIntegerBuilder (radix) {
  return function toIntegerRunner (val, setter) {
    if (!setter) throw "`.toInteger()` may not be used unless it is within an object or array.";

    var newValue;
    if (helpers.isValidDate(val)) {
      newValue = val.getTime();
    }else{
      newValue = parseInt(val, typeof radix === "undefined" ? 10 : radix);
    }
    if (val === newValue) {
      return null;
    }
    if (isNaN(newValue)) {
      return "Unable to convert data to integer.";
    }else{
      setter(newValue);
      return null;
    }
  };
};