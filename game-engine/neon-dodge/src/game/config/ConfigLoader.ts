import type { GameConfig } from '../GameConfig';
import { validateGameConfig } from './ConfigValidator';

export async function loadGameConfig(
    configPath: string
): Promise<GameConfig> {

    const response = await fetch(configPath);

    if (!response.ok) {
        throw new Error(
            `Failed to load game config: ${response.status}`
        );
    }

    const config: unknown = await response.json();

    if (!validateGameConfig(config)) {
        throw new Error('Invalid game configuration!');
    }

    return config;
}