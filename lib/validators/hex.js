
var rx = /^[0-9a-f]*$/i;

module.exports = function hexBuilder() {
  return function hexChecker(val) {
    var type = typeof val;
    if (["string", "number"].indexOf(type) === -1) {
      return "Value should be hex, but isn't a string or number.";
    }
    return rx.test(val) ? null : "Value is not hex.";
  };
};

