#!/usr/bin/env python3
"""
================================================================================
MBRN Hub Observer - Cockpit Data Aggregator
================================================================================
Monitors all 8 PM2 processes and writes structured state to hub_state.json.

Responsibilities:
- Poll PM2 status every 2 seconds
- Classify events into Triage levels (INFO/RECOVERY/CRITICAL)
- Atomic write to hub_state.json (temp + rename)
- Maintain forensic history (last 50 events per process)

Architecture Decision: 1A, 2A, 3B, 4A, 5A + Incident-Intelligence
================================================================================
"""

from __future__ import annotations

import json
import logging
import os
import re
import subprocess
import sys
import time
from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

# Path setup
PROJECT_ROOT = Path(__file__).resolve().parents[2]
PIPELINES_DIR = Path(__file__).resolve().parent
DATA_DIR = PROJECT_ROOT / "shared" / "data"
LOGS_DIR = PROJECT_ROOT / "logs" / "pm2"

# Ensure directories exist
DATA_DIR.mkdir(parents=True, exist_ok=True)
LOGS_DIR.mkdir(parents=True, exist_ok=True)

# Output file (atomic writes)
HUB_STATE_PATH = DATA_DIR / "hub_state.json"
HUB_STATE_TEMP = DATA_DIR / "hub_state.json.tmp"

# Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [HUB-OBSERVER] %(levelname)s - %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%S"
)
log = logging.getLogger("mbrn_hub_observer")

# PM2 Process Names (must match ecosystem.config.cjs)
PM2_PROCESSES = [
    "sentinel-daemon",
    "horizon-scout",
    "nexus-bridge",
    "ouroboros-agent",
    "bridge-agent",
    "live-monitor",
    "logic-auditor",
    "prime-director",
]

# Triage Classification Keywords
TRIAGE_INFO = ["heartbeat", "started", "completed", "success", "ok", "discovered", "found"]
TRIAGE_RECOVERY = ["retry", "timeout", "self-heal", "repair", "mutating", "fixing", "healing"]
TRIAGE_CRITICAL = ["failed", "error", "fatal", "critical", "auth failed", "disk full", "cannot fix", "exception"]


@dataclass
class ProcessState:
    """State representation for a single PM2 process."""
    name: str
    status: str = "unknown"
    triage: str = "INFO"
    pm2_status: str = "unknown"  # online, stopped, errored, etc.
    pid: int = 0
    uptime: str = "00:00:00"
    restart_count: int = 0
    memory: str = "0 MB"
    cpu: str = "0%"
    last_action: str = "Initializing..."
    incident_report: str = ""
    incident_count: int = 0
    metrics: Dict[str, Any] = field(default_factory=dict)
    forensic_history: List[Dict[str, Any]] = field(default_factory=list)
    last_update: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class HubObserver:
    """Central observer daemon that aggregates PM2 process states."""
    
    def __init__(self):
        self.observer_start_time = datetime.now(timezone.utc)
        self.forensic_logs: Dict[str, List[Dict]] = {name: [] for name in PM2_PROCESSES}
        self.previous_states: Dict[str, ProcessState] = {}
        
    def _utc_now(self) -> str:
        """Return ISO format UTC timestamp."""
        return datetime.now(timezone.utc).isoformat()
    
    def _format_uptime(self, seconds: int) -> str:
        """Format seconds as HH:MM:SS."""
        hours = seconds // 3600
        minutes = (seconds % 3600) // 60
        secs = seconds % 60
        return f"{hours:02d}:{minutes:02d}:{secs:02d}"
    
    def _classify_triage(self, message: str) -> str:
        """Classify message into Triage level."""
        message_lower = message.lower()
        
        for keyword in TRIAGE_CRITICAL:
            if keyword in message_lower:
                return "CRITICAL"
        
        for keyword in TRIAGE_RECOVERY:
            if keyword in message_lower:
                return "RECOVERY"
        
        return "INFO"
    
    def _parse_pm2_jlist(self) -> List[Dict[str, Any]]:
        """Get PM2 process list via pm2 jlist command."""
        try:
            result = subprocess.run(
                ["pm2", "jlist"],
                capture_output=True,
                text=True,
                timeout=10,
                shell=False
            )
            if result.returncode == 0:
                return json.loads(result.stdout)
        except (subprocess.TimeoutExpired, json.JSONDecodeError, FileNotFoundError) as e:
            log.warning(f"Failed to get PM2 list: {e}")
        return []
    
    def _extract_last_log_line(self, process_name: str) -> str:
        """Extract last meaningful log line from PM2 log file."""
        log_file = LOGS_DIR / f"{process_name}.log"
        if not log_file.exists():
            return "No log available"
        
        try:
            with open(log_file, "r", encoding="utf-8", errors="ignore") as f:
                lines = f.readlines()
                # Get last 3 lines and find most meaningful
                for line in reversed(lines[-10:]):
                    line = line.strip()
                    if len(line) > 20 and not line.startswith("---"):
                        # Remove timestamp prefix if present
                        match = re.match(r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.*?-\s*(.*)", line)
                        if match:
                            return match.group(1)[:100]  # Limit length
                        return line[:100]
                return lines[-1].strip()[:100] if lines else "No recent activity"
        except Exception as e:
            log.debug(f"Could not read log for {process_name}: {e}")
            return "Log unavailable"
    
    def _add_forensic_entry(self, process_name: str, event: str, details: str = ""):
        """Add entry to forensic history for a process."""
        entry = {
            "timestamp": self._utc_now(),
            "event": event,
            "details": details
        }
        self.forensic_logs[process_name].append(entry)
        # Keep only last 50 entries
        if len(self.forensic_logs[process_name]) > 50:
            self.forensic_logs[process_name] = self.forensic_logs[process_name][-50:]
    
    def _determine_process_metrics(self, process_name: str) -> Dict[str, Any]:
        """Extract process-specific metrics based on process type."""
        metrics = {}
        
        if process_name == "horizon-scout":
            # Count alphas discovered today from log
            metrics["alphas_found_today"] = self._count_log_occurrences(
                process_name, "ALPHA DISCOVERED"
            )
            metrics["iterations_completed"] = self._count_log_occurrences(
                process_name, "Iteration #"
            )
            
        elif process_name == "nexus-bridge":
            metrics["alphas_processed"] = self._count_log_occurrences(
                process_name, "Moving to factory"
            )
            
        elif process_name == "bridge-agent":
            metrics["modules_generated"] = self._count_log_occurrences(
                process_name, "Generating"
            )
            
        elif process_name == "ouroboros-agent":
            metrics["mutations_attempted"] = self._count_log_occurrences(
                process_name, "Mutation"
            )
            metrics["fixes_applied"] = self._count_log_occurrences(
                process_name, "fix applied"
            )
            
        return metrics
    
    def _count_log_occurrences(self, process_name: str, keyword: str) -> int:
        """Count occurrences of keyword in today's log."""
        log_file = LOGS_DIR / f"{process_name}.log"
        if not log_file.exists():
            return 0
        
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        count = 0
        
        try:
            with open(log_file, "r", encoding="utf-8", errors="ignore") as f:
                for line in f:
                    if today in line and keyword in line:
                        count += 1
        except Exception:
            pass
        
        return count
    
    def _poll_process_state(self, process_name: str, pm2_data: Dict[str, Any]) -> ProcessState:
        """Determine current state of a single process."""
        # Find PM2 process data
        pm2_process = None
        for proc in pm2_data:
            if proc.get("name") == process_name:
                pm2_process = proc
                break
        
        if not pm2_process:
            # Process not found in PM2
            return ProcessState(
                name=process_name,
                status="offline",
                triage="CRITICAL",
                pm2_status="stopped",
                last_action="Process not running in PM2",
                incident_report="Process is not registered with PM2"
            )
        
        # Extract PM2 metrics
        pm_monit = pm2_process.get("pm2_env", {})
        monit = pm2_process.get("monit", {})
        
        pid = pm2_process.get("pid", 0)
        pm2_status = pm2_process.get("pm2_env", {}).get("status", "unknown")
        restart_count = pm2_process.get("pm2_env", {}).get("restart_time", 0)
        
        # Calculate uptime
        pm_uptime = pm2_process.get("pm2_env", {}).get("pm_uptime", 0)
        if pm_uptime:
            uptime_seconds = int((datetime.now(timezone.utc).timestamp() * 1000 - pm_uptime) / 1000)
            uptime_str = self._format_uptime(uptime_seconds)
        else:
            uptime_str = "00:00:00"
        
        # Memory and CPU
        memory_bytes = monit.get("memory", 0)
        memory_str = f"{memory_bytes // (1024 * 1024)} MB"
        cpu_str = f"{monit.get('cpu', 0)}%"
        
        # Get last log action
        last_log = self._extract_last_log_line(process_name)
        
        # Classify triage
        triage = self._classify_triage(last_log)
        
        # Determine status
        if pm2_status != "online":
            status = "offline"
            triage = "CRITICAL"
        elif triage == "CRITICAL":
            status = "critical"
        elif triage == "RECOVERY":
            status = "recovering"
        else:
            status = "nominal"
        
        # Get previous state for forensic tracking
        prev_state = self.previous_states.get(process_name)
        
        # Track incidents
        incident_count = 0
        incident_report = ""
        
        if triage == "CRITICAL":
            incident_count = 1
            incident_report = last_log[:200]
            self._add_forensic_entry(process_name, "CRITICAL detected", last_log)
        elif triage == "RECOVERY":
            incident_count = 0
            incident_report = f"Self-healing in progress: {last_log[:150]}"
            self._add_forensic_entry(process_name, "RECOVERY started", last_log)
        
        # Get process-specific metrics
        metrics = self._determine_process_metrics(process_name)
        
        # Create state
        state = ProcessState(
            name=process_name,
            status=status,
            triage=triage,
            pm2_status=pm2_status,
            pid=pid,
            uptime=uptime_str,
            restart_count=restart_count,
            memory=memory_str,
            cpu=cpu_str,
            last_action=last_log,
            incident_report=incident_report,
            incident_count=incident_count,
            metrics=metrics,
            forensic_history=self.forensic_logs[process_name][-10:],  # Last 10
            last_update=self._utc_now()
        )
        
        # Store for next comparison
        self.previous_states[process_name] = state
        
        return state
    
    def _build_hub_state(self) -> Dict[str, Any]:
        """Build complete hub state from all processes."""
        # Get PM2 data
        pm2_data = self._parse_pm2_jlist()
        
        # Build process states
        process_states = {}
        active_incidents = 0
        critical_count = 0
        recovering_count = 0
        nominal_count = 0
        
        for process_name in PM2_PROCESSES:
            state = self._poll_process_state(process_name, pm2_data)
            process_states[process_name] = asdict(state)
            
            # Count statuses
            if state.triage == "CRITICAL":
                critical_count += 1
                active_incidents += 1
            elif state.triage == "RECOVERY":
                recovering_count += 1
            else:
                nominal_count += 1
        
        # Calculate observer uptime
        uptime_seconds = int((datetime.now(timezone.utc) - self.observer_start_time).total_seconds())
        uptime_str = self._format_uptime(uptime_seconds)
        
        # Build final state
        hub_state = {
            "timestamp": self._utc_now(),
            "processes": process_states,
            "system": {
                "active_incidents": active_incidents,
                "total_processes": len(PM2_PROCESSES),
                "healthy_processes": nominal_count,
                "recovering_processes": recovering_count,
                "critical_processes": critical_count,
                "last_update": self._utc_now(),
                "observer_uptime": uptime_str,
                "observer_pid": os.getpid()
            }
        }
        
        return hub_state
    
    def _atomic_write_state(self, state: Dict[str, Any]):
        """Write state atomically using temp file + rename."""
        try:
            # Write to temp file
            with open(HUB_STATE_TEMP, "w", encoding="utf-8") as f:
                json.dump(state, f, indent=2, ensure_ascii=False, default=str)
            
            # Atomic rename
            HUB_STATE_TEMP.replace(HUB_STATE_PATH)
            
            log.debug(f"Hub state updated: {state['system']['healthy_processes']}/{state['system']['total_processes']} healthy")
            
        except Exception as e:
            log.error(f"Failed to write hub state: {e}")
    
    def run_single_update(self):
        """Execute one update cycle."""
        try:
            state = self._build_hub_state()
            self._atomic_write_state(state)
            
            # Log system status summary
            sys_status = state["system"]
            if sys_status["critical_processes"] > 0:
                log.warning(f"System status: {sys_status['critical_count']} CRITICAL, {sys_status['recovering_processes']} RECOVERING")
            elif sys_status["recovering_processes"] > 0:
                log.info(f"System status: {sys_status['recovering_processes']} recovering, {sys_status['healthy_processes']} nominal")
            else:
                log.debug(f"All systems nominal ({sys_status['healthy_processes']}/{sys_status['total_processes']})")
                
        except Exception as e:
            log.error(f"Update cycle failed: {e}")
    
    def run(self):
        """Main observer loop."""
        log.info("=" * 60)
        log.info("MBRN Hub Observer v1.0 - Starting")
        log.info(f"Monitoring {len(PM2_PROCESSES)} PM2 processes")
        log.info(f"Output: {HUB_STATE_PATH}")
        log.info("Update interval: 2 seconds")
        log.info("=" * 60)
        
        # Initial update
        self.run_single_update()
        
        try:
            while True:
                time.sleep(2)
                self.run_single_update()
        except KeyboardInterrupt:
            log.info("Observer stopped by user")
        except Exception as e:
            log.error(f"Observer crashed: {e}")
            raise


def main():
    """Entry point."""
    observer = HubObserver()
    observer.run()


if __name__ == "__main__":
    main()
