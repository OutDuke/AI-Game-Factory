
import { loadGameConfig } from './game/config/ConfigLoader';
import Phaser from 'phaser';
import './style.css';
import { BootScene } from './game/scenes/BootScene';
import { GameScene } from './game/scenes/GameScene';

async function startGame() {

    console.log('Starting config loading...');

    // Get the requested game ID from the URL
    const params = new URLSearchParams(window.location.search);

    const requestedGameId = params.get('game') || 'void-drifter';

    // Only allow safe game IDs
    const gameId = /^[a-z0-9-]+$/.test(requestedGameId)
        ? requestedGameId
        : 'void-drifter';

    // Load the selected game's configuration
    let generatedConfig;

    try {
        generatedConfig = await loadGameConfig(
            `${import.meta.env.BASE_URL}generated-configs/${gameId}.json`
        );
    } catch (error) {
        console.error('Game not found:', gameId);
        document.body.innerHTML = `
            <div style="color: white; text-align: center; margin-top: 100px;">
                <h1>Game Not Found</h1>
                <p>No generated game exists with ID: ${gameId}</p>
            </div>
        `;
        return;
    }

    console.log('Selected game:', gameId);

    console.log('Generated game config loaded successfully!');
    console.log(generatedConfig);

    const gameConfig: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        parent: 'app',
        width: 800,
        height: 600,
        backgroundColor: '#080b18',

        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH
        },

        scene: [BootScene, GameScene],

        callbacks: {
            preBoot: (game) => {
                game.registry.set(
                    'generatedGameConfig',
                    generatedConfig
                );
            }
        }
    };

    new Phaser.Game(gameConfig);
}

startGame().catch((error) => {
    console.error('Failed to start game:', error);
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register(`${import.meta.env.BASE_URL}sw.js`)
            .then((registration) => {
                console.log(
                    'Offline support registered:',
                    registration.scope
                );
            })
            .catch((error) => {
                console.error(
                    'Service worker registration failed:',
                    error
                );
            });
    });
}
