
module.exports = {
  reporter: ['text', 'html'],
  'skip-full': false,
  'temp-dir': '/tmp/nyc',
  'report-dir': './.coverage',
  'exclude': [ '**/*.spec.ts' ],
};
