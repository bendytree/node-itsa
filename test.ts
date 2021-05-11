
const runTests = (...tests) => {
  // @ts-ignore
  if (__BUILD_ENV__ !== 'production') {
    console.log(JSON.stringify({ tests }));
  }
};

runTests(1, 2, 3);

export const name:string = 'Josh' + ' ' + 'Wright';
