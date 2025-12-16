import json
import os
import time
from urllib import request as urlrequest
from urllib.error import URLError, HTTPError
import requests

from flask import Flask, render_template, jsonify, request
from flask.cli import load_dotenv

app = Flask(__name__)

app.config["MAX_CONTENT_LENGTH"] = 16 * 1024

load_dotenv()
DISCORD_WEBHOOK_URL = os.getenv("DISCORD_WEBHOOK_URL")

COOLDOWN_SECONDS = 60 * 60
_last_feedback_by_ip = {}

PROHIBITED_WORDS = {
    'fuck', 'shit', 'asshole', 'bitch', 'bastard', 'damn', 'crap', 'dick', 'piss', 'cunt',
    'motherfucker', 'douche', 'prick', 'whore', 'slut', 'fag', 'nigger', 'spic', 'retard',
    'twat', 'bollocks', 'wanker', 'bugger', 'arse', 'shithead', 'dumbass', 'jackass',
    'dipshit', 'dildo', 'knobhead', 'ballsack', 'buttfucker', 'cum', 'jizz', 'cocksucker',
    'fucker', 'skank', 'pussy', 'tits', 'clit', 'schlong', 'dickhead', 'goddamn', 'hell',
    'bitchass', 'fuckface', 'shitfaced', 'asshat', 'bint', 'chink', 'gook', 'jap', 'negro',
    'dyke', 'queer', 'tranny', 'tosser', 'spaz', 'mong', 'coon', 'beaner', 'cracker',
    'wetback', 'homo', 'fudgepacker', 'tard', 'cocks', 'numbnuts', 'knob', 'muppet',
    'git', 'shag', 'minge', 'nonce', 'plonker', 'pillock'
}


def _get_client_ip() -> str:
    xff = request.headers.get("X-Forwarded-For", "").split(",")[0].strip()
    return xff or (request.remote_addr or "unknown")


def _contains_prohibited_word(text: str) -> bool:
    lower = text.lower()
    return any(w in lower for w in PROHIBITED_WORDS)


def _post_to_discord(payload: dict) -> None:
    if not DISCORD_WEBHOOK_URL:
        raise RuntimeError("DISCORD_WEBHOOK_URL is not set on the server.")
    url = DISCORD_WEBHOOK_URL.strip()
    if "?" not in url:
        url += "?wait=true"
    headers = {
        "User-Agent": "TRLStatsFeedback/1.0 (contact: fretux@fretux.ch)",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    resp = requests.post(url, json=payload, headers=headers, timeout=10)
    if resp.status_code not in (200, 204):
        raise RuntimeError(f"Discord returned {resp.status_code}: {resp.text[:500]}")


@app.post("/api/feedback")
def api_feedback():
    ip = _get_client_ip()
    now = time.time()
    last = _last_feedback_by_ip.get(ip, 0)

    if now - last < COOLDOWN_SECONDS:
        retry_after = int(COOLDOWN_SECONDS - (now - last))
        return jsonify({
            "ok": False,
            "error": f"Please wait {retry_after} seconds before submitting again."
        }), 429

    data = request.get_json(silent=True) or {}

    name = (data.get("name") or "Anonymous").strip()
    rating = data.get("rating")
    comment = (data.get("comment") or "").strip()

    # Normalize and validate
    if len(name) > 32:
        name = name[:32]

    try:
        rating_int = int(rating)
    except (TypeError, ValueError):
        return jsonify({"ok": False, "error": "Rating must be a number."}), 400

    if rating_int < 1 or rating_int > 10:
        return jsonify({"ok": False, "error": "Rating must be between 1 and 10."}), 400

    if len(comment) < 5 or len(comment) > 500:
        return jsonify({"ok": False, "error": "Comment must be between 5 and 500 characters."}), 400

    if _contains_prohibited_word(comment):
        return jsonify({"ok": False, "error": "Your comment contains inappropriate content."}), 400

    content = f"**Rating:** {rating_int}\n**Comment:**\n{comment}"

    try:
        _post_to_discord({
            "username": name,
            "content": content
        })
    except (HTTPError, URLError, RuntimeError) as e:
        return jsonify({"ok": False, "error": f"Failed to forward feedback: {str(e)}"}), 502

    _last_feedback_by_ip[ip] = now
    return jsonify({"ok": True}), 200


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/calculator')
def calculator():
    return render_template('calculator.html')


@app.route('/about_us')
def about_us():
    return render_template('about_us.html')


@app.route('/suggestion')
def suggestion():
    return render_template('suggestion.html')


if __name__ == '__main__':
    app.run(debug=True)
