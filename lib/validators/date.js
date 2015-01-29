

module.exports = function dateBuilder() {
  return function dateChecker(val) {
    var classType = Object.prototype.toString.call(val);
    var valid = classType === "[object Date]" && isFinite(val);
    return valid ? null : "Invalid date";
  };
};

