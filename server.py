from __future__ import annotations

import os
from datetime import timedelta
from fastapi import FastAPI, Request
from fastapi.responses import PlainTextResponse
from starlette.staticfiles import StaticFiles
from starlette.middleware.base import BaseHTTPMiddleware

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = FastAPI(title="YuGiOh Card Viewer")


class CacheControlMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        path = request.url.path.lower()
        if path.endswith(".json"):
            # Avoid caching large JSON while iterating locally
            response.headers["Cache-Control"] = "no-store"
        elif path.endswith(".css") or path.endswith(".js"):
            max_age = int(timedelta(hours=1).total_seconds())
            response.headers["Cache-Control"] = f"public, max-age={max_age}"
        return response


app.add_middleware(CacheControlMiddleware)


@app.get("/healthz", response_class=PlainTextResponse)
async def healthz() -> str:
    return "ok"

# Serve everything (index.html, styles.css, script.js, card.json) from project root.
# html=True makes "/" return index.html automatically.
app.mount("/", StaticFiles(directory=BASE_DIR, html=True), name="static")

# To run locally:
#   uvicorn server:app --reload --host 0.0.0.0 --port 8000
# To run with gunicorn (recommended for prod-like):
#   gunicorn -w 2 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8001 server:app
