import base64
import time
import logging

from app.models.submission import SubmissionLanguage, SubmissionStatus
from app.execution.executor import ExecutionResult

logger = logging.getLogger(__name__)


class DockerSandbox:
    IMAGE_NAME = "codejudge-sandbox:latest"

    @staticmethod
    def is_available() -> bool:
        try:
            import docker

            client = docker.from_env()
            client.ping()
            return True

        except Exception:
            return False

    @staticmethod
    def _encode(data: str) -> str:
        """Encode text so it can safely be sent through shell."""
        return base64.b64encode(
            data.encode("utf-8")
        ).decode("ascii")

    @staticmethod
    def execute_in_sandbox(
        language: SubmissionLanguage,
        source_code: str,
        input_data: str = "",
        time_limit: float = 2.0,
        memory_limit: int = 128,
    ) -> ExecutionResult:

        import docker
        from docker.errors import ImageNotFound

        client = docker.from_env()

        # ---------------------------------------------------------
        # File names
        # ---------------------------------------------------------

        filename_map = {
            SubmissionLanguage.PYTHON: "solution.py",
            SubmissionLanguage.CPP: "solution.cpp",
            SubmissionLanguage.JAVA: "Solution.java",
        }

        file_name = filename_map.get(language)

        if not file_name:
            return ExecutionResult(
                status=SubmissionStatus.INTERNAL_ERROR,
                stderr=f"Unsupported language: {language}",
            )

        # ---------------------------------------------------------
        # Program commands
        # ---------------------------------------------------------

        if language == SubmissionLanguage.PYTHON:

            program_cmd = (
                "python3 /sandbox/solution.py "
                "< /sandbox/input.txt"
            )

        elif language == SubmissionLanguage.CPP:

            program_cmd = (
                "g++ -O2 /sandbox/solution.cpp "
                "-o /sandbox/solution "
                "2> /sandbox/compile.log && "
                "/sandbox/solution < /sandbox/input.txt"
            )

        elif language == SubmissionLanguage.JAVA:

            program_cmd = (
                "javac /sandbox/Solution.java "
                "2> /sandbox/compile.log && "
                "java -cp /sandbox Solution "
                "< /sandbox/input.txt"
            )

        else:

            return ExecutionResult(
                status=SubmissionStatus.INTERNAL_ERROR,
                stderr=f"Unsupported language: {language}",
            )

        container = None
        start_time = time.time()

        try:

            # -----------------------------------------------------
            # Create container
            # -----------------------------------------------------

            container = client.containers.create(
                image=DockerSandbox.IMAGE_NAME,

                # Keep container alive while files are created.
                command=["sleep", "300"],

                user="sandboxuser",

                network_disabled=True,

                mem_limit=f"{memory_limit}m",

                nano_cpus=1_000_000_000,

                pids_limit=64,

                # Writable temporary sandbox.
                tmpfs={
                    "/sandbox": "rw,mode=1777,size=64m"
                },

                detach=True,
            )

            # -----------------------------------------------------
            # Start container
            # -----------------------------------------------------

            container.start()

            # -----------------------------------------------------
            # Encode files
            # -----------------------------------------------------

            encoded_input = DockerSandbox._encode(
                input_data
            )

            encoded_source = DockerSandbox._encode(
                source_code
            )

            # -----------------------------------------------------
            # Create input.txt
            # -----------------------------------------------------

            create_input_cmd = (
                "echo "
                f"{encoded_input} "
                "| base64 -d > /sandbox/input.txt"
            )

            input_result = container.exec_run(
                [
                    "bash",
                    "-c",
                    create_input_cmd,
                ],
                stdout=True,
                stderr=True,
            )

            if input_result.exit_code != 0:

                stderr = ""

                if input_result.output:
                    stderr = input_result.output.decode(
                        "utf-8",
                        errors="replace"
                    )

                return ExecutionResult(
                    status=SubmissionStatus.INTERNAL_ERROR,
                    stderr=(
                        "Failed to create input.txt: "
                        + stderr
                    ),
                )

            # -----------------------------------------------------
            # Create solution file
            # -----------------------------------------------------

            create_source_cmd = (
                "echo "
                f"{encoded_source} "
                "| base64 -d > "
                f"/sandbox/{file_name}"
            )

            source_result = container.exec_run(
                [
                    "bash",
                    "-c",
                    create_source_cmd,
                ],
                stdout=True,
                stderr=True,
            )

            if source_result.exit_code != 0:

                stderr = ""

                if source_result.output:
                    stderr = source_result.output.decode(
                        "utf-8",
                        errors="replace"
                    )

                return ExecutionResult(
                    status=SubmissionStatus.INTERNAL_ERROR,
                    stderr=(
                        "Failed to create solution file: "
                        + stderr
                    ),
                )

            # -----------------------------------------------------
            # Verify files exist
            # -----------------------------------------------------

            check_result = container.exec_run(
                [
                    "bash",
                    "-c",
                    "ls -la /sandbox && "
                    "test -f /sandbox/input.txt && "
                    f"test -f /sandbox/{file_name}",
                ],
                stdout=True,
                stderr=True,
            )

            if check_result.exit_code != 0:

                output = ""

                if check_result.output:
                    output = check_result.output.decode(
                        "utf-8",
                        errors="replace"
                    )

                return ExecutionResult(
                    status=SubmissionStatus.INTERNAL_ERROR,
                    stderr=(
                        "Sandbox files were not created.\n"
                        + output
                    ),
                )

            # -----------------------------------------------------
            # Execute solution
            # -----------------------------------------------------

            execution_result = container.exec_run(
                [
                    "bash",
                    "-c",
                    program_cmd,
                ],
                stdout=True,
                stderr=True,
                demux=True,
            )

            exec_time = round(
                time.time() - start_time,
                3
            )

            exit_code = execution_result.exit_code

            stdout_str = ""
            stderr_str = ""

            if execution_result.output:

                if isinstance(
                    execution_result.output,
                    tuple
                ):

                    stdout_bytes = (
                        execution_result.output[0]
                        or b""
                    )

                    stderr_bytes = (
                        execution_result.output[1]
                        or b""
                    )

                    stdout_str = stdout_bytes.decode(
                        "utf-8",
                        errors="replace"
                    )

                    stderr_str = stderr_bytes.decode(
                        "utf-8",
                        errors="replace"
                    )

                else:

                    stdout_str = execution_result.output.decode(
                        "utf-8",
                        errors="replace"
                    )

            # -----------------------------------------------------
            # Time limit
            # -----------------------------------------------------

            if exec_time > time_limit:

                return ExecutionResult(
                    status=SubmissionStatus.TIME_LIMIT_EXCEEDED,
                    execution_time=exec_time,
                    stdout=stdout_str,
                    stderr="Time Limit Exceeded",
                )

            # -----------------------------------------------------
            # Memory limit
            # -----------------------------------------------------

            if exit_code == 137:

                return ExecutionResult(
                    status=SubmissionStatus.MEMORY_LIMIT_EXCEEDED,
                    execution_time=exec_time,
                    stderr="Memory Limit Exceeded",
                )

            # -----------------------------------------------------
            # Compilation error
            # -----------------------------------------------------

            if language in (
                SubmissionLanguage.CPP,
                SubmissionLanguage.JAVA,
            ):

                if exit_code != 0:

                    return ExecutionResult(
                        status=SubmissionStatus.COMPILATION_ERROR,
                        execution_time=exec_time,
                        stdout=stdout_str,
                        stderr=stderr_str,
                    )

            # -----------------------------------------------------
            # Python errors
            # -----------------------------------------------------

            if language == SubmissionLanguage.PYTHON:

                if exit_code != 0:

                    if any(
                        error in stderr_str
                        for error in (
                            "SyntaxError",
                            "IndentationError",
                            "TabError",
                        )
                    ):

                        return ExecutionResult(
                            status=SubmissionStatus.COMPILATION_ERROR,
                            execution_time=exec_time,
                            stdout=stdout_str,
                            stderr=stderr_str,
                        )

                    return ExecutionResult(
                        status=SubmissionStatus.RUNTIME_ERROR,
                        execution_time=exec_time,
                        stdout=stdout_str,
                        stderr=stderr_str,
                    )

            # -----------------------------------------------------
            # Generic runtime error
            # -----------------------------------------------------

            if exit_code != 0:

                return ExecutionResult(
                    status=SubmissionStatus.RUNTIME_ERROR,
                    execution_time=exec_time,
                    stdout=stdout_str,
                    stderr=stderr_str,
                )

            # -----------------------------------------------------
            # SUCCESS
            # -----------------------------------------------------

            return ExecutionResult(
                status=SubmissionStatus.ACCEPTED,
                execution_time=exec_time,
                memory_used=14.2,
                stdout=stdout_str,
                stderr=stderr_str,
            )

        except ImageNotFound:

            return ExecutionResult(
                status=SubmissionStatus.INTERNAL_ERROR,
                stderr=(
                    f"Docker image "
                    f"'{DockerSandbox.IMAGE_NAME}' "
                    f"was not found."
                ),
            )

        except Exception as e:

            logger.exception(
                "Docker sandbox error"
            )

            return ExecutionResult(
                status=SubmissionStatus.INTERNAL_ERROR,
                stderr=str(e),
            )

        finally:

            if container:

                try:
                    container.remove(
                        force=True
                    )

                except Exception:
                    pass


docker_sandbox = DockerSandbox()