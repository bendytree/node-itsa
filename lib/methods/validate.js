


module.exports = function (val) {
  var results = [];
  for (var i in this.validators) {
    var validator = this.validators[i];

    //get result
    var result;
    try{
      result = validator.call(this, val);
    }catch(e){
      result = "Unhandled error. "+String(e);
    }

    //interpret result
    result = interpretResult(this, result);

    //add it to list of results
    results.push(result);

    //invalid? short circuit
    if (result.valid === false) break;
  }
  return this._buildFinalResult(this._combineResults(results));
};

var interpretResult = function (itsaInstance, result) {
  //result is a boolean?
  if (typeof result === "boolean") {
    return {
      valid: result,
      logs: [itsaInstance._buildLog("function", result?"Validation succeeded":"Validation failed", result)]
    };
  }

  //result is an object?
  if (Object.prototype.toString.call(result) === "[object Object]") {
    return result;
  }

  //otherwise interpret it as string=error
  var valid = typeof result !== "string" || !result;
  return {
    valid: valid,
    logs: [itsaInstance._buildLog("function", valid?"Validation succeeded":result, valid)]
  };
};