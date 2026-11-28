import asyncio

from app.services.ollama_service import generate_response


async def main():
    result = await generate_response(
        "Suggest three creative names for a 2D arcade spaceship game."
    )

    print(result)


asyncio.run(main())