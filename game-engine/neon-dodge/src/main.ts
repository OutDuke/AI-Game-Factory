
import Phaser from 'phaser';
import './style.css';
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

    scene: [GameScene]
};

new Phaser.Game(config);
