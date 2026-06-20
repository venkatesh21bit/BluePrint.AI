import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


RATE_LIMITED = 429


@pytest.mark.anyio
async def test_generate_endpoint(client: AsyncClient):
    response = await client.post(
        "/api/v1/generate",
        json={"conceptPrompt": "A platform that connects local farmers to consumers directly", "userId": "test-user"},
    )
    if response.status_code == RATE_LIMITED:
        pytest.skip("Gemini API rate limit hit — try again later")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data["conceptName"], str) and len(data["conceptName"]) > 0
    assert isinstance(data["jtbdFramework"], list) and len(data["jtbdFramework"]) > 0
    assert data["governance"]["confidenceIndex"] == 0.85
    assert data["governance"]["requiresHumanApproval"] is False


@pytest.mark.anyio
async def test_evaluate_transcript(client: AsyncClient):
    response = await client.post(
        "/api/v1/evaluate-transcript",
        json={"transcript": "User: I love your product, it's amazing. Interviewer: Would you use it? User: Definitely!"},
    )
    if response.status_code == RATE_LIMITED:
        pytest.skip("Gemini API rate limit hit — try again later")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data["qScore"], float)
    assert isinstance(data["facts"], list)
    assert isinstance(data["fluff"], list)
    assert isinstance(data["hypotheticals"], list)
