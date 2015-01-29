
var rx = /[A-Z]/;

module.exports = function lowercaseBuilder() {
  return function lowercaseChecker(val) {
    var valid = typeof val === "string" && !rx.test(val);
    return valid ? null : "Value is contains uppercase characters.";
  };
};

