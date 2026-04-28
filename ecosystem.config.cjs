/**
 * ================================================================================
 * MBRN PM2 ECOSYSTEM CONFIGURATION
 * ================================================================================
 * Backend orchestration for the "Silent Engine" - no more batch terminal chaos.
 * * USAGE:
 * npm install -g pm2                     # Install PM2 globally (once)
 * pm2 start ecosystem.config.js         # Start all services
 * pm2 status                             # View running services
 * pm2 logs                               # View all logs
 * pm2 stop all                           # Stop all services
 * pm2 delete all                         # Remove all from PM2
 * pm2 startup                            # Enable auto-start on boot
 * pm2 save                               # Save current process list
 * * SAFETY FEATURES:
 * - watch: false (no restart on file changes - prevents JSON-triggered restarts)
 * - autorestart: true (auto-recovery from crashes)
 * - max_memory_restart: 1G (Memory leak protection)
 * - max_restarts: 10 (prevent restart loops)
 * - min_uptime: 10s (ensure stability before marking as online)
 * ================================================================================
 */

const path = require('path');

// Base paths
const PROJECT_ROOT = __dirname;
const PIPELINES_DIR = path.join(PROJECT_ROOT, 'scripts', 'pipelines');
const LOGS_DIR = path.join(PROJECT_ROOT, 'logs', 'pm2');

// Python interpreter (venv canonical)
// LAW 8 OPS EXCEPTION: PM2 is the canonical orchestrator
const PYTHON = path.join(PROJECT_ROOT, 'venv', 'Scripts', 'pythonw.exe');

// Common environment variables
const env = {
  NODE_ENV: 'production',
  PYTHONUNBUFFERED: '1',
  PYTHONIOENCODING: 'utf-8',
  PYTHONUTF8: '1',
  MBRN_ROOT: PROJECT_ROOT,
  MBRN_ENABLE_SCOUT: '1',
  // Supabase credentials loaded from .env or config
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
};

// PM2 Application Definitions
module.exports = {
  apps: [
    // ---------------------------------------------------------------------------
    // CORE DAEMON - The Sentinel (Main orchestrator)
    // ---------------------------------------------------------------------------
    {
      name: 'sentinel-daemon',
      script: path.join(PIPELINES_DIR, 'sentinel_daemon.py'),
      interpreter: PYTHON,
      cwd: PIPELINES_DIR,
      
      // Process management
      instances: 1,
      exec_mode: 'fork',
      shell: false,
      
      // Safety: NO file watching (prevents JSON-triggered restarts)
      watch: false,
      ignore_watch: ['*.json', '*.log', 'logs', 'node_modules'],
      
      // Auto-recovery
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      
      // Memory protection (1GB limit)
      max_memory_restart: '1G',
      
      // Logging
      log_file: path.join(LOGS_DIR, 'sentinel-daemon.log'),
      out_file: path.join(LOGS_DIR, 'sentinel-daemon-out.log'),
      error_file: path.join(LOGS_DIR, 'sentinel-daemon-error.log'),
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Environment
      env: env,
      env_production: env,
      
      // Graceful shutdown
      kill_timeout: 5000,
      listen_timeout: 10000,
    },

    // ---------------------------------------------------------------------------
    // HORIZON SCOUT - Discovery Agent (Alpha hunting)
    // ---------------------------------------------------------------------------
    {
      name: 'horizon-scout',
      script: path.join(PIPELINES_DIR, 'mbrn_horizon_scout.py'),
      interpreter: PYTHON,
      cwd: PIPELINES_DIR,
      args: '--infinite',
      
      instances: 1,
      exec_mode: 'fork',
      shell: false,
      
      watch: false,
      ignore_watch: ['*.json', '*.log', 'logs', 'node_modules'],
      
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      
      max_memory_restart: '1G',
      
      log_file: path.join(LOGS_DIR, 'horizon-scout.log'),
      out_file: path.join(LOGS_DIR, 'horizon-scout-out.log'),
      error_file: path.join(LOGS_DIR, 'horizon-scout-error.log'),
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      env: env,
      env_production: env,
      
      kill_timeout: 10000, // Scout needs longer for graceful shutdown
      listen_timeout: 15000,
    },

    // ---------------------------------------------------------------------------
    // NEXUS BRIDGE - Scout-to-Factory Pipeline
    // ---------------------------------------------------------------------------
    {
      name: 'nexus-bridge',
      script: path.join(PIPELINES_DIR, 'mbrn_nexus_bridge.py'),
      interpreter: PYTHON,
      cwd: PIPELINES_DIR,
      
      instances: 1,
      exec_mode: 'fork',
      shell: false,
      
      watch: false,
      ignore_watch: ['*.json', '*.log', 'logs', 'node_modules', 'outputs'],
      
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      
      max_memory_restart: '1G',
      
      log_file: path.join(LOGS_DIR, 'nexus-bridge.log'),
      out_file: path.join(LOGS_DIR, 'nexus-bridge-out.log'),
      error_file: path.join(LOGS_DIR, 'nexus-bridge-error.log'),
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      env: env,
      env_production: env,
      
      kill_timeout: 5000,
      listen_timeout: 10000,
    },

    // ---------------------------------------------------------------------------
    // VALUE ROUTER - Module Scoring & Routing (WATCHMAN MODE)
    // ---------------------------------------------------------------------------
    {
      name: 'value-router',
      script: path.join(PIPELINES_DIR, 'mbrn_value_router.py'),
      interpreter: PYTHON,
      cwd: PIPELINES_DIR,
      
      instances: 1,
      exec_mode: 'fork',
      shell: false,
      
      watch: false,
      ignore_watch: ['*.json', '*.log', 'logs', 'node_modules', 'outputs'],
      
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      
      max_memory_restart: '512M',
      
      log_file: path.join(LOGS_DIR, 'value-router.log'),
      out_file: path.join(LOGS_DIR, 'value-router-out.log'),
      error_file: path.join(LOGS_DIR, 'value-router-error.log'),
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      env: env,
      env_production: env,
      
      kill_timeout: 5000,
      listen_timeout: 10000,
    },

    // ---------------------------------------------------------------------------
    // LIVE MONITOR - System Health Observer
    // ---------------------------------------------------------------------------
    {
      name: 'live-monitor',
      script: path.join(PIPELINES_DIR, 'mbrn_live_monitor.py'),
      interpreter: PYTHON,
      cwd: PIPELINES_DIR,
      args: '--infinite',
      
      instances: 1,
      exec_mode: 'fork',
      shell: false,
      
      watch: false,
      ignore_watch: ['*.json', '*.log', 'logs', 'node_modules'],
      
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      
      max_memory_restart: '512M', // Monitor uses less memory
      
      log_file: path.join(LOGS_DIR, 'live-monitor.log'),
      out_file: path.join(LOGS_DIR, 'live-monitor-out.log'),
      error_file: path.join(LOGS_DIR, 'live-monitor-error.log'),
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      env: env,
      env_production: env,
      
      kill_timeout: 3000,
      listen_timeout: 5000,
    },

    // ---------------------------------------------------------------------------
    // OUROBOROS AGENT - Self-healing Mutation Engine
    // ---------------------------------------------------------------------------
    {
      name: 'ouroboros-agent',
      script: path.join(PIPELINES_DIR, 'mbrn_ouroboros_agent.py'),
      interpreter: PYTHON,
      cwd: PIPELINES_DIR,
      args: '--infinite',

      instances: 1,
      exec_mode: 'fork',
      shell: false,

      watch: false,
      ignore_watch: ['*.json', '*.log', 'logs', 'node_modules', 'outputs'],

      autorestart: true,
      max_restarts: 5, // Fewer restarts for mutation engine (safety)
      min_uptime: '30s', // Require longer stability for mutation engine
      
      max_memory_restart: '1500M', // Ouroboros uses more memory for LLM calls
      
      log_file: path.join(LOGS_DIR, 'ouroboros-agent.log'),
      out_file: path.join(LOGS_DIR, 'ouroboros-agent-out.log'),
      error_file: path.join(LOGS_DIR, 'ouroboros-agent-error.log'),
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      env: env,
      env_production: env,
      
      kill_timeout: 15000, // Ouroboros needs longer shutdown for LLM cleanup
      listen_timeout: 20000,
    },

    // ---------------------------------------------------------------------------
    // BRIDGE AGENT - HTML Production Pipeline (WATCHMAN MODE)
    // ---------------------------------------------------------------------------
    {
      name: 'bridge-agent',
      script: path.join(PIPELINES_DIR, 'mbrn_bridge_agent.py'),
      interpreter: PYTHON,
      cwd: PIPELINES_DIR,
      
      instances: 1,
      exec_mode: 'fork',
      shell: false,
      
      watch: false,
      ignore_watch: ['*.json', '*.log', 'logs', 'node_modules', 'outputs'],
      
      // WATCHMAN MODE: Dauerhaft online, 2-Sekunden-DB-Polling
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      
      max_memory_restart: '1G',
      
      log_file: path.join(LOGS_DIR, 'bridge-agent.log'),
      out_file: path.join(LOGS_DIR, 'bridge-agent-out.log'),
      error_file: path.join(LOGS_DIR, 'bridge-agent-error.log'),
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      env: env,
      env_production: env,
      
      kill_timeout: 5000,
      listen_timeout: 10000,
    },

    // ---------------------------------------------------------------------------
    // PRIME DIRECTOR - Factory Orchestrator
    // ---------------------------------------------------------------------------
    {
      name: 'prime-director',
      script: path.join(PIPELINES_DIR, 'mbrn_prime_director_v2.py'),
      interpreter: PYTHON,
      cwd: PIPELINES_DIR,
      
      instances: 1,
      exec_mode: 'fork',
      shell: false,
      
      watch: false,
      ignore_watch: ['*.json', '*.log', 'logs', 'node_modules', 'outputs'],
      
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      
      max_memory_restart: '1G',
      
      log_file: path.join(LOGS_DIR, 'prime-director.log'),
      out_file: path.join(LOGS_DIR, 'prime-director-out.log'),
      error_file: path.join(LOGS_DIR, 'prime-director-error.log'),
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      env: env,
      env_production: env,
      
      kill_timeout: 5000,
      listen_timeout: 10000,
    },

    // ---------------------------------------------------------------------------
    // LOGIC AUDITOR - Code Quality Guardian (WATCHMAN MODE)
    // ---------------------------------------------------------------------------
    {
      name: 'logic-auditor',
      script: path.join(PIPELINES_DIR, 'mbrn_logic_auditor.py'),
      interpreter: PYTHON,
      cwd: PIPELINES_DIR,
      
      instances: 1,
      exec_mode: 'fork',
      shell: false,
      
      watch: false,
      ignore_watch: ['*.json', '*.log', 'logs', 'node_modules'],
      
      // WATCHMAN MODE: Dauerhaft online, 2-Sekunden-DB-Polling
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      
      max_memory_restart: '512M',
      
      log_file: path.join(LOGS_DIR, 'logic-auditor.log'),
      out_file: path.join(LOGS_DIR, 'logic-auditor-out.log'),
      error_file: path.join(LOGS_DIR, 'logic-auditor-error.log'),
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      env: env,
      env_production: env,
      
      kill_timeout: 5000,
      listen_timeout: 10000,
    },

    // ---------------------------------------------------------------------------
    // HUB OBSERVER - Cockpit Data Aggregator (The 9th Process)
    // ---------------------------------------------------------------------------
    {
      name: 'hub-observer',
      script: path.join(PIPELINES_DIR, 'mbrn_hub_observer.py'),
      interpreter: PYTHON,
      cwd: PIPELINES_DIR,
      
      instances: 1,
      exec_mode: 'fork',
      shell: false,
      
      watch: false,
      ignore_watch: ['*.json', '*.log', 'logs', 'node_modules'],
      
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      
      max_memory_restart: '512M',
      
      log_file: path.join(LOGS_DIR, 'hub-observer.log'),
      out_file: path.join(LOGS_DIR, 'hub-observer-out.log'),
      error_file: path.join(LOGS_DIR, 'hub-observer-error.log'),
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      env: env,
      env_production: env,
      
      kill_timeout: 3000,
      listen_timeout: 5000,
    },

    // ---------------------------------------------------------------------------
    // COCKPIT SERVER - Localhost Gateway (Prevents CORS issues)
    // ---------------------------------------------------------------------------
    {
      name: 'cockpit-server',
      script: PYTHON, // Nutzt jetzt zwingend pythonw.exe
      args: '-m http.server 8080',
      cwd: PROJECT_ROOT, // Root dir to access /shared/data/
      
      instances: 1,
      exec_mode: 'fork',
      shell: false,
      
      watch: false,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '5s',
      
      max_memory_restart: '256M',
      
      log_file: path.join(LOGS_DIR, 'cockpit-server.log'),
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      env: env,
      env_production: env,
      
      kill_timeout: 2000,
      listen_timeout: 3000,
    },
    {
      name: 'cockpit-sync',
      script: 'powershell',
      args: ['-File', 'scripts/pipelines/mbrn_cockpit_sync.ps1'],
      autorestart: true,
      restart_delay: 30000,
      watch: false,
      env: { NODE_ENV: 'production' }
    }
  ],

  // ==============================================================================
  // DEPLOYMENT CONFIGURATION (optional - for future scaling)
  // ==============================================================================
  deploy: {
    production: {
      user: 'SSH_USERNAME',
      host: 'SSH_HOSTMACHINE',
      ref: 'origin/main',
      repo: 'GIT_REPOSITORY',
      path: 'DESTINATION_PATH',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
    },
  },
};