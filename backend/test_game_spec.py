import asyncio

from app.services.ollama_service import generate_game_spec
from app.services.config_generator import generate_game_config


async def main():

    spec = await generate_game_spec(
        "A spaceship dodges falling asteroids. "
        "The game becomes harder over time."
    )

    print("\n===== AI GENERATED GAME SPEC =====")
    print(spec.model_dump_json(indent=2))

    config = generate_game_config(spec)

    print("\n===== GENERATED PHASER CONFIG =====")
    print(config)


asyncio.run(main())