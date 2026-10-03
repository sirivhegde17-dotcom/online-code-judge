import sys
import time
import subprocess
import os

def run_cpp():
    if len(sys.argv) < 2:
        print("Usage: cpp_runner.py <cpp_source_path> [timeout_sec]")
        sys.exit(1)

    src_path = sys.argv[1]
    timeout_sec = float(sys.argv[2]) if len(sys.argv) > 2 else 2.0
    exe_path = os.path.join(os.path.dirname(src_path), "a.out")

    # Compile
    comp = subprocess.run(["g++", "-O2", src_path, "-o", exe_path], capture_output=True, text=True)
    if comp.returncode != 0:
        sys.stderr.write(comp.stderr)
        sys.exit(1)

    # Execute
    try:
        proc = subprocess.Popen(
            [exe_path],
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
    run_cpp()
