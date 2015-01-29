

module.exports = function trueBuilder() {
  return function trueChecker(val) {
    return val === true ? null : "Value is not `true`.";
  };
};

