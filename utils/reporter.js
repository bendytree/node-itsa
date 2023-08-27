const mocha = require('mocha');

module.exports = function (runner) {
  mocha.reporters.Base.call(this, runner);

  let passes = 0;
  const failedTests = [];

  runner.on('pass', function(test) {
    passes++;
  });

  runner.on('fail', function(test, err) {
    test.error = err;
    failedTests.push(test);
  });

  runner.on('end', function() {
    console.log();
    if (failedTests.length === 0) {
      console.log("\x1b[32m", `All ${passes} tests passed!`);
    } else {
      for (const test of failedTests) {
        console.log();
        console.log("\x1b[31m", ` • ${test.parent.fullTitle()}: ${test.title}`);
        if (test.body.length > 200) {
          console.log("\x1b[31m", `${test.body.split(/[\n\r]/g).map(l => `    ${l}`).join('\n')}`);
          console.log("\x1b[31m", `    > ${test.error.message}`);
        }else{
          console.log("\x1b[31m", `   ${test.body.replace(/[\r\n]/g, ' ').replace(/^.*strictE/mig, '..e').substr(0, 60)}`);
          console.log("\x1b[31m", `    > ${test.error.message}`);
        }
        console.log();
      }
      console.log(`${failedTests.length} of ${passes+failedTests.length} failed`);
    }
    console.log();
  });
}
