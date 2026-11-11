import base64

import cv2
import numpy as np
from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def _png_b64(img):
    ok, buf = cv2.imencode(".png", img)
    assert ok
    return base64.b64encode(buf.tobytes()).decode()


def test_health():
    r = client.get("/health")
    assert r.status_code == 200 and r.json()["status"] == "ok"


def test_enhance_highlights_a_dark_line():
    img = np.full((256, 256, 3), 190, np.uint8)
    cv2.line(img, (20, 128), (236, 140), (120, 110, 110), 3)
    r = client.post("/api/enhance", json={"image": _png_b64(img)})
    assert r.status_code == 200
    data = r.json()
    raw = base64.b64decode(data["crease"].split(",", 1)[1])
    crease = cv2.imdecode(np.frombuffer(raw, np.uint8), cv2.IMREAD_GRAYSCALE)
    assert crease[134, 128] > crease[40, 128] + 100  # the line is bright in the crease map


def test_enhance_rejects_garbage():
    assert client.post("/api/enhance", json={"image": "not-base64!!"}).status_code == 400


def test_interpret_without_key_is_503(monkeypatch):
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    r = client.post("/api/interpret", json={"language": "en", "features": {}, "readings": []})
    assert r.status_code == 503
    assert client.get("/api/interpret").json()["configured"] is False
