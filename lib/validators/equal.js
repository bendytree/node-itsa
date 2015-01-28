

module.exports = function equalBuilder(example) {
  if (arguments.length === 0){
    throw "No comparison object given in itsa.equal(...)";
  }

  return function equalChecker(val) {
    var valid = example === val;
    return {
      valid: valid,
      logs: [this._buildLog("equal", valid?"Equality verified.":"Value did not pass equality test.", valid)],
    };
  };
};
