import { spawn } from 'node:child_process'

const processes = [
  spawn(process.execPath, ['--env-file-if-exists=.env.local', 'server/index.mjs'], {
    stdio: 'inherit',
  }),
  spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'dev:web'], {
    stdio: 'inherit',
  }),
]

let stopping = false

function stop(exitCode = 0) {
  if (stopping) return
  stopping = true
  for (const child of processes) child.kill('SIGTERM')
  process.exitCode = exitCode
}

for (const child of processes) {
  child.on('exit', (code, signal) => {
    if (!stopping && code !== 0 && signal !== 'SIGTERM') stop(code ?? 1)
  })
}

process.on('SIGINT', () => stop())
process.on('SIGTERM', () => stop())
