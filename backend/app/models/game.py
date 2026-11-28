
from pydantic import BaseModel, Field


class GameRequest(BaseModel):
    game_name: str = Field(min_length=3, max_length=50)
    genre: str
    description: str = Field(min_length=10, max_length=500)
