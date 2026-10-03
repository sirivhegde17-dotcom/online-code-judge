"""
Automated database seed script.
Inserts default Admin user, Test User, and 5 Sample Problems with public & hidden test cases.
"""

from app.database.session import SessionLocal, init_db
from app.models.user import User, UserRole
from app.models.problem import Problem, ProblemDifficulty
from app.models.test_case import TestCase
from app.models.leaderboard import Leaderboard
from app.core.security import hash_password

def seed_database():
    print("Initializing database tables...")
    init_db()

    db = SessionLocal()
    try:
        # 1. Seed Admin User
        admin_user = db.query(User).filter(User.username == "admin").first()
        if not admin_user:
            admin_user = User(
                username="admin",
                email="admin@codejudge.org",
                password_hash=hash_password("admin123"),
                role=UserRole.ADMIN,
                is_active=True
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
            db.add(Leaderboard(user_id=admin_user.id))
            db.commit()
            print("Created Admin user (admin / admin123)")

        # 2. Seed Standard User
        test_user = db.query(User).filter(User.username == "coder").first()
        if not test_user:
            test_user = User(
                username="coder",
                email="coder@codejudge.org",
                password_hash=hash_password("user123"),
                role=UserRole.USER,
                is_active=True
            )
            db.add(test_user)
            db.commit()
            db.refresh(test_user)
            db.add(Leaderboard(user_id=test_user.id))
            db.commit()
            print("Created Test user (coder / user123)")

        # 2b. Seed Generic Coder01 User
        coder01_user = db.query(User).filter(User.username == "coder01").first()
        if not coder01_user:
            coder01_user = User(
                username="coder01",
                email="coder01@example.com",
                password_hash=hash_password("Coder@123"),
                role=UserRole.USER,
                is_active=True
            )
            db.add(coder01_user)
            db.commit()
            db.refresh(coder01_user)
            db.add(Leaderboard(user_id=coder01_user.id))
            db.commit()
            print("Created Generic user (coder01 / Coder@123)")

        # 3. Seed Sample Problems
        problems_data = [
            {
                "title": "Two Sum",
                "difficulty": ProblemDifficulty.EASY,
                "description": "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
                "constraints": "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9",
                "input_format": "Line 1: Space-separated integers representing nums\nLine 2: Target integer",
                "output_format": "Space-separated 0-indexed indices of the two numbers",
                "sample_input": "2 7 11 15\n9",
                "sample_output": "0 1",
                "tags": ["Array", "Hash Table"],
                "time_limit": 2.0,
                "memory_limit": 128,
                "test_cases": [
                    {"input": "2 7 11 15\n9", "expected_output": "0 1", "is_hidden": False},
                    {"input": "3 2 4\n6", "expected_output": "1 2", "is_hidden": False},
                    {"input": "3 3\n6", "expected_output": "0 1", "is_hidden": True},
                    {"input": "1 5 3 8 9\n12", "expected_output": "2 4", "is_hidden": True},
                ]
            },
            {
                "title": "Reverse String",
                "difficulty": ProblemDifficulty.EASY,
                "description": "Write a function that reverses a string.\n\nInput is provided as a single line string. Output the reversed string.",
                "constraints": "1 <= s.length <= 10^5",
                "input_format": "Single string S",
                "output_format": "Reversed string S",
                "sample_input": "hello",
                "sample_output": "olleh",
                "tags": ["String", "Two Pointers"],
                "time_limit": 2.0,
                "memory_limit": 128,
                "test_cases": [
                    {"input": "hello", "expected_output": "olleh", "is_hidden": False},
                    {"input": "CodeJudge", "expected_output": "egduJedoC", "is_hidden": False},
                    {"input": "a", "expected_output": "a", "is_hidden": True},
                    {"input": "racecar", "expected_output": "racecar", "is_hidden": True},
                ]
            },
            {
                "title": "Valid Parentheses",
                "difficulty": ProblemDifficulty.EASY,
                "description": "Given a string `s` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\nPrint `true` if valid, otherwise `false`.",
                "constraints": "1 <= s.length <= 10^4",
                "input_format": "Single string s containing bracket characters",
                "output_format": "`true` or `false`",
                "sample_input": "()[]{}",
                "sample_output": "true",
                "tags": ["String", "Stack"],
                "time_limit": 2.0,
                "memory_limit": 128,
                "test_cases": [
                    {"input": "()[]{}", "expected_output": "true", "is_hidden": False},
                    {"input": "(]", "expected_output": "false", "is_hidden": False},
                    {"input": "([{}])", "expected_output": "true", "is_hidden": True},
                    {"input": "(((", "expected_output": "false", "is_hidden": True},
                ]
            },
            {
                "title": "Binary Search",
                "difficulty": ProblemDifficulty.MEDIUM,
                "description": "Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`. If `target` exists, print its 0-based index. Otherwise, print `-1`.",
                "constraints": "1 <= nums.length <= 10^4\nAll integers in nums are unique.",
                "input_format": "Line 1: Space-separated sorted array elements\nLine 2: Target integer",
                "output_format": "Index of target or -1",
                "sample_input": "-1 0 3 5 9 12\n9",
                "sample_output": "4",
                "tags": ["Array", "Binary Search"],
                "time_limit": 2.0,
                "memory_limit": 128,
                "test_cases": [
                    {"input": "-1 0 3 5 9 12\n9", "expected_output": "4", "is_hidden": False},
                    {"input": "-1 0 3 5 9 12\n2", "expected_output": "-1", "is_hidden": False},
                    {"input": "5\n5", "expected_output": "0", "is_hidden": True},
                    {"input": "1 3 5 7 9 11\n11", "expected_output": "5", "is_hidden": True},
                ]
            },
            {
                "title": "Fibonacci Number",
                "difficulty": ProblemDifficulty.EASY,
                "description": "The Fibonacci numbers, commonly denoted F(n) form a sequence, such that each number is the sum of the two preceding ones, starting from 0 and 1. That is:\nF(0) = 0, F(1) = 1\nF(n) = F(n - 1) + F(n - 2) for n > 1.\n\nGiven `n`, calculate `F(n)`.",
                "constraints": "0 <= n <= 30",
                "input_format": "Single integer n",
                "output_format": "Single integer representing F(n)",
                "sample_input": "4",
                "sample_output": "3",
                "tags": ["Math", "Dynamic Programming", "Recursion"],
                "time_limit": 2.0,
                "memory_limit": 128,
                "test_cases": [
                    {"input": "2", "expected_output": "1", "is_hidden": False},
                    {"input": "4", "expected_output": "3", "is_hidden": False},
                    {"input": "0", "expected_output": "0", "is_hidden": True},
                    {"input": "10", "expected_output": "55", "is_hidden": True},
                ]
            }
        ]

        for pdata in problems_data:
            existing = db.query(Problem).filter(Problem.title == pdata["title"]).first()
            if not existing:
                tcs_data = pdata.pop("test_cases")
                prob = Problem(**pdata)
                db.add(prob)
                db.commit()
                db.refresh(prob)

                for tc_d in tcs_data:
                    tc = TestCase(problem_id=prob.id, **tc_d)
                    db.add(tc)
                db.commit()
                print(f"Created problem: '{prob.title}' with {len(tcs_data)} test cases")

        print("Database seed completed successfully!")

    except Exception as e:
        db.rollback()
        print(f"Database seed failed: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
