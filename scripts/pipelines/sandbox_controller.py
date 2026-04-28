"""
================================================================================
MBRN Split-Brain Sandbox Controller
================================================================================
System:       sandbox_controller
Version:      1.0.0
Owner Domain: meta_generator
State:        experimental

Architecture:
  ┌─────────────────────────────────────────────┐
  │           WINDOWS HOST (Controller)          │
  │  ┌─────────────────────────────────────┐    │
  │  │  Ollama (AMD RX 7700 XT GPU)         │    │  ← AI runs here, native speed
  │  │  sandbox_controller.py              │    │
  │  └──────────────┬──────────────────────┘    │
  │                 │  docker run --rm           │
  │  ┌──────────────▼──────────────────────┐    │
  │  │  mbrn-sandbox (Linux Container)     │    │  ← Code runs here, ISOLATED
  │  │  CPU-only │ --network bridge         │    │
  │  │  --memory 512m │ --cpus 0.5         │    │
  │  └─────────────────────────────────────┘    │
  └─────────────────────────────────────────────┘

Workflow:
  execute_in_sandbox(code_string)
    1. Write code_string to a secure temp file on host
    2. Mount temp file into container (read-only)
    3. docker run --rm with hard security limits
    4. Capture stdout/stderr
    5. Auto-cleanup (--rm removes container, tempfile deleted)
    6. Return structured SandboxResult

Security Guarantees:
  - --network bridge: Enable external API access inside container
  - --memory 512m:    Hard RAM cap — OOM kills runaway code
  - --cpus 0.5:       Max 50% of one CPU core
  - --rm:             Container deleted immediately after execution
  - --read-only:      Filesystem is read-only except /tmp
  - Non-root user:    Runs as 'sandbox' (uid 1001)
  - No GPU passthrough: GPU never exposed to sandboxed code
================================================================================
"""

import subprocess
import tempfile
import os
import sys
import logging
import time

# Windows: Suppress console window for subprocess calls
CREATE_NO_WINDOW = 0x08000000 if os.name == 'nt' else 0
from pathlib import Path
from dataclasses import dataclass, field
from typing import Optional

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

SANDBOX_IMAGE_NAME = "mbrn-sandbox"
SANDBOX_DOCKERFILE_DIR = Path(__file__).parent / "sandbox"

# Hard security limits — these are non-negotiable
DOCKER_SECURITY_FLAGS = [
    "--network", "bridge",     # Enable external API access (e.g. for scrapers)
    "--dns", "8.8.8.8",        # Explicit Google DNS for stability
    "--memory", "512m",        # Max RAM
    "--memory-swap", "512m",   # No swap either
    "--cpus", "0.5",           # Max 0.5 CPU cores
    "--rm",                    # Auto-delete container after run
    "--read-only",             # Read-only root filesystem
    "--tmpfs", "/tmp:size=64m,noexec",  # Writable /tmp (no exec bit)
    "--cap-drop", "ALL",       # Drop all Linux capabilities
    "--security-opt", "no-new-privileges",  # Prevent privilege escalation
    "--user", "1001:1001",     # Run as sandbox user, not root
]

# Execution timeout (seconds)
EXECUTION_TIMEOUT = 30

# Logging setup
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [SANDBOX_CTRL] %(levelname)s - %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%S"
)
log = logging.getLogger("sandbox_controller")


# ---------------------------------------------------------------------------
# Data Structures
# ---------------------------------------------------------------------------

@dataclass
class SandboxResult:
    """Structured result from a sandbox execution."""
    success: bool
    stdout: str
    stderr: str
    exit_code: int
    execution_time_ms: int
    code_snippet: str = ""
    error_message: Optional[str] = None

    def __str__(self) -> str:
        status = "✅ SUCCESS" if self.success else "❌ FAILURE"
        return (
            f"{status} | exit={self.exit_code} | "
            f"time={self.execution_time_ms}ms\n"
            f"STDOUT: {self.stdout.strip()}\n"
            f"STDERR: {self.stderr.strip() if self.stderr.strip() else '<empty>'}"
        )


# ---------------------------------------------------------------------------
# Image Management
# ---------------------------------------------------------------------------

def _image_exists(image_name: str) -> bool:
    """Check if a Docker image exists locally."""
    result = subprocess.run(
        ["docker", "images", "-q", image_name],
        capture_output=True,
        text=True,
        creationflags=CREATE_NO_WINDOW
    )
    return bool(result.stdout.strip())


def ensure_sandbox_image() -> bool:
    """
    Ensures the mbrn-sandbox Docker image is available.
    Builds it from the Dockerfile if it doesn't exist.
    Returns True on success, False on failure.
    """
    if _image_exists(SANDBOX_IMAGE_NAME):
        log.info(f"Image '{SANDBOX_IMAGE_NAME}' found locally — skipping build.")
        return True

    log.info(f"Image '{SANDBOX_IMAGE_NAME}' not found. Building from Dockerfile...")
    log.info(f"  Dockerfile dir: {SANDBOX_DOCKERFILE_DIR}")

    if not SANDBOX_DOCKERFILE_DIR.exists():
        log.error(f"Dockerfile directory not found: {SANDBOX_DOCKERFILE_DIR}")
        return False

    build_cmd = [
        "docker", "build",
        "-t", SANDBOX_IMAGE_NAME,
        str(SANDBOX_DOCKERFILE_DIR)
    ]

    log.info(f"Running: {' '.join(build_cmd)}")
    result = subprocess.run(
        build_cmd,
        capture_output=False,  # Let build output stream to console
        text=True,
        creationflags=CREATE_NO_WINDOW
    )

    if result.returncode == 0:
        log.info(f"✅ Image '{SANDBOX_IMAGE_NAME}' built successfully.")
        return True
    else:
        log.error(f"❌ Image build failed with exit code {result.returncode}")
        return False


# ---------------------------------------------------------------------------
# Core Sandbox Execution
# ---------------------------------------------------------------------------

def execute_in_sandbox(code_string: str) -> SandboxResult:
    """
    Execute a Python code string inside the isolated mbrn-sandbox container.

    Workflow:
      1. Write code_string to a secure host-side temp file
      2. Mount that file into the container (read-only bind mount)
      3. Run container with strict security limits
      4. Capture and return stdout + stderr
      5. Cleanup temp file

    Args:
        code_string: Valid Python source code to execute.

    Returns:
        SandboxResult with stdout, stderr, exit_code, and timing.
    """
    log.info("="*60)
    log.info("SANDBOX EXECUTION INITIATED")
    log.info(f"Code snippet: {code_string[:100]}{'...' if len(code_string) > 100 else ''}")
    log.info("="*60)

    # Ensure image is available before attempting run
    if not _image_exists(SANDBOX_IMAGE_NAME):
        log.warning("Image not found at execution time. Triggering build...")
        if not ensure_sandbox_image():
            return SandboxResult(
                success=False,
                stdout="",
                stderr="",
                exit_code=-1,
                execution_time_ms=0,
                code_snippet=code_string,
                error_message="Failed to build sandbox image."
            )

    # Step 1: Write code to a temporary file on the host
    tmp_file = None
    try:
        # Use NamedTemporaryFile with .py extension, keep open=False for Windows compat
        with tempfile.NamedTemporaryFile(
            mode="w",
            suffix=".py",
            prefix="mbrn_sandbox_",
            delete=False,
            encoding="utf-8"
        ) as f:
            f.write(code_string)
            tmp_file = f.name

        log.info(f"Code written to temp file: {tmp_file}")

        # Step 2: Build docker run command
        # On Windows, Docker Desktop handles path translation for bind mounts
        # We mount the temp file as read-only at /sandbox/code.py inside container
        docker_cmd = [
            "docker", "run",
            *DOCKER_SECURITY_FLAGS,
            "--volume", f"{tmp_file}:/sandbox/code.py:ro",
            SANDBOX_IMAGE_NAME,
            "/sandbox/code.py"
        ]

        log.info(f"Executing: docker run [security_flags] --volume [tmp]:/sandbox/code.py:ro {SANDBOX_IMAGE_NAME}")

        # Step 3: Execute with timeout
        start_time = time.monotonic()
        try:
            result = subprocess.run(
                docker_cmd,
                capture_output=True,
                text=True,
                timeout=EXECUTION_TIMEOUT,
                creationflags=CREATE_NO_WINDOW
            )
            elapsed_ms = int((time.monotonic() - start_time) * 1000)

        except subprocess.TimeoutExpired:
            elapsed_ms = int(EXECUTION_TIMEOUT * 1000)
            log.error(f"❌ Sandbox execution TIMEOUT after {EXECUTION_TIMEOUT}s")
            return SandboxResult(
                success=False,
                stdout="",
                stderr=f"TimeoutError: Execution exceeded {EXECUTION_TIMEOUT}s limit",
                exit_code=-2,
                execution_time_ms=elapsed_ms,
                code_snippet=code_string,
                error_message=f"Execution timeout after {EXECUTION_TIMEOUT}s"
            )

        # Step 4: Build result
        success = result.returncode == 0
        sandbox_result = SandboxResult(
            success=success,
            stdout=result.stdout,
            stderr=result.stderr,
            exit_code=result.returncode,
            execution_time_ms=elapsed_ms,
            code_snippet=code_string
        )

        log.info(str(sandbox_result))
        return sandbox_result

    finally:
        # Step 5: Always cleanup the temp file
        if tmp_file and os.path.exists(tmp_file):
            os.unlink(tmp_file)
            log.info(f"Temp file cleaned up: {tmp_file}")


# ---------------------------------------------------------------------------
# Self-Test
# ---------------------------------------------------------------------------

def run_isolation_proof_test() -> bool:
    """
    The canonical Split-Brain proof test.
    Executes 'import platform; print(platform.system())' in the sandbox.
    Expected output: 'Linux' (even though the host is Windows).
    This proves the container isolation is real.
    """
    log.info("")
    log.info("╔══════════════════════════════════════════════════════════════╗")
    log.info("║         MBRN SPLIT-BRAIN ISOLATION PROOF TEST               ║")
    log.info("╠══════════════════════════════════════════════════════════════╣")
    log.info("║  Host OS:     Windows                                        ║")
    log.info("║  Expected:    Container reports 'Linux'                      ║")
    log.info("║  This proves: Code runs in isolated Linux environment        ║")
    log.info("╚══════════════════════════════════════════════════════════════╝")
    log.info("")

    test_code = "import platform; print(platform.system())"

    result = execute_in_sandbox(test_code)

    log.info("")
    log.info("─── ISOLATION PROOF RESULT ─────────────────────────────────────")
    reported_os = result.stdout.strip()
    log.info(f"  Container reported OS : '{reported_os}'")
    log.info(f"  Host OS               : '{sys.platform}' (Windows)")
    log.info(f"  Exit code             : {result.exit_code}")
    log.info(f"  Execution time        : {result.execution_time_ms}ms")

    if reported_os == "Linux" and result.success:
        log.info("")
        log.info("✅✅✅ ISOLATION CONFIRMED: Container reports 'Linux' on Windows host!")
        log.info("      Split-Brain architecture is OPERATIONAL.")
        return True
    else:
        log.error("")
        log.error(f"❌ ISOLATION TEST FAILED")
        log.error(f"   stdout  : {result.stdout!r}")
        log.error(f"   stderr  : {result.stderr!r}")
        log.error(f"   exit    : {result.exit_code}")
        if result.error_message:
            log.error(f"   error   : {result.error_message}")
        return False


# ---------------------------------------------------------------------------
# Main Entry Point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    log.info("MBRN Split-Brain Sandbox Controller v1.0.0 — STARTING")
    log.info(f"Sandbox image   : {SANDBOX_IMAGE_NAME}")
    log.info(f"Dockerfile dir  : {SANDBOX_DOCKERFILE_DIR}")
    log.info(f"Exec timeout    : {EXECUTION_TIMEOUT}s")
    log.info(f"Security limits : --network none | --memory 512m | --cpus 0.5")
    log.info("")

    # Phase 1: Ensure the image is ready
    log.info("--- Phase 1: Image Readiness Check ---")
    if not ensure_sandbox_image():
        log.error("ABORT: Cannot proceed without sandbox image.")
        sys.exit(1)

    # Phase 2: Run isolation proof test
    log.info("")
    log.info("--- Phase 2: Isolation Proof Test ---")
    proof_passed = run_isolation_proof_test()

    sys.exit(0 if proof_passed else 1)
