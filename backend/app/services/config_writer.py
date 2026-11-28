import json
from pathlib import Path


def save_game_config(config: dict, output_path: str):

    path = Path(output_path)

    path.parent.mkdir(parents=True, exist_ok=True)

    with path.open("w", encoding="utf-8") as file:
        json.dump(config, file, indent=4)

    return path