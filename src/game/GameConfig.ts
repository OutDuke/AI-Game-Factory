import gameConfig from './game-config.json';

export interface ObstacleConfig {
    width: number;
    height: number;
    color: number;
    speedMultiplier: number;
    speed: number;
    spawnInterval: number;
}

export interface GameConfig {
    gameTitle?: string;
    startingLives: number;
    playerSpeed: number;
    obstacleSpeed: number;
    maxObstacleSpeed: number;
    spawnInterval: number;
    scorePerObstacle: number;
    obstacleTypes: ObstacleConfig[];
}

export const defaultGameConfig: GameConfig = gameConfig;
