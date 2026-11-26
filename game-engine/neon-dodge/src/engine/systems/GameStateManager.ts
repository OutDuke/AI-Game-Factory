
import { GameState } from './GameState';

export class GameStateManager {
    private currentState: GameState = GameState.READY;

    getState(): GameState {
        return this.currentState;
    }

    transitionTo(nextState: GameState): boolean {
    const validTransitions: Record<GameState, GameState[]> = {
        [GameState.READY]: [GameState.PLAYING],
        [GameState.PLAYING]: [
            GameState.PAUSED,
            GameState.GAME_OVER
        ],
        [GameState.PAUSED]: [
            GameState.PLAYING,
            GameState.GAME_OVER
        ],
        [GameState.GAME_OVER]: [GameState.READY]
    };

        if (!validTransitions[this.currentState].includes(nextState)) {
            console.warn(
                `Invalid game state transition: ${this.currentState} -> ${nextState}`
            );
            return false;
        }

        this.currentState = nextState;
        return true;
    }

    reset(): void {
        this.currentState = GameState.READY;
    }
}
