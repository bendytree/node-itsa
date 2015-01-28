
#itsa

*Pronounced "it's a".*

`itsa` is a JavaScript library designed to validate JavaScript objects.

It is designed to expressive, composable, extensible, simple, and clean. There are no dependencies
and no global variables. `itsa` is the only object exported by this library.

## Installation

`itsa` has no dependencies and works on server or client via npm:

    > npm install itsa --save

    var itsa = require("itsa");


Right now, there's no `itsa.js` that you can drop in to your client side, so you should use browserify.
Pull requests that automatically bundle `itsa.js` and `itsa.min.js` are welcome.


## How It Works

Let's say you want to validate an object before you save it to your database.

    var userSchema = itsa.object({
      firstname: itsa.string().maxLength(20),
      lastname: itsa.string().maxLength(20),
      age: itsa.any(itsa.number().between(18, 35), undefined),
      address: itsa.object({
        line1: itsa.string(),
        line2: itsa.string(),
        city: itsa.string(),
        state: itsa.string().maxLength(2),
        zip: itsa.string()
      });
    });

    var data = {
      firstname: "Bob",
      lastname: "Tables",
      address: {
        line1: "1000 Penny Lane",
        line2: "Suite 201",
        city: "Cityville",
        state: "California",
        zip: "90192"
      }
    };

    var result = userSchema.validate(data);

    result.valid === false;
    result.describe() === "address.state: length is 10, max is 2";

So you can define entire object graph with strings, numbers, arrays, objects, etc.

Once your data is ready, simple call `validate` on you itsa object to get the result.

The result has a `valid` field that tells you if the validation succeeded. It also includes
an array of logs that include all validation results (successes and failures).  If you'd like
to show a descriptive error message, simply call `result.describe()` which will give you a string
describing the validation results.


## Optional parameters

If you want to make a property optional, then you could use the `itsa.any` to list all
of the values that would be allowed.  Here's a simple example:

    var result = itsa.any(itsa.string(), undefined, itsa.number()).validate(42);

    result.valid === true;

In this case, a string, number, or undefined would all be valid values.


## Short Circuiting

If you have multiple validations for a single field, then validation will stop when it
runs into the first invalid result. For example:

    var result = itsa.string().maxLength(5).validate(3);
    result.valid === false;
    result.logs.length === 1;
    result.logs[0].valid === false;
    result.logs[0].validator === "string";


## Equality

`itsa.equal(...)` will run a strict equality test (===). For example:

    itsa.equal(42).validate(42).valid === true;
    itsa.equal(null).validate(false).valid === false;

This is especially helpful when used with the `object` or `any` validators:

    var validator = itsa.any(itsa.equal("red"), itsa.equal("blue"));
    validator.validate("red").valid === true;

    var validator = itsa.object({
      type: itsa.equal("db.user")
    });
    validator.validate({type:"db.product"}).valid === false;

For convenience, the `object`, `array`, and `any` validators can
receive primitive objects and will automatically convert them to
a `.equal(...)` validator. Here is the same example using the primitive
version of equality:

    var validator = itsa.any("red", "blue");
    validator.validate("red").valid === true;

    var validator = itsa.object({
      type: "db.user"
    });
    validator.validate({type:"db.product"}).valid === false;


## Custom Validators

You can use a custom validator if you have special logic that you'd like to test.

Your function will receive the data value (in this case `11`). You can return values
in one of three different ways:

#### Returning true or false

If you return `true` then the data is considered valid. `false` means invalid.
If the data is invalid, then a generic error message is used.

    var isMod7 = function(val){ return val % 7 === 0; }
    var result = itsa.custom(isMod7).validate(11);
    result.valid === false;
    result.describe() === "Custom validator failed.";

#### Returning null or a string

Instead of returning a boolean, you can return a string that is the validation
error message, or you can return `null` if there is no error.

    var startsWithDb = function(val){
      return val.indexOf("db.") === 0 ? null : "Value does not begin with `db.`";
    }
    var result = itsa.custom(startsWithDb).validate("cart_item");
    result.valid === false;
    result.describe() === "Value does not begin with `db.`";

Of course, this example is contrived. You'd probably use a built-in validator
to do this check.


#### Returning a results `object`

In most cases, returning an error message (above) does everything you need. Some validators
like `any` or `object` need to return validation logs for chilren so they can return a results
object. A results object is a plain object with two fields `valid` and `logs`.  Your function
is actually run within the context of the `itsa` instance, so you have access to some helper
methods:

    var isMod7 = function(val){
      var valid = val % 7 === 0;
      var message = valid ? "Mod check succeeded." : "Is not mod 7.";
      return {
        valid: valid,
        logs: [this._buildLog("isMod7", message, valid)]
      };
    }
    var result = itsa.custom(isMod7).validate(11);
    result.valid === false;
    result.describe() === "Is not mod 7.";




## Alternative Libraries

JavaScript Data Validators:

 - [molnarg/js-schema](https://github.com/molnarg/js-schema/) - "Simple and intuitive schema validator"
 - [ansman/validate.js](https://github.com/ansman/validate.js) - "Declarative validation written in javascript"
 - [eivindfjeldstad/validate](https://github.com/eivindfjeldstad/validate) - "Validate nested object properties in javascript"
 - [chriso/validator.js](https://github.com/chriso/validator.js) - "String validation and sanitization"
 - [ron-liu/validate-obj.js](https://github.com/ron-liu/validate-obj.js) - "simple way to validate object in javasciprt"

HTML Form Validators

 - [thedersen/backbone.validation](https://github.com/thedersen/backbone.validation) - "A validation plugin for Backbone.js that validates both your model as well as form input"
 - [rickharrison/validate.js](https://github.com/rickharrison/validate.js) - "Lightweight JavaScript form validation library inspired by CodeIgniter."
 - [DiegoLopesLima/Validate/validate.js](https://github.com/DiegoLopesLima/Validate) - "The jQuery Validate is an advanced plugin for an easily and quickly form validation"
 - [guillaumepotier/Parsley.js](https://github.com/guillaumepotier/Parsley.js) - "Validate your forms, frontend, without writing a single line of javascript - http://parsleyjs.org"
 - [formvalidation/formvalidation](https://github.com/formvalidation/formvalidation) - "The best @jquery plugin to validate form fields."


## License

MIT


## Todo

 - extensions using function style?
 - custom error messages
 - default values
 - arrays
 - noOtherFields
 - unique
 - types (dates, numbers, boolean, etc)


