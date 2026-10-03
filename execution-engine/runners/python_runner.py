import sys
import time
import subprocess
import os

def run_python():
    if len(sys.argv) < 2:
        print("Usage: python_runner.py <script_path> [timeout_sec]")
        sys.exit(1)

    script_path = sys.argv[1]
    timeout_sec = float(sys.argv[2]) if len(sys.argv) > 2 else 2.0

    start_time = time.time()
    try:
        proc = subprocess.Popen(
            [sys.executable, script_path],
            stdin=sys.stdin,
            stdout=sys.stdout,
            stderr=sys.stderr
        )
        proc.wait(timeout=timeout_sec)
        sys.exit(proc.returncode)
    except subprocess.TimeoutExpired:
        proc.kill()
        sys.stderr.write("TIME_LIMIT_EXCEEDED\n")
        sys.exit(124)

if __name__ == "__main__":
    run_python()
