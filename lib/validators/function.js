

module.exports = function functionBuilder() {
  return function functionChecker(val) {
    var valid = typeof val === "function";
    return valid ? null : "Value is not a function.";
  };
};
