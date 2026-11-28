
import Phaser from 'phaser';

export class Player {
    private playerSpeed: number;
    private scene: Phaser.Scene;
    private sprite: Phaser.GameObjects.Triangle;

    private trail: Phaser.GameObjects.Graphics;
    private trailPoints: {
        x: number;
        y: number;
        life: number;
    }[] = [];
    private readonly trailLength = 18;

    private engineGlow!: Phaser.GameObjects.Ellipse;

    // Triangle extends 18px horizontally from its center.
    // Add room for the 3px outline and a safety margin.
    private readonly horizontalLimit = 26;
    private ignorePointerUntilReleased: boolean = false;

    constructor(scene: Phaser.Scene, playerSpeed: number) {
        this.playerSpeed = playerSpeed;
        this.scene = scene;

        this.sprite = scene.add.triangle(
            400, 520,
            18, 0,
            0, 40,
            36, 40,
            0x00ffff
        );

        this.sprite.setOrigin(0.5, 0.5);

        this.sprite.setOrigin(0.5, 0.5);
        this.sprite.setStrokeStyle(3, 0xffffff, 0.9);
        this.sprite.setBlendMode(Phaser.BlendModes.ADD);

        this.trail = scene.add.graphics();
        this.trail.setDepth(this.sprite.depth - 1);

        // Create stationary engine glow
        this.engineGlow = scene.add.ellipse(
            this.sprite.x,
            this.sprite.y + 24,
            14,
            22,
            0x00ffff,
            0.35
        );

        this.engineGlow.setBlendMode(Phaser.BlendModes.ADD);
        this.engineGlow.setDepth(this.sprite.depth - 1);
    }

    update(
        delta: number,
        cursors: Phaser.Types.Input.Keyboard.CursorKeys,
        keys: {
            A: Phaser.Input.Keyboard.Key;
            D: Phaser.Input.Keyboard.Key;
        }
    ): void {

        const movement = this.playerSpeed * (delta / 1000);

        if (cursors.left.isDown || keys.A.isDown) {
            this.sprite.x -= movement;
        }

        if (cursors.right.isDown || keys.D.isDown) {
            this.sprite.x += movement;
        }
        // Touch and mouse controls
        const pointer = this.scene.input.activePointer;

        if (!pointer.isDown) {
            this.ignorePointerUntilReleased = false;
        }

        if (pointer.isDown && !this.ignorePointerUntilReleased) {
            const smoothing = 1 - Math.exp(-delta / 150);

            this.sprite.x = Phaser.Math.Linear(
                this.sprite.x,
                pointer.worldX,
                smoothing
            );
        }

        // Keep the entire spaceship inside the game canvas.
        this.sprite.x = Phaser.Math.Clamp(
            this.sprite.x,
            this.horizontalLimit,
            this.scene.scale.width - this.horizontalLimit
        );

        this.updateTrail(delta);

        // Keep engine glow attached to the spaceship
        this.engineGlow.setPosition(
            this.sprite.x,
            this.sprite.y + 24
        );

        // Create a subtle pulsing effect
        const pulse = Math.sin(this.scene.time.now * 0.005);

        this.engineGlow.setScale(
            1 + pulse * 0.15,
            1 + pulse * 0.2
        );

        this.engineGlow.setAlpha(
            0.25 + (pulse + 1) * 0.1
        );
    }
    getBounds(): Phaser.Geom.Rectangle {
        return this.sprite.getBounds();
    }
    private updateTrail(delta: number): void {
        const lastPoint = this.trailPoints[0];

        // Add a point when the ship moves
        if (
            !lastPoint ||
            Phaser.Math.Distance.Between(
                lastPoint.x,
                lastPoint.y,
                this.sprite.x,
                this.sprite.y + 20
            ) > 2
        ) {
            this.trailPoints.unshift({
                x: this.sprite.x,
                y: this.sprite.y + 20,
                life: 1
            });
            if (this.trailPoints.length > this.trailLength) {
            this.trailPoints.pop();
        }
        }

        // Gradually reduce the lifetime of every point
        for (const point of this.trailPoints) {
            point.life -= delta / 1000 * 1.2;
        }

        // Remove expired points
        this.trailPoints = this.trailPoints.filter(
            point => point.life > 0
        );

        this.trail.clear();

        // Draw fading trail segments
        for (let i = this.trailPoints.length - 1; i > 0; i--) {
            const older = this.trailPoints[i];
            const newer = this.trailPoints[i - 1];

            const alpha = Math.min(older.life, newer.life) * 0.8;
            const thickness = Math.max(1, alpha * 5);

            this.trail.lineStyle(
                thickness,
                0x00ffff,
                alpha
            );

            this.trail.beginPath();
            this.trail.moveTo(older.x, older.y);
            this.trail.lineTo(newer.x, newer.y);
            this.trail.strokePath();
        }
    }

    lockPointerUntilReleased(): void {
        this.ignorePointerUntilReleased = true;
    }
    
}
