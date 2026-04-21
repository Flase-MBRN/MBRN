import { spawn } from 'node:child_process';
import path from 'node:path';

const ORACLE_WORKER_SCRIPTS = Object.freeze({
  oracle_prediction: 'scripts/oracle/oracle_core.py',
  backfill_history: 'scripts/oracle/backfill_history.py'
});

export function getOracleWorkerScript(jobId) {
  return ORACLE_WORKER_SCRIPTS[jobId] || null;
}

export function listOracleWorkerScripts() {
  return Object.keys(ORACLE_WORKER_SCRIPTS);
}

export async function runOraclePythonWorker(jobId, options = {}) {
  const scriptRelativePath = getOracleWorkerScript(jobId);
  if (!scriptRelativePath) {
    return {
      success: false,
      jobId,
      error: `Unknown Oracle worker job: ${jobId}`
    };
  }

  const cwd = options.cwd || process.cwd();
  const pythonCommand = options.pythonCommand || 'python';
  const scriptPath = path.resolve(cwd, scriptRelativePath);
  const args = Array.isArray(options.args) ? options.args : [];

  return new Promise((resolve) => {
    const child = spawn(pythonCommand, [scriptPath, ...args], {
      cwd,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });
    child.on('error', (error) => {
      resolve({
        success: false,
        jobId,
        scriptPath,
        exitCode: null,
        stdout,
        stderr,
        error: error.message
      });
    });
    child.on('close', (code) => {
      resolve({
        success: code === 0,
        jobId,
        scriptPath,
        exitCode: code,
        stdout,
        stderr,
        error: code === 0 ? null : `Oracle worker exited with code ${code}`
      });
    });
  });
}
