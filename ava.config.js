export default {
  files: ['src/**/*.test.ts'],
  concurrency: 4,
  timeout: '1m',
  extensions: ['ts'],
  require: ['ts-node/register'],
};
