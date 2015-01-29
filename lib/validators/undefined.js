

module.exports = function undefinedBuilder() {
  return function undefinedChecker(val) {
    return val === undefined ? null : "Value is not undefined.";
  };
};

