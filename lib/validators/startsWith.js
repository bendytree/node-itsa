

module.exports = function startsWithBuilder(value) {
  return function startsWithChecker(val) {
    var hasIndexOf = (val && val.indexOf) || (typeof val === "string");
    if (!hasIndexOf) {
      return "Data has no indexOf, so there's no way to check `.startsWith()`.";
    }
    var index = val.indexOf(value);
    if (index === -1){
      return "Data does not contain the value.";
    }
    return index === 0 ? null : "Data contains the value, but does not start with it.";
  };
};
