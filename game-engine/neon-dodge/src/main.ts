
import Phaser from 'phaser';
import './style.css';
import { BootScene } from './game/scenes/BootScene';
import { GameScene } from './game/scenes/GameScene';

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: 'app',
    width: 800,
    height: 600,
    backgroundColor: '#080b18',

    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },

    scene: [BootScene, GameScene]
};

new Phaser.Game(config);
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
