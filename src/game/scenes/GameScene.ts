import type { GameConfig, ObstacleConfig } from '../GameConfig';
import { loadGameConfig } from '../systems/ConfigLoader';
import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Obstacle } from '../../engine/entities/Obstacle';
import { CollisionSystem } from '../../engine/systems/CollisionSystem';
import { GameState } from '../../engine/systems/GameState';
import { GameStateManager } from '../../engine/systems/GameStateManager';
import type { ScoreEntry } from '../ScoreEntry';

export class GameScene extends Phaser.Scene {

    private stateManager = new GameStateManager();
    private pauseOverlay!: Phaser.GameObjects.Container;

    private config!: GameConfig;
    private incomingConfig: unknown;
    private startScreen!: Phaser.GameObjects.Container;

    private obstacleSpeed: number = 220;
    private maxObstacleSpeed: number = 700;

    private player!: Player;

    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

    private movementKeys!: {
        A: Phaser.Input.Keyboard.Key;
        D: Phaser.Input.Keyboard.Key;
    };

    private obstacles: Obstacle[] = [];

    private obstacleSpawnTimers = new Map<ObstacleConfig, number>();


    private score: number = 0;
    private highScore: number = 0;

    private lives: number = 3;
    private livesText!: Phaser.GameObjects.Text;
    private isInvulnerable: boolean = false;

    private isMuted: boolean = false;

    private scoreText!: Phaser.GameObjects.Text;
    private highScoreText!: Phaser.GameObjects.Text;

    private playerInitials: string = '';
    private initialsText!: Phaser.GameObjects.Text;
    private initialsKeyHandler?: (event: KeyboardEvent) => void;
    private leaderboardTexts: Phaser.GameObjects.Text[] = [];
    private isEnteringInitials: boolean = false;

    private readonly HIGH_SCORE_KEY = 'neon_dodge_high_score';
    private readonly LEADERBOARD_KEY = 'neon_dodge_leaderboard';

    private leaderboard: ScoreEntry[] = [];

    constructor() {
        super('GameScene');
    }

    create(): void {
        const result = loadGameConfig(this.incomingConfig);

        if (!result.config) {
            console.error('Invalid game configuration:', result.errors);

            this.add.text(
                this.scale.width / 2,
                this.scale.height / 2 - 40,
                'CONFIGURATION ERROR',
                {
                    fontSize: '28px',
                    color: '#ff3366',
                    fontStyle: 'bold'
                }
            ).setOrigin(0.5);

            this.add.text(
                this.scale.width / 2,
                this.scale.height / 2 + 15,
                result.errors.join('\n'),
                {
                    fontSize: '16px',
                    color: '#ffffff',
                    align: 'center',
                    wordWrap: { width: 650 }
                }
            ).setOrigin(0.5);

            return;
        }

        this.config = result.config;

// Reset game state whenever the scene starts or restarts
        this.stateManager.reset();
        this.score = 0;
        this.lives = this.config.startingLives;
        this.isInvulnerable = false;
        this.obstacleSpawnTimers = new Map(
            this.config.obstacleTypes.map(type => [type, 0])
        );
        this.obstacleSpeed = this.config.obstacleSpeed;
        this.maxObstacleSpeed = this.config.maxObstacleSpeed;
        this.obstacles = [];
        this.createImpactTexture();

        // Load saved high score
        this.highScore = Number(
            localStorage.getItem(this.HIGH_SCORE_KEY) || 0
        );
        this.loadLeaderboard();

        // Create player
        this.player = new Player(this, this.config.playerSpeed);

        // Keyboard controls
        this.cursors = this.input.keyboard!.createCursorKeys();

        this.movementKeys = this.input.keyboard!.addKeys(
            'A,D'
        ) as {
            A: Phaser.Input.Keyboard.Key;
            D: Phaser.Input.Keyboard.Key;
        };

        // Sound toggle
        this.input.keyboard?.on('keydown-V', () => {
            this.isMuted = !this.isMuted;
            this.sound.setMute(this.isMuted);
        });

        // Game title
        this.add.text(400, 40, this.config.gameTitle || 'NEON DODGE', {
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
        // Current score
        this.scoreText = this.add.text(20, 20, 'SCORE: 0', {
            fontSize: '18px',
            color: '#ffffff'
        });

        // Lives display
        this.livesText = this.add.text(20, 76, `LIVES: ${this.lives}`, {
            fontSize: '18px',
            color: '#ff3366',
            fontStyle: 'bold'
        });

        // High score
        this.highScoreText = this.add.text(20, 48, '', {
            fontSize: '16px',
            color: '#00ffff'
        });

        this.highScoreText.setText(
            `BEST: ${this.highScore}`
        );
        this.startScreen = this.add.container(0, 0);

        const overlay = this.add.rectangle(
            400, 300, 800, 600, 0x050713, 0.95
        );

        const title = this.add.text(400, 220, 'NEON DODGE', {
            fontSize: '48px',
            color: '#00ffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const instruction = this.add.text(
            400, 300,
            'Dodge the obstacles and survive!',
            { fontSize: '20px', color: '#ffffff' }
        ).setOrigin(0.5);

        const startButton = this.add.text(
            400, 390, '[ START GAME ]',
            { fontSize: '28px', color: '#00ffff' }
        ).setOrigin(0.5).setInteractive({ useHandCursor: true });

        startButton.on('pointerdown', () => {
            this.startGame();
        });

        this.startScreen.add([
            overlay,
            title,
            instruction,
            startButton
        ]);
        this.createPauseMenu();
        // Pause controls: Escape and P
        this.input.keyboard?.on('keydown-ESC', () => {
            this.togglePause();
        });

        this.input.keyboard?.on('keydown-P', () => {
            this.togglePause();
        });
    }

    update(_time: number, delta: number): void {
        if (this.stateManager.getState() !== GameState.PLAYING) {
            return;
        }

        // Move player
        this.player.update(
            delta,
            this.cursors,
            this.movementKeys
        );

        // Spawn obstacles
        // Spawn each obstacle type independently
        for (const type of this.config.obstacleTypes) {

            const elapsed =
                (this.obstacleSpawnTimers.get(type) ?? 0) + delta;

            if (elapsed >= type.spawnInterval) {
                this.spawnObstacle(type);

                this.obstacleSpawnTimers.set(
                    type,
                    elapsed - type.spawnInterval
                );
            } else {
                this.obstacleSpawnTimers.set(type, elapsed);
            }
        }

        // Update obstacles
        for (let i = this.obstacles.length - 1; i >= 0; i--) {

            const obstacle = this.obstacles[i];

            obstacle.update(delta);

            // Check collision
            const collision = CollisionSystem.checkRectangleCollision(
                this.player.getBounds(),
                obstacle.getBounds()
            );

            if (collision) {

                // Remove the obstacle on contact, even during invulnerability.
                obstacle.destroy();
                this.obstacles.splice(i, 1);

                // Don't deduct another life during invulnerability.
                if (this.isInvulnerable) {
                    continue;
                }

                const bounds = this.player.getBounds();

                this.createImpactBurst(
                    bounds.centerX,
                    bounds.centerY
                );

                this.sound.play('hit');

                this.isInvulnerable = true;

                this.time.delayedCall(1000, () => {
                    this.isInvulnerable = false;
                });

                this.lives--;
                this.livesText.setText(`LIVES: ${this.lives}`);

                if (this.lives <= 0) {
                    this.endGame();
                }

                return;
            }

            // Remove obstacles that leave the screen
            if (obstacle.isOffScreen(this.scale.height)) {
                obstacle.destroy();
                this.obstacles.splice(i, 1);

                this.score += this.config.scorePerObstacle;

                // Update current score
                this.scoreText.setText(
                    `SCORE: ${this.score}`
                );
                // Increase obstacle speed every 5 points
                if (this.score % 5 === 0) {

                    this.obstacleSpeed = Math.min(
                        this.obstacleSpeed + 25,
                        this.maxObstacleSpeed
                    );
                }

                // Check for new high score
                if (this.score > this.highScore) {

                    this.highScore = this.score;

                    // Save in browser storage
                    localStorage.setItem(
                        this.HIGH_SCORE_KEY,
                        String(this.highScore)
                    );

                    this.highScoreText.setText(
                        `BEST: ${this.highScore}`
                    );
                }
            }
        }
    }

    private spawnObstacle(type: ObstacleConfig): void {

        // Keep the obstacle inside the game boundaries
        const x = Phaser.Math.Between(
            type.width / 2 + 5,
            this.scale.width - type.width / 2 - 5
        );

        // Apply individual speed and difficulty progression
        const difficultyMultiplier =
            this.obstacleSpeed / this.config.obstacleSpeed;

        const speed =
            type.speed *
            type.speedMultiplier *
            difficultyMultiplier;

        const obstacle = new Obstacle(
            this,
            x,
            speed,
            type.width,
            type.height,
            type.color
        );

        this.obstacles.push(obstacle);
    }

    private startGame(): void {
        if (this.stateManager.getState() !== GameState.READY) {
            return;
        }

        if (!this.stateManager.transitionTo(GameState.PLAYING)) {
            return;
        }

        this.startScreen.destroy();
    }

    private createPauseMenu(): void {
        this.pauseOverlay = this.add.container(0, 0);

        const background = this.add.rectangle(
            400, 300,
            800, 600,
            0x050713,
            0.90
        );

        const title = this.add.text(
            400, 200,
            'PAUSED',
            {
                fontSize: '48px',
                color: '#00ffff',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);

        const resumeButton = this.add.text(
            400, 310,
            '[ RESUME ]',
            {
                fontSize: '26px',
                color: '#00ffff'
            }
        ).setOrigin(0.5).setInteractive({ useHandCursor: true });

        resumeButton.on('pointerdown', () => {
            this.player.lockPointerUntilReleased();
            this.togglePause();
        });

        const menuButton = this.add.text(
            400, 380,
            '[ BACK TO MENU ]',
            {
                fontSize: '26px',
                color: '#00ffff'
            }
        ).setOrigin(0.5).setInteractive({ useHandCursor: true });

        menuButton.on('pointerdown', () => {
            this.scene.start('BootScene');
        });

        this.pauseOverlay.add([
            background,
            title,
            resumeButton,
            menuButton
        ]);

        this.pauseOverlay.setDepth(2000);
        this.pauseOverlay.setVisible(false);
    }

    private togglePause(): void {

        const currentState = this.stateManager.getState();

        // Pause the game
        if (currentState === GameState.PLAYING) {

            this.stateManager.transitionTo(GameState.PAUSED);

            this.time.paused = true;

            this.pauseOverlay.setVisible(true);

            return;
        }

        // Resume the game
        if (currentState === GameState.PAUSED) {

            this.stateManager.transitionTo(GameState.PLAYING);

            this.time.paused = false;

            this.pauseOverlay.setVisible(false);
        }
    }


    private endGame(): void {

        this.cameras.main.shake(250, 0.012);

        // Red flash on collision
        const flash = this.add.rectangle(
            400,
            300,
            800,
            600,
            0xff0000,
            0.35
        );

        flash.setDepth(1000);

        this.tweens.add({
            targets: flash,
            alpha: 0,
            duration: 300,
            onComplete: () => {
                flash.destroy();
            }
        });

        this.stateManager.transitionTo(GameState.GAME_OVER);

        // Dark overlay
        this.add.rectangle(
            400,
            300,
            800,
            600,
            0x000000,
            0.75
        );

        // Game over title
        this.add.text(
            400,
            150,
            'GAME OVER',
            {
                fontSize: '48px',
                color: '#ff3366',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);

        // Final score
        this.add.text(
            400,
            210,
            `FINAL SCORE: ${this.score}`,
            {
                fontSize: '24px',
                color: '#ffffff'
            }
        ).setOrigin(0.5);

        const qualifies =
            this.score > 0 &&
            (
                this.leaderboard.length < 10 ||
                this.score > this.leaderboard[this.leaderboard.length - 1].score
            );

        if (qualifies) {
            this.add.text(
                600,
                300,
                'NEW TOP 10 SCORE!',
                {
                    fontSize: '22px',
                    color: '#00ffff',
                    fontStyle: 'bold'
                }
            ).setOrigin(0.5);

            this.add.text(
                600,
                335,
                'ENTER 3 LETTERS + PRESS ENTER',
                {
                    fontSize: '14px',
                    color: '#ffffff'
                }
            ).setOrigin(0.5);

            this.startInitialsInput();
        }

        // Restart button
    const restartButton = this.add.text(
        400,
        490,
        'RESTART',
        {
            fontSize: '22px',
            color: '#00ffff',
            fontStyle: 'bold',
            backgroundColor: '#10202a',
            padding: {
                x: 20,
                y: 12
            },
            fixedWidth: 220,
            align: 'center'
        }
    ).setOrigin(0.5);

    restartButton.setInteractive({ useHandCursor: true });

    restartButton.on('pointerover', () => {
        restartButton.setColor('#ffffff');
    });

    restartButton.on('pointerout', () => {
        restartButton.setColor('#00ffff');
    });

    restartButton.on('pointerdown', () => {
        this.scene.restart();
    });

        // Keyboard restart
        this.input.keyboard?.on('keydown-R', () => {
            if (!this.isEnteringInitials) {
                this.scene.restart();
            }
        });

        // Return to difficulty selection menu
        const menuButton = this.add.text(
            400,
            555,
            'BACK TO MENU',
            {
                fontSize: '22px',
                color: '#00ffff',
                fontStyle: 'bold',
                backgroundColor: '#10202a',
                padding: {
                    x: 20,
                    y: 12
                },
                fixedWidth: 220,
                align: 'center'
            }
        ).setOrigin(0.5);

        menuButton.setInteractive({ useHandCursor: true });

        menuButton.on('pointerover', () => {
            menuButton.setColor('#ffffff');
        });

        menuButton.on('pointerout', () => {
            menuButton.setColor('#00ffff');
        });

        menuButton.on('pointerdown', () => {
            this.scene.start('BootScene');
        });

                // Keyboard shortcut: M
        this.input.keyboard?.on('keydown-M', () => {
            if (!this.isEnteringInitials) {
                this.scene.start('BootScene');
            }
        });

        this.showLeaderboard();

    }

    private createImpactTexture(): void {
        if (this.textures.exists('impact-particle')) {
            return;
        }

        const graphics = this.make.graphics({ x: 0, y: 0 });

        graphics.fillStyle(0xffffff, 1);
        graphics.fillCircle(8, 8, 8);

        graphics.generateTexture('impact-particle', 16, 16);
        graphics.destroy();
    }

    private createImpactBurst(x: number, y: number): void {
        const particles = this.add.particles(
            x,
            y,
            'impact-particle',
            {
                speed: { min: 100, max: 300 },
                angle: { min: 0, max: 360 },
                scale: { start: 0.7, end: 0 },
                alpha: { start: 1, end: 0 },
                lifespan: 450,
                tint: [0x00ffff, 0xffffff, 0xff3366],
                blendMode: Phaser.BlendModes.ADD
            }
        );

        particles.explode(18);

        this.time.delayedCall(600, () => {
            particles.destroy();
        });
    }

    private saveLeaderboard(): void {
        this.leaderboard.sort((a, b) => b.score - a.score);

        this.leaderboard = this.leaderboard.slice(0, 10);

        localStorage.setItem(
            this.LEADERBOARD_KEY,
            JSON.stringify(this.leaderboard)
        );
    }

    private showLeaderboard(): void {
        // Remove the previous leaderboard text
        this.leaderboardTexts.forEach(text => text.destroy());
        this.leaderboardTexts = [];

        this.leaderboard.sort((a, b) => b.score - a.score);

        const title = this.add.text(
            200,
            300,
            'TOP 10',
            {
                fontSize: '22px',
                color: '#00ffff',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);

        this.leaderboardTexts.push(title);

        this.leaderboard.forEach((entry, index) => {
            const row = this.add.text(
                200,
                335 + index * 22,
                `${index + 1}. ${entry.initials}  ${entry.score}`,
                {
                    fontSize: '16px',
                    color: '#ffffff'
                }
            ).setOrigin(0.5);

            this.leaderboardTexts.push(row);
        });
    }

    private addScoreToLeaderboard(initials: string): void {
        this.leaderboard.push({
            initials: initials.toUpperCase().slice(0, 3),
            score: this.score
        });

        this.saveLeaderboard();
        this.showLeaderboard();
    }

    private handleInitialsInput(event: KeyboardEvent): void {
        if (/^[a-zA-Z]$/.test(event.key)) {
            if (this.playerInitials.length < 3) {
                this.playerInitials += event.key.toUpperCase();
            }
        } else if (event.key === 'Backspace') {
            this.playerInitials = this.playerInitials.slice(0, -1);
        }

        this.initialsText.setText(
            this.playerInitials.padEnd(3, '_')
        );
    }

    private startInitialsInput(): void {
        this.playerInitials = '';
        this.isEnteringInitials = true;

        this.initialsText = this.add.text(
            600,
            375,
            '___',
            {
                fontSize: '32px',
                color: '#00ffff',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);

        this.initialsKeyHandler = (event: KeyboardEvent) => {

            // Cancel initials entry
            if (event.key === 'Escape') {
                this.isEnteringInitials = false;

                this.input.keyboard?.off(
                    'keydown',
                    this.initialsKeyHandler!
                );

                this.initialsText.setText('CANCELLED');
                return;
            }

            // Save initials
            if (event.key === 'Enter') {
                if (this.playerInitials.length !== 3) {
                    return;
                }

                this.addScoreToLeaderboard(this.playerInitials);
                this.isEnteringInitials = false;

                this.input.keyboard?.off(
                    'keydown',
                    this.initialsKeyHandler!
                );

                this.initialsText.setText(
                    `SAVED: ${this.playerInitials}`
                );

                return;
            }

            this.handleInitialsInput(event);
        };

        this.input.keyboard?.on(
            'keydown',
            this.initialsKeyHandler
        );
    }

    private loadLeaderboard(): void {
        const saved = localStorage.getItem(this.LEADERBOARD_KEY);

        if (!saved) {
            this.leaderboard = [];
            return;
        }

        try {
            const entries = JSON.parse(saved) as ScoreEntry[];

            this.leaderboard = entries
                .filter(entry =>
                    typeof entry.initials === 'string' &&
                    Number.isFinite(entry.score)
                )
                .sort((a, b) => b.score - a.score)
                .slice(0, 10);

        } catch {
            this.leaderboard = [];
        }
    }

    init(data?: { config?: unknown }): void {
        this.incomingConfig = data?.config ?? this.incomingConfig;
    }

}
