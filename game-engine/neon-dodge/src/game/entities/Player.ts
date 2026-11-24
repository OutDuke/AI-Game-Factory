
import Phaser from 'phaser';

export class Player {
    private scene: Phaser.Scene;
    private sprite: Phaser.GameObjects.Triangle;
    private speed: number = 350;

    // Triangle extends 18px horizontally from its center.
    // Add room for the 3px outline and a safety margin.
    private readonly horizontalLimit = 26;

    constructor(scene: Phaser.Scene) {
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
    }

    update(
        delta: number,
        cursors: Phaser.Types.Input.Keyboard.CursorKeys,
        keys: {
            A: Phaser.Input.Keyboard.Key;
            D: Phaser.Input.Keyboard.Key;
        }
    ): void {

        const movement = this.speed * (delta / 1000);

        if (cursors.left.isDown || keys.A.isDown) {
            this.sprite.x -= movement;
        }

        if (cursors.right.isDown || keys.D.isDown) {
            this.sprite.x += movement;
        }

        // Keep the entire spaceship inside the game canvas.
        this.sprite.x = Phaser.Math.Clamp(
            this.sprite.x,
            this.horizontalLimit,
            this.scene.scale.width - this.horizontalLimit
        );
    }
    getBounds(): Phaser.Geom.Rectangle {
        return this.sprite.getBounds();
    }
    
}
