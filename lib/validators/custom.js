

module.exports = function customBuilder(validatorFunction) {

  var itsaInstance = this._interpretValidator(validatorFunction);

  return function customChecker(val){
    return itsaInstance.validate(val);
  };
};
