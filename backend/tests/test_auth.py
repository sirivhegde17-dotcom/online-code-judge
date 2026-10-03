import pytest

def test_register_and_login(client):
    # Register user
    reg_payload = {
        "username": "unittestuser",
        "email": "unittest@example.com",
        "password": "secretpassword123"
    }
    response = client.post("/api/auth/register", json=reg_payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["user"]["username"] == "unittestuser"

    token = data["access_token"]

    # Duplicate registration attempt should return HTTP 409
    dup_resp = client.post("/api/auth/register", json=reg_payload)
    assert dup_resp.status_code == 409

    # Login user
    login_payload = {
        "username_or_email": "unittestuser",
        "password": "secretpassword123"
    }
    login_resp = client.post("/api/auth/login", json=login_payload)
    assert login_resp.status_code == 200
    assert "access_token" in login_resp.json()

    # Get Me profile
    headers = {"Authorization": f"Bearer {token}"}
    me_resp = client.get("/api/auth/me", headers=headers)
    assert me_resp.status_code == 200
    assert me_resp.json()["username"] == "unittestuser"
