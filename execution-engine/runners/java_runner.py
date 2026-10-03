import sys
import time
import subprocess
import os

def run_java():
    if len(sys.argv) < 2:
        print("Usage: java_runner.py <java_source_path> [timeout_sec]")
        sys.exit(1)

    src_path = sys.argv[1]
    timeout_sec = float(sys.argv[2]) if len(sys.argv) > 2 else 2.0
    src_dir = os.path.dirname(src_path)

    # Compile
    comp = subprocess.run(["javac", src_path], capture_output=True, text=True)
    if comp.returncode != 0:
        sys.stderr.write(comp.stderr)
        sys.exit(1)

    # Execute
    try:
        proc = subprocess.Popen(
            ["java", "-cp", src_dir, "Solution"],
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
    run_java()
