

module.exports = function lenBuilder(exactOrMin, max) {
  var args = [].concat.apply([].slice.call(arguments));
  var validationType = "truthy";
  if (args.length === 1) validationType = "exact";
  if (args.length === 2) validationType = "between";

  return function lenChecker(val) {
    var length = (val || (typeof val) === "string") ? val.length : undefined;
    if (validationType === "truthy"){
      return length ? null : "Length is not truthy.";
    }else if (validationType === "exact"){
      return length === exactOrMin ? null : "Length is not exactly: "+exactOrMin;
    }else if (validationType === "between"){
      var valid = length >= exactOrMin && length <= max;
      return valid ? null : "Length is not between "+exactOrMin +" and " + max;
    }
  };
};
