import pytest

def test_problems_api(client):
    # Public problem list should initially be accessible
    response = client.get("/api/problems")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

    # Creating problem without admin rights should return HTTP 401/403
    prob_payload = {
        "title": "Sample Test Problem",
        "description": "Calculate A + B",
        "difficulty": "EASY",
        "time_limit": 2.0,
        "memory_limit": 128
    }
    unauth_resp = client.post("/api/problems", json=prob_payload)
    assert unauth_resp.status_code in (401, 403)
