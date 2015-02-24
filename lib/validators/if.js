
var helpers = require("../helpers");

module.exports = function ifBuilder(test, itsaInstance) {
  //validate
  if (!helpers.isPlainObject(test) && !helpers.isFunction(test))
    throw "Test argument should be a function or plain object.";
  if (!(itsaInstance instanceof this._itsa))
    throw "`if` requires an itsa instance as the second argument.";

  //convert obj to function?
  if (helpers.isPlainObject(test)) {
    var testObj = test;
    test = function (val) {
      if (!helpers.isPlainObject(val)) return false;

      for (var key in testObj) {
        if (!testObj.hasOwnProperty(key)) continue;

        if (val[key] !== testObj[key]) {
          return false;
        }
      }

      return true;
    }
  }

  return function ifChecker(val) {

    if (!test(val))
      return {
        valid: true,
        logs: [this._buildLog("if", "Condition failed in if expression.", true)]
      };

    var getter = function () { return val; };

    var result = itsaInstance._validate.apply(itsaInstance, [getter]);
    return result;
  };
};

