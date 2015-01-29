

module.exports = function falsyBuilder() {
  return function falsyChecker(val) {
    return !val ? null : "Value is not falsy.";
  };
};

