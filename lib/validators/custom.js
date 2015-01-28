

module.exports = function customBuilder(validatorFunction) {
  var itsaInstance = this._convertValidatorToItsaInstance(validatorFunction);

  return function customChecker(val){
    return itsaInstance.validate(val);
  };
};
