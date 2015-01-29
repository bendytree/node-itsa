
var rx = /[a-z]/;

module.exports = function uppercaseBuilder() {
  return function uppercaseChecker(val) {
    var valid = typeof val === "string" && !rx.test(val);
    return valid ? null : "Value is contains lowercase characters.";
  };
};

