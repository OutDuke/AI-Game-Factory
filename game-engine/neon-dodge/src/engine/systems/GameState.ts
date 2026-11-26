export const GameState = {
    READY: 'READY',
    PLAYING: 'PLAYING',
    PAUSED: 'PAUSED',
    GAME_OVER: 'GAME_OVER'
} as const;

export type GameState =
    typeof GameState[keyof typeof GameState];