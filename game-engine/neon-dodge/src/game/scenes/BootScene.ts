
import Phaser from 'phaser';
import easyConfig from '../profiles/neon-dodge-easy.json';
import hardConfig from '../profiles/neon-dodge-hard.json';

export class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    create(): void {
        this.add.text(400, 150, 'NEON DODGE', {
            fontSize: '42px',
            color: '#00ffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(400, 210, 'SELECT DIFFICULTY', {
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.createDifficultyButton(300, 'EASY', easyConfig);
        this.createDifficultyButton(390, 'HARD', hardConfig);
    }

    private createDifficultyButton(
        y: number,
        label: string,
        config: unknown
    ): void {
        const button = this.add.rectangle(
            400, y, 220, 60, 0x101b35
        );

        button.setStrokeStyle(2, 0x00ffff);
        button.setInteractive({ useHandCursor: true });

        this.add.text(400, y, label, {
            fontSize: '24px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        button.on('pointerover', () => {
            button.setFillStyle(0x164050);
        });

        button.on('pointerout', () => {
            button.setFillStyle(0x101b35);
        });

        button.on('pointerdown', () => {
            this.scene.start('GameScene', {
                config: config
            });
        });
    }

    preload(): void {
        this.load.audio('hit', 'audio/hit.ogg');
        this.load.audio('game-over', 'audio/game-over.ogg');
    }
}
