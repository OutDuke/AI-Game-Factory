
import Phaser from 'phaser';

export class Obstacle {
    private sprite: Phaser.GameObjects.Rectangle;
    private speed: number;

    constructor(
        scene: Phaser.Scene,
        x: number,
        speed: number,
        width: number = 40,
        height: number = 40,
        color: number = 0xff3366
    ) {
        this.speed = speed;

        this.sprite = scene.add.rectangle(
            x, -30, width, height, color
        );

        this.sprite.setStrokeStyle(2, 0xffffff);
        this.sprite.setBlendMode(Phaser.BlendModes.ADD);
    }

    update(delta: number): void {
        this.sprite.y += this.speed * (delta / 1000);
    }

    getBounds(): Phaser.Geom.Rectangle {
        return this.sprite.getBounds();
    }

    isOffScreen(height: number): boolean {
        return this.sprite.y > height + 30;
    }

    destroy(): void {
        this.sprite.destroy();
    }
}
