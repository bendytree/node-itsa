

module.exports = function nanBuilder() {
  return function nanChecker(val) {
    return isNaN(val) ? null : "Value is not NaN.";
  };
};

