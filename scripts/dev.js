import { spawn } from 'node:child_process';

const children = [];

function start(name, cmd, args, cwd) {
  const child = spawn(cmd, args, { cwd, shell: true, stdio: 'inherit' });
  children.push(child);
  child.on('exit', (code) => {
    console.log(`[${name}] exited with code ${code}`);
    children.forEach((c) => c.kill());
    process.exit(code ?? 0);
  });
}

start('server', 'npm', ['run', 'dev'], 'server');
start('client', 'npm', ['run', 'dev'], 'client');

process.on('SIGINT', () => {
  children.forEach((c) => c.kill());
  process.exit(0);
});
