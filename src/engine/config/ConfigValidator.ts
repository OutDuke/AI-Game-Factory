

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

    if (
        typeof data.startingLives !== 'number' ||
        !Number.isInteger(data.startingLives) ||
        data.startingLives < 1 ||
        data.startingLives > 5
    ) {
        errors.push('Starting lives must be an integer between 1 and 5.');
    }

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
        typeof data.obstacleSpeed === 'number' &&
        data.maxObstacleSpeed < data.obstacleSpeed
    ) {
        errors.push('Maximum obstacle speed must be at least the initial speed.');
    }

    if (
        typeof data.spawnInterval !== 'number' ||
        !Number.isFinite(data.spawnInterval) ||
        data.spawnInterval < 300 ||
        data.spawnInterval > 5000
    ) {
        errors.push('Spawn interval must be between 300 and 5000 milliseconds.');
    }

    if (
        typeof data.scorePerObstacle !== 'number' ||
        !Number.isFinite(data.scorePerObstacle) ||
        data.scorePerObstacle <= 0
    ) {
        errors.push('Score per obstacle must be a positive number.');
    }

    if (!Array.isArray(data.obstacleTypes) || data.obstacleTypes.length === 0) {
        errors.push('At least one obstacle type is required.');
        return errors;
    }

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

        if (typeof item.width !== 'number' || !Number.isFinite(item.width) || item.width <= 0) {
            errors.push(`Obstacle ${index + 1}: width must be positive.`);
        }

        if (typeof item.height !== 'number' || !Number.isFinite(item.height) || item.height <= 0) {
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

        if (
            typeof item.speed !== 'number' ||
            !Number.isFinite(item.speed) ||
            item.speed <= 0
        ) {
            errors.push(`Obstacle ${index + 1}: speed must be positive.`);
        }

        if (
            typeof item.spawnInterval !== 'number' ||
            !Number.isFinite(item.spawnInterval) ||
            item.spawnInterval < 300 ||
            item.spawnInterval > 5000
        ) {
            errors.push(`Obstacle ${index + 1}: spawn interval must be between 300 and 5000 milliseconds.`);
        }
    });

    return errors;
}
