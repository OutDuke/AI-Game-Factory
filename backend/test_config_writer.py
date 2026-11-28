from app.services.config_generator import generate_game_config
from app.services.config_writer import save_game_config

from test_config_generator import spec


config = generate_game_config(spec)

output = save_game_config(
    config,
    "../generated-games/void-drifter/game-config.json"
)

print(f"Configuration saved to: {output.resolve()}")