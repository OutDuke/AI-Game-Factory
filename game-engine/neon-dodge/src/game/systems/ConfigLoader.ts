
import gameConfig from '../game-config.json';
import type { GameConfig } from '../GameConfig';
import { validateConfig } from '../../engine/config/ConfigValidator';

interface ConfigLoadResult {
    config: GameConfig | null;
    errors: string[];
}

export function loadGameConfig(
    input: unknown = gameConfig
): ConfigLoadResult {
    const errors = validateConfig(input);

    if (errors.length > 0) {
        return {
            config: null,
            errors
        };
    }

    return {
        config: input as GameConfig,
        errors: []
    };
}
