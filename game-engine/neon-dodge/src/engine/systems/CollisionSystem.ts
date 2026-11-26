
import Phaser from 'phaser';

export class CollisionSystem {
    static checkRectangleCollision(
        first: Phaser.Geom.Rectangle,
        second: Phaser.Geom.Rectangle
    ): boolean {
        return Phaser.Geom.Intersects.RectangleToRectangle(
            first,
            second
        );
    }
}
