from pydantic import BaseModel, Field
from pydantic import BaseModel
from typing import List


class PlayerSpec(BaseModel):
    name: str
    movement: str
    speed: int = Field(gt=0)
    controls: List[str]


class ObstacleSpec(BaseModel):
    name: str

    speed: int = Field(gt=0)

    spawn_interval: int = Field(
        ge=300,
        le=5000
    )

    width: int = Field(
        default=40,
        ge=10,
        le=150
    )

    height: int = Field(
        default=40,
        ge=10,
        le=150
    )

    color: int = Field(
        default=16724838,
        ge=0,
        le=16777215
    )

    speed_multiplier: float = Field(
        default=1.0,
        gt=0,
        le=3.0
    )


class GameSpec(BaseModel):
    title: str
    genre: str
    player: PlayerSpec
    obstacles: List[ObstacleSpec]
    starting_lives: int = Field(ge=1, le=5)
    score_per_obstacle: int = Field(gt=0)
    scoring_rule: str
    difficulty: str
