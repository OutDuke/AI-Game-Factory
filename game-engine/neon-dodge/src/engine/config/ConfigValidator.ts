
export function validateConfig(config: unknown): string[] {
    const errors: string[] = [];

    if (
        typeof config !== 'object' ||
        config === null ||
        Array.isArray(config)
    ) {
        return ['Configuration must be a valid object.'];
    }

    const data = config as Record<string, unknown>;

    // Validate general game settings
    if (
        typeof data.playerSpeed !== 'number' ||
        !Number.isFinite(data.playerSpeed) ||
        data.playerSpeed <= 0
    ) {
        errors.push('Player speed must be a positive number.');
    }

    if (
        typeof data.obstacleSpeed !== 'number' ||
        !Number.isFinite(data.obstacleSpeed) ||
        data.obstacleSpeed <= 0
    ) {
        errors.push('Obstacle speed must be a positive number.');
    }

    if (
        typeof data.maxObstacleSpeed !== 'number' ||
        !Number.isFinite(data.maxObstacleSpeed) ||
        data.maxObstacleSpeed <= 0 ||
        (typeof data.obstacleSpeed === 'number' &&
            data.maxObstacleSpeed < data.obstacleSpeed)
    ) {
        errors.push('Maximum obstacle speed must be at least the initial speed.');
    }

    if (
        typeof data.spawnInterval !== 'number' ||
        !Number.isFinite(data.spawnInterval) ||
        data.spawnInterval <= 0
    ) {
        errors.push('Spawn interval must be a positive number.');
    }

    if (
        typeof data.scorePerObstacle !== 'number' ||
        !Number.isFinite(data.scorePerObstacle) ||
        data.scorePerObstacle <= 0
    ) {
        errors.push('Score per obstacle must be a positive number.');
    }

    // Validate obstacle types
    if (
        !Array.isArray(data.obstacleTypes) ||
        data.obstacleTypes.length === 0
    ) {
        errors.push('At least one obstacle type is required.');
    } else {
        data.obstacleTypes.forEach((obstacle, index) => {
            if (
                typeof obstacle !== 'object' ||
                obstacle === null ||
                Array.isArray(obstacle)
            ) {
                errors.push(`Obstacle ${index + 1} must be an object.`);
                return;
            }

            const item = obstacle as Record<string, unknown>;

            if (
                typeof item.width !== 'number' ||
                !Number.isFinite(item.width) ||
                item.width <= 0
            ) {
                errors.push(`Obstacle ${index + 1}: width must be positive.`);
            }

            if (
                typeof item.height !== 'number' ||
                !Number.isFinite(item.height) ||
                item.height <= 0
            ) {
                errors.push(`Obstacle ${index + 1}: height must be positive.`);
            }

            if (
                typeof item.color !== 'number' ||
                !Number.isInteger(item.color) ||
                item.color < 0 ||
                item.color > 0xffffff
            ) {
                errors.push(`Obstacle ${index + 1}: invalid colour.`);
            }

            if (
                typeof item.speedMultiplier !== 'number' ||
                !Number.isFinite(item.speedMultiplier) ||
                item.speedMultiplier <= 0
            ) {
                errors.push(`Obstacle ${index + 1}: speed multiplier must be positive.`);
            }
        });
    }

    return errors;
}
