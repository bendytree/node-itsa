

module.exports = function nullBuilder() {
  return function nullChecker(val) {
    return val === null ? null : "Value is not null.";
  };
};

