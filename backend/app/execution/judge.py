from typing import List, Dict, Any, Tuple
from app.models.submission import SubmissionLanguage, SubmissionStatus
from app.execution.executor import CodeExecutor, ExecutionResult
from app.execution.validator import compare_outputs

class JudgeEngine:
    @staticmethod
    def evaluate_test_cases(
        language: SubmissionLanguage,
        source_code: str,
        test_cases: List[Any],  # List of TestCase OR test case dicts
        time_limit: float = 2.0,
        memory_limit: int = 128
    ) -> Tuple[SubmissionStatus, float, float, List[Dict[str, Any]]]:
        """
        Runs submission against all test cases.
        Returns:
          (overall_status, max_execution_time, max_memory_used, per_test_case_results)
        """
        overall_status = SubmissionStatus.ACCEPTED
        max_time = 0.0
        max_memory = 0.0
        results = []

        for tc in test_cases:
            if isinstance(tc, dict):
                tc_id = tc.get("id")
                tc_input = tc.get("input", "")
                tc_expected = tc.get("expected_output", "")
            else:
                tc_id = getattr(tc, "id", None)
                tc_input = getattr(tc, "input", "")
                tc_expected = getattr(tc, "expected_output", "")

            # Execute code for single testcase
            exec_res: ExecutionResult = CodeExecutor.run_code(
                language=language,
                source_code=source_code,
                input_data=tc_input,
                time_limit=time_limit,
                memory_limit=memory_limit
            )

            tc_status = exec_res.status
            if exec_res.execution_time > max_time:
                max_time = exec_res.execution_time
            if exec_res.memory_used > max_memory:
                max_memory = exec_res.memory_used

            # If execution ran fine, check output match
            if tc_status == SubmissionStatus.ACCEPTED:
                if not compare_outputs(exec_res.stdout, tc_expected):
                    tc_status = SubmissionStatus.WRONG_ANSWER

            results.append({
                "test_case_id": tc_id,
                "status": tc_status,
                "execution_time": exec_res.execution_time,
                "memory_used": exec_res.memory_used,
                "stdout": exec_res.stdout,
                "stderr": exec_res.stderr,
            })

            # If compilation error or fatal failure, break immediately
            if tc_status in (SubmissionStatus.COMPILATION_ERROR, SubmissionStatus.INTERNAL_ERROR):
                overall_status = tc_status
                break

            # Short-circuit overall status if not ACCEPTED and overall is still ACCEPTED
            if tc_status != SubmissionStatus.ACCEPTED and overall_status == SubmissionStatus.ACCEPTED:
                overall_status = tc_status

        return overall_status, round(max_time, 3), round(max_memory, 2), results

judge_engine = JudgeEngine()
