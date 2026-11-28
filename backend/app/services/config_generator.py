from app.models.game_spec import GameSpec


def generate_game_config(spec: GameSpec) -> dict:

    first_obstacle = spec.obstacles[0]

    config = {
        "gameTitle": spec.title,
        
        "genre": spec.genre,

        "startingLives": spec.starting_lives,

        "playerSpeed": spec.player.speed,

        "obstacleSpeed": first_obstacle.speed,

        "maxObstacleSpeed": max(
            first_obstacle.speed * 3,
            first_obstacle.speed
        ),

        "spawnInterval": first_obstacle.spawn_interval,

        "scorePerObstacle": spec.score_per_obstacle,

        "obstacleTypes": [
            {
                "width": obstacle.width,
                "height": obstacle.height,
                "color": obstacle.color,
                "speedMultiplier": obstacle.speed_multiplier,
                "speed": obstacle.speed,
                "spawnInterval": obstacle.spawn_interval
            }
            for obstacle in spec.obstacles
        ]
    }

    return config