"""
Output validator for comparing actual program output against expected output.
Ignores trailing whitespace per line and normalizes newline differences.
"""

def normalize_output(text: str) -> str:
    if text is None:
        return ""
    # Normalize Windows CRLF to LF
    normalized = text.replace("\r\n", "\n").replace("\r", "\n")
    # Strip trailing whitespace from each line and filter out trailing empty lines
    lines = [line.rstrip() for line in normalized.split("\n")]
    while lines and lines[-1] == "":
        lines.pop()
    return "\n".join(lines)

def compare_outputs(actual_output: str, expected_output: str) -> bool:
    """Compare normalized actual output against expected output."""
    clean_actual = normalize_output(actual_output)
    clean_expected = normalize_output(expected_output)
    return clean_actual == clean_expected
