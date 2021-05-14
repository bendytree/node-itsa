
module.exports = {
  reporter: ['text', 'html'],
  'skip-full': true,
  'temp-dir': '/tmp/nyc',
  'report-dir': './.coverage',
  'exclude': [ '**/*.spec.ts' ],
};
