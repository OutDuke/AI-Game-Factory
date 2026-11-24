
import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Obstacle } from '../entities/Obstacle';

export class GameScene extends Phaser.Scene {

    private player!: Player;

    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

    private movementKeys!: {
        A: Phaser.Input.Keyboard.Key;
        D: Phaser.Input.Keyboard.Key;
    };

    private obstacles: Obstacle[] = [];

    private spawnTimer: number = 0;

    private spawnInterval: number = 1000;

    private score: number = 0;

    private scoreText!: Phaser.GameObjects.Text;

    private isGameOver: boolean = false;

    constructor() {
        super('GameScene');
    }

    create(): void {

        // Create player
        this.player = new Player(this);

        // Keyboard controls
        this.cursors = this.input.keyboard!.createCursorKeys();

        this.movementKeys = this.input.keyboard!.addKeys(
            'A,D'
        ) as {
            A: Phaser.Input.Keyboard.Key;
            D: Phaser.Input.Keyboard.Key;
        };

        // Game title
        this.add.text(400, 40, 'NEON DODGE', {
            fontSize: '32px',
            color: '#00ffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Instructions
        this.add.text(400, 80, 'USE ARROW KEYS OR A / D', {
            fontSize: '14px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Score display
        this.scoreText = this.add.text(20, 20, 'SCORE: 0', {
            fontSize: '18px',
            color: '#ffffff'
        });
    }

    update(time: number, delta: number): void {

        if (this.isGameOver) {
            return;
        }

        // Move player
        this.player.update(
            delta,
            this.cursors,
            this.movementKeys
        );

        // Spawn obstacles
        this.spawnTimer += delta;

        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnObstacle();
            this.spawnTimer = 0;
        }

        // Update obstacles
        for (let i = this.obstacles.length - 1; i >= 0; i--) {

            const obstacle = this.obstacles[i];

            obstacle.update(delta);

            // Check collision
            const collision = Phaser.Geom.Intersects.RectangleToRectangle(
                this.player.getBounds(),
                obstacle.getBounds()
            );

            if (collision) {
                this.endGame();
                return;
            }

            // Remove obstacles that leave the screen
            if (obstacle.isOffScreen(this.scale.height)) {
                obstacle.destroy();
                this.obstacles.splice(i, 1);

                this.score += 1;

                this.scoreText.setText(
                    `SCORE: ${this.score}`
                );
            }
        }
    }

    private spawnObstacle(): void {

        const x = Phaser.Math.Between(30, 770);

        const obstacle = new Obstacle(
            this,
            x,
            220
        );

        this.obstacles.push(obstacle);
    }

    private endGame(): void {

        this.isGameOver = true;

        this.add.rectangle(
            400,
            300,
            800,
            600,
            0x000000,
            0.65
        );

        this.add.text(400, 260, 'GAME OVER', {
            fontSize: '48px',
            color: '#ff3366',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(
            400,
            330,
            `FINAL SCORE: ${this.score}`,
            {
                fontSize: '24px',
                color: '#ffffff'
            }
        ).setOrigin(0.5);
    }
}
