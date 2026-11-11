"""PalmVision AI — optional Python service (FastAPI).

The web app works completely without this service. Deploy it separately
(Render, Railway, Fly.io, Cloud Run, a VPS…) when you want:

* ``POST /api/enhance``   — server-side OpenCV crease enhancement (same steps as the browser pipeline)
* ``POST /api/interpret`` — AI narrative via Claude, with the API key kept on the server
* ``GET  /health``        — liveness probe

Point the frontend at it with ``VITE_AI_API_BASE=https://your-service.example.com``.
A future U-Net palm-line segmentation model can be plugged in at ``segment_lines`` (see models/README.md).
"""
from __future__ import annotations

import base64
import json
import os
from typing import Literal

import cv2
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="PalmVision AI service", version="1.0.0")

ALLOWED_ORIGINS = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

MODEL = os.getenv("ANTHROPIC_MODEL", "claude-opus-5-5")
CATEGORIES = ["personality", "love", "career", "fortune"]
MAX_IMAGE_BYTES = 4 * 1024 * 1024

SYSTEM_PROMPT = """You are the narrator for PalmVision AI, an entertainment app that reads palms using traditional palmistry conventions.

You receive (1) visual features measured by computer vision from a palm photo and (2) rule-based traditional interpretations already generated from those features. Rewrite each category's interpretation as one warm, natural, flowing paragraph (90-150 words).

Rules you must follow:
- Use only the supplied features and interpretations. Do not invent lines, marks, mounts or measurements that are not in the input.
- Frame everything as what palmistry tradition says ("palmists traditionally read..."). Never claim to know the person's real future, and never state predictions as facts.
- No health, medical, lifespan, legal or financial advice. If the life line is mentioned, say tradition links it with vitality, not lifespan.
- If a line was not detected or has low confidence, acknowledge the uncertainty gently instead of interpreting it.
- Write in the requested language (en = English, km = Khmer script).
- Return JSON matching the schema, one paragraph per category."""


# --------------------------------------------------------------- models ---
class EnhanceRequest(BaseModel):
    image: str = Field(..., description="Base64 (optionally data-URL) PNG/JPEG of the canonical palm crop")


class EnhanceResponse(BaseModel):
    gray: str
    enhanced: str
    crease: str
    width: int
    height: int


class Reading(BaseModel):
    category: Literal["personality", "love", "career", "fortune"]
    summary: str = Field("", max_length=1500)
    details: list[str] = Field(default_factory=list, max_length=6)


class InterpretRequest(BaseModel):
    language: Literal["en", "km"] = "en"
    features: dict
    readings: list[Reading]


# ------------------------------------------------------------- helpers ---
def _decode_image(data: str) -> np.ndarray:
    if "," in data and data.startswith("data:"):
        data = data.split(",", 1)[1]
    try:
        raw = base64.b64decode(data, validate=True)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(400, "Image is not valid base64") from exc
    if len(raw) > MAX_IMAGE_BYTES:
        raise HTTPException(413, "Image too large")
    img = cv2.imdecode(np.frombuffer(raw, np.uint8), cv2.IMREAD_COLOR)
    if img is None:
        raise HTTPException(400, "Could not decode image")
    return img


def _encode_png(mat: np.ndarray) -> str:
    ok, buf = cv2.imencode(".png", mat)
    if not ok:
        raise HTTPException(500, "Encoding failed")
    return "data:image/png;base64," + base64.b64encode(buf.tobytes()).decode()


def enhance_creases(img: np.ndarray) -> dict[str, np.ndarray]:
    """Same pipeline as the browser: gray → CLAHE → bilateral → black-hat → Gaussian."""
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    clahe = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8)).apply(gray)
    denoised = cv2.bilateralFilter(clahe, 7, 45, 7)
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (19, 19))
    blackhat = cv2.morphologyEx(denoised, cv2.MORPH_BLACKHAT, kernel)
    smooth = cv2.GaussianBlur(blackhat, (7, 7), 0)
    crease = cv2.normalize(smooth, None, 0, 255, cv2.NORM_MINMAX)
    return {"gray": gray, "enhanced": denoised, "crease": crease}


def segment_lines(img: np.ndarray):  # pragma: no cover - placeholder for a future model
    """Hook for a trained U-Net (PyTorch) that outputs a 4-class palm-line mask.

    Not implemented: the app never pretends a model exists. See models/README.md.
    """
    raise NotImplementedError


# -------------------------------------------------------------- routes ---
@app.get("/health")
def health() -> dict:
    return {"status": "ok", "opencv": cv2.__version__, "ai_configured": bool(os.getenv("ANTHROPIC_API_KEY"))}


@app.post("/api/enhance", response_model=EnhanceResponse)
def enhance(req: EnhanceRequest) -> EnhanceResponse:
    img = _decode_image(req.image)
    out = enhance_creases(img)
    h, w = img.shape[:2]
    return EnhanceResponse(gray=_encode_png(out["gray"]), enhanced=_encode_png(out["enhanced"]), crease=_encode_png(out["crease"]), width=w, height=h)


@app.get("/api/interpret")
def interpret_status() -> dict:
    configured = bool(os.getenv("ANTHROPIC_API_KEY"))
    return {"configured": configured, "model": MODEL if configured else None}


@app.post("/api/interpret")
def interpret(req: InterpretRequest) -> dict:
    if not os.getenv("ANTHROPIC_API_KEY"):
        raise HTTPException(503, "AI narrative is not configured on this server")

    import anthropic  # imported lazily so /api/enhance works without the SDK configured

    payload = {
        "language": req.language,
        "features": {k: req.features.get(k) for k in ("handType", "palmShape", "lines")},
        "readings": [r.model_dump() for r in req.readings],
    }
    schema = {
        "type": "object",
        "properties": {c: {"type": "string"} for c in CATEGORIES},
        "required": CATEGORIES,
        "additionalProperties": False,
    }
    client = anthropic.Anthropic()
    try:
        response = client.beta.messages.create(
            model=MODEL,
            max_tokens=4000,
            betas=["server-side-fallback-2026-07-01"],
            fallbacks="default",
            output_config={"effort": "low", "format": {"type": "json_schema", "schema": schema}},
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": f"Language: {req.language}\n\nInput:\n{json.dumps(payload, ensure_ascii=False, indent=2)}"}],
        )
    except anthropic.AuthenticationError as exc:
        raise HTTPException(503, "AI service credentials are invalid") from exc
    except anthropic.RateLimitError as exc:
        raise HTTPException(429, "AI service is busy, please try again later") from exc
    except anthropic.APIStatusError as exc:
        raise HTTPException(502, f"AI service error ({exc.status_code})") from exc
    except anthropic.APIConnectionError as exc:
        raise HTTPException(502, "Could not reach the AI service") from exc

    if response.stop_reason == "refusal":
        raise HTTPException(502, "The model declined this request")
    text = "".join(b.text for b in response.content if b.type == "text")
    try:
        narratives = json.loads(text)
    except json.JSONDecodeError as exc:
        raise HTTPException(502, "AI service returned an unexpected format") from exc
    return {"narratives": narratives, "model": response.model}
