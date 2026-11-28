from app.models.game_spec import (
    GameSpec,
    PlayerSpec,
    ObstacleSpec
)

from app.services.config_generator import generate_game_config


# Create a sample AI-generated specification
spec = GameSpec(
    title="Void Drifter",
    genre="Arcade",

    player=PlayerSpec(
        name="Spaceship",
        movement="horizontal",
        speed=250,
        controls=["Arrow Left", "Arrow Right"]
    ),
    obstacles=[
        ObstacleSpec(
            name="Small Asteroid",
            speed=150,
            spawn_interval=600,
            width=25,
            height=25,
            color=65535,
            speed_multiplier=1.3
        ),
        ObstacleSpec(
            name="Medium Asteroid",
            speed=180,
            spawn_interval=800,
            width=40,
            height=40,
            color=16724838,
            speed_multiplier=1.0
        ),
        ObstacleSpec(
            name="Large Asteroid",
            speed=200,
            spawn_interval=1000,
            width=65,
            height=65,
            color=16755200,
            speed_multiplier=0.8
        )
    ],

    starting_lives=3,
    scoring_rule="Gain points for every asteroid avoided",
    score_per_obstacle=10,
    difficulty="Progressive"
)


# Convert GameSpec into Phaser configuration
config = generate_game_config(spec)

print("Generated Phaser Configuration:")
print(config)