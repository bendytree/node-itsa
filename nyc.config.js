
module.exports = {
  reporter: ['text', 'html'],
  'skip-full': false,
  'temp-dir': '/tmp/nyc',
  'report-dir': './.coverage',
  'exclude': [ '**/*.spec.ts', 'src/clone-rfdc.ts' ],
  'check-coverage': true,
};
