

module.exports = function truthyBuilder() {
  return function truthyChecker(val) {
    return val ? null : "Value is not truthy.";
  };
};

