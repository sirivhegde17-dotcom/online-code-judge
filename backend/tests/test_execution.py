import pytest
from app.execution.validator import compare_outputs, normalize_output
from app.execution.executor import CodeExecutor
from app.models.submission import SubmissionLanguage, SubmissionStatus

def test_validator_normalization():
    assert compare_outputs("hello world \r\n", "hello world\n") is True
    assert compare_outputs("1 2 3\n\n", "1 2 3") is True
    assert compare_outputs("output", "different output") is False

def test_python_code_execution():
    code = "a, b = map(int, input().split())\nprint(a + b)"
    input_data = "10 20\n"
    res = CodeExecutor.run_code(
        language=SubmissionLanguage.PYTHON,
        source_code=code,
        input_data=input_data,
        use_docker_if_available=False
    )
    assert res.status == SubmissionStatus.ACCEPTED
    assert res.stdout.strip() == "30"

def test_python_syntax_error():
    code = "invalid python code syntax !!!"
    res = CodeExecutor.run_code(
        language=SubmissionLanguage.PYTHON,
        source_code=code,
        input_data="",
        use_docker_if_available=False
    )
    assert res.status == SubmissionStatus.RUNTIME_ERROR
    assert len(res.stderr) > 0
