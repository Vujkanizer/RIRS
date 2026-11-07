import os
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

db = SQLAlchemy()
jwt = JWTManager()


def create_app():
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ["DATABASE_URL"]
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JWT_SECRET_KEY"] = os.environ["JWT_SECRET"]

    db.init_app(app)
    jwt.init_app(app)
    CORS(app, origins=["http://localhost:5173"])

    @app.get("/health")
    def health():
        return jsonify(status="ok")

    from app import models  # noqa: F401

    return app
