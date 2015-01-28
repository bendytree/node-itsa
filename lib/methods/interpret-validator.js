
module.exports = function (validator) {
  //already an `itsa` instance?
  if (typeof validator === "object" && validator instanceof this._itsa) {
    return validator;
  }

  //custom validator function
  if (typeof validator === "function") {
    var instance = new this._itsa();
    instance.validators = [ validator ];
    return instance;
  }

  //iterpret it as an `.equal(...)`
  return this._itsa.equal(validator);
};
