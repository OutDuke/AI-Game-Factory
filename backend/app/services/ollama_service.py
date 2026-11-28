
import httpx

from app.models.game_spec import GameSpec

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "qwen3.5:4b"


async def generate_game_spec(game_idea: str) -> GameSpec:

    prompt = f"""
    You are a professional 2D arcade game designer.

    Design a game based on this idea:

    {game_idea}

    Create a practical game specification.
    Follow these rules:
    - Use simple mechanics suitable for a 2D arcade game.
    - Starting lives must be between 1 and 5.
    - Player speed must be positive.
    - Obstacle speed must be positive.
    - Spawn interval must be positive.
    - Keep controls simple.
    - Make scoring rules understandable.
    - Player speed must be between 200 and 500.
    - Obstacle speed must be between 100 and 400.
    - Spawn interval must be between 500 and 2000 milliseconds.
    - Scoring should be expressed as a numeric value.
    - Difficulty should describe progressive increases in obstacle speed or spawn frequency.
    - Use values appropriate for a Phaser arcade game.
    - score_per_obstacle must be a positive integer.
    - The scoring_rule must agree with score_per_obstacle.
    - Generate player speed between 200 and 500.
    - Generate obstacle speed between 100 and 400.
    - Generate spawn_interval between 500 and 2000 milliseconds.
    - Generate between 2 and 4 different obstacle types.
    - Each obstacle must have a unique and descriptive name.
    - Give every obstacle its own width and height.
    - Obstacle width and height must be between 10 and 150.
    - Choose a valid RGB integer color between 0 and 16777215.
    - Give each obstacle a speed_multiplier between 0.5 and 2.0.
    - Give each obstacle a positive speed.
    - Give each obstacle a spawn_interval between 500 and 2000 milliseconds.
    - Make obstacle designs appropriate for the game theme.
    """

    payload = {
        "model": MODEL_NAME,
        "prompt": prompt,
        "format": GameSpec.model_json_schema(),
        "stream": False,
        "think": False,
        "options": {
            "temperature": 0.2,
            "num_predict": 800
        }
    }

    timeout = httpx.Timeout(
        connect=10.0,
        read=600.0,
        write=30.0,
        pool=10.0
    )

    async with httpx.AsyncClient(timeout=timeout) as client:
        response = await client.post(
            OLLAMA_URL,
            json=payload
        )

        response.raise_for_status()

    data = response.json()

    if not data.get("response"):
        raise RuntimeError("Ollama returned an empty response")

    return GameSpec.model_validate_json(data["response"])
