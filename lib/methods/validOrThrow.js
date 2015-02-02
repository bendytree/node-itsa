


module.exports = function validOrThrow(value) {
  var result = this.validate(value);
  if (result.valid === false) {
    throw result.describe();
  }
};
