
//this gets loaded before any other test
//and we use it to run tests in messy environment
//where native prototypes have been extended
var messy = false;
if (messy){
  Object.prototype.foo1 = function(){};
  Object.prototype.foo2 = function(){};
  Array.prototype.foo3 = function(){};
  Array.prototype.foo4 = function(){};
  String.prototype.foo5 = function(){};
  String.prototype.foo6 = function(){};
}