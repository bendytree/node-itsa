

module.exports = function () {
  return function (val) {
    var type = typeof val;
    var valid = type === "string";
    return {
      valid: valid,
      logs: [this._buildLog("string", "Expected a string, but type was "+type, valid)],
    };
  };
};
