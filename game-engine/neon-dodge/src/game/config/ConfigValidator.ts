
import type { GameConfig } from '../GameConfig';

export function validateGameConfig(
    config: unknown
): config is GameConfig {

    if (typeof config !== 'object' || config === null) {
        return false;
    }

    const data = config as Record<string, unknown>;

    if (
        typeof data.playerSpeed !== 'number' ||
        data.playerSpeed <= 0 ||
        typeof data.obstacleSpeed !== 'number' ||
        data.obstacleSpeed <= 0 ||
        typeof data.maxObstacleSpeed !== 'number' ||
        data.maxObstacleSpeed < data.obstacleSpeed ||
        typeof data.spawnInterval !== 'number' ||
        data.spawnInterval < 300 ||
        data.spawnInterval > 5000 ||
        typeof data.scorePerObstacle !== 'number' ||
        data.scorePerObstacle <= 0 ||
        typeof data.startingLives !== 'number' ||
        !Number.isInteger(data.startingLives) ||
        data.startingLives < 1 ||
        data.startingLives > 5
    ) {
        return false;
    }

    if (!Array.isArray(data.obstacleTypes)) {
        console.error('obstacleTypes is not an array');
        return false;
    }

    if (data.obstacleTypes.length === 0) {
        console.error('obstacleTypes is empty');
        return false;
    }

    const invalidObstacle = data.obstacleTypes.find(
        (obstacle: unknown) => {

            if (typeof obstacle !== 'object' || obstacle === null) {
                return true;
            }

            const item = obstacle as Record<string, unknown>;

            return !(
                typeof item.width === 'number' &&
                item.width > 0 &&
                typeof item.height === 'number' &&
                item.height > 0 &&
                typeof item.color === 'number' &&
                typeof item.speedMultiplier === 'number' &&
                item.speedMultiplier > 0 &&
                typeof item.speed === 'number' &&
                item.speed > 0 &&
                typeof item.spawnInterval === 'number' &&
                item.spawnInterval >= 300 &&
                item.spawnInterval <= 5000
            );
        }
    );

    if (invalidObstacle) {
        console.error('Invalid obstacle:', invalidObstacle);
        return false;
    }

    return true;
}
