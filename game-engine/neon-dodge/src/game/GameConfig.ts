
import gameConfig from './game-config.json';

export interface ObstacleConfig {
    width: number;
    height: number;
    color: number;
    speedMultiplier: number;
}

export interface GameConfig {
    playerSpeed: number;
    obstacleSpeed: number;
    maxObstacleSpeed: number;
    spawnInterval: number;
    scorePerObstacle: number;
    obstacleTypes: ObstacleConfig[];
}

export const defaultGameConfig: GameConfig = gameConfig;
