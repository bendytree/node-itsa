

module.exports = function falseBuilder() {
  return function falseChecker(val) {
    return val === false ? null : "Value is not `false`.";
  };
};

