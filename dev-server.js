import { spawn } from 'child_process';

const next = spawn('./node_modules/.bin/next', ['dev', '-p', '3000', '-H', '0.0.0.0'], {
  stdio: 'inherit',
  env: process.env,
});

process.on('SIGTERM', () => next.kill('SIGTERM'));
process.on('SIGINT', () => next.kill('SIGINT'));
next.on('exit', (code) => process.exit(code || 0));
