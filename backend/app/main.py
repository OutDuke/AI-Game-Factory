from app.services.ollama_service import generate_game_spec
from app.services.config_generator import generate_game_config
from fastapi import FastAPI
from fastapi import FastAPI
from app.models.game import GameRequest
from app.models.game_spec import GameSpec, PlayerSpec, ObstacleSpec
from pathlib import Path
from app.services.config_writer import save_game_config
import re

app = FastAPI(
    title="AI Game Factory",
    description="Backend orchestration system for AI-generated games",
    version="0.1.0"
)


@app.get("/")
def root():
    return {
        "message": "AI Game Factory is running!"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "AI Game Factory Backend"
    }


@app.post("/generate")
def generate_game(request: GameRequest):
    return {
        "message": "Game request received successfully!",
        "game": {
            "name": request.game_name,
            "genre": request.genre,
            "description": request.description
        },
        "status": "pending"
    }



@app.post("/generate-spec")


@app.post("/generate-game-config")
async def generate_game_configuration(request: GameRequest):
    game_id = re.sub(
        r"[^a-z0-9]+",
        "-",
        request.game_name.lower()
    ).strip("-")

    # Step 1: Generate game specification using AI
    game_spec = await generate_game_spec(request.description)

    # Step 2: Convert specification into Phaser config
    game_config = generate_game_config(game_spec)

    # Step 3: Find the project root directory
    project_root = Path(__file__).resolve().parents[2]

    # Step 4: Define the frontend output location
    output_path = (
        project_root
        / "generated-games"
        / game_id
        / "game-config.json"
    )

    # Step 5: Save the generated configuration
    saved_file = save_game_config(
        game_config,
        str(output_path)
    )

    # Step 6: Save the original AI-generated specification
    spec_path = (
        project_root
        / "generated-games"
        / game_id
        / "game-spec.json"
    )

    saved_spec = save_game_config(
        game_spec.model_dump(),
        str(spec_path)
    )

    # Step 7: Copy configuration to the Phaser frontend
    frontend_config_path = (
        project_root
        / "game-engine"
        / "neon-dodge"
        / "public"
        / "generated-configs"
        / f"{game_id}.json"
    )

    saved_frontend_config = save_game_config(
        game_config,
        str(frontend_config_path)
    )

    return {
        "status": "success",
        "message": "Game configuration generated and saved!",
        "game_id": game_id,
        "saved_to": str(saved_file),
        "game_specification": game_spec.model_dump(),
        "game_configuration": game_config,
        "saved_specification": str(saved_spec),
        "frontend_config": str(saved_frontend_config),
    }