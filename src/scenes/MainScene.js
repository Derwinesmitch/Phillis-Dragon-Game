import Phaser from 'phaser';

export default class MainScene extends Phaser.Scene {
    constructor() {
        super('MainScene');
    }

    create() {
        // 1. Create World
        // Tiling sprite for infinite grass. 
        // Using a large area (4000x4000) to feel "infinite"
        this.add.tileSprite(1000, 1000, 4000, 4000, 'grass');

        // Set world bounds suitable for exploration
        this.physics.world.setBounds(0, 0, 2000, 2000);

        // 2. Create Player (Pixel Art Dragon)
        // Start in middle
        this.player = this.physics.add.sprite(1000, 1000, 'dragon');
        this.player.setCollideWorldBounds(true);

        // SCALE ADJUSTMENT:
        // Pixel art assets from AI are often 1024px.
        // For 16-bit look on screen, we need to scale WAY down.
        // 1024 * 0.08 ~= 82px. Good size for a character.
        this.player.setScale(0.08);

        // 3. Camera Follow
        this.cameras.main.setBounds(0, 0, 2000, 2000);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setZoom(2.0); // Zoom in to appreciate the pixel art

        // 4. Input (Click to move)
        this.target = null;

        this.input.on('pointerdown', (pointer) => {
            this.target = new Phaser.Math.Vector2(pointer.worldX, pointer.worldY);
            this.physics.moveToObject(this.player, this.target, 150); // Slower, relaxed speed

            // Face the direction
            if (this.target.x < this.player.x) {
                this.player.setFlipX(true);
            } else {
                this.player.setFlipX(false);
            }
        });

        // Add some trees
        for (let i = 0; i < 30; i++) {
            const x = Phaser.Math.Between(200, 1800);
            const y = Phaser.Math.Between(200, 1800);
            const tree = this.add.image(x, y, 'tree');
            tree.setScale(0.15); // Scale trees to match dragon
        }
    }

    update() {
        // Stop if close to target
        if (this.target) {
            const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.target.x, this.target.y);
            if (distance < 10) {
                this.player.body.reset(this.target.x, this.target.y);
                this.target = null;
            }
        }
    }
}
