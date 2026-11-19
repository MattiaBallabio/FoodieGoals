import { spawn } from 'node:child_process';
const commands = {
  dev: ['node_modules/vinext/dist/cli.js', 'dev', '--host', '127.0.0.1'],
  build: ['node_modules/vinext/dist/cli.js', 'build'],
  migrate: [
    'node_modules/wrangler/bin/wrangler.js',
    'd1',
    'migrations',
    'apply',
    'DB',
    '--local',
    '--config',
    'wrangler.json',
  ],
  test: [
    '--test',
    'tests/matching.test.ts',
    'tests/map.test.ts',
    'tests/assignment4-unit.test.ts',
  ],
  api: ['--test', 'tests/api.test.mjs'],
  import: ['scripts/import.mjs', ...process.argv.slice(3)],
};
const command = commands[process.argv[2]];
if (!command) throw Error('Use dev, build, migrate, test, api, or import');
const child = spawn(process.execPath, command, {
  stdio: 'inherit',
  env: {
    ...process.env,
    WRANGLER_LOG_PATH: '.wrangler/logs',
    WRANGLER_SEND_METRICS: 'false',
  },
});
child.on('exit', (code) => process.exit(code ?? 1));
process.on('SIGINT', () => child.kill('SIGINT'));
