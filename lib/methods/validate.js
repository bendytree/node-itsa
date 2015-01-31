


module.exports = function validate(value) {
  return this._validate(function valueGetter(){
    return value;
  });
};
