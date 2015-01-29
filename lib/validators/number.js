

module.exports = function numberBuilder() {
  return function numberChecker(val) {
    var valid = typeof val === "number"
      && isNaN(val) === false
      && [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY].indexOf(val) === -1;
    return valid ? null : "Invalid number";
  };
};

