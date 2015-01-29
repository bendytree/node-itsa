

module.exports = function emptyBuilder() {
  return function emptyChecker(val) {
    var classType = Object.prototype.toString.call(val);

    if (classType === "[object String]") {
      return val.length === 0 ? null : "Expected empty, but length is: "+val.length;
    }

    if (classType === "[object Array]") {
      return val.length === 0 ? null : "Expected empty, but length is: "+val.length;
    }

    if (classType === "[object Object]") {
      var numberOfFields = 0;
      for (var key in val) {
        numberOfFields += 1;
      }
      return numberOfFields === 0 ? null : "Expected empty, but number of fields is: "+numberOfFields;
    }

    return "Type cannot be empty: "+classType;
  };
};
