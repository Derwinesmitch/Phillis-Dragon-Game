import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Load Pixel Art Assets
        // Note: ensure these filenames match what we copied to public/assets/
        this.load.image('grass', 'assets/grass_pixel.png');
        this.load.image('dragon', 'assets/dragon_pixel.png');
        this.load.image('tree', 'assets/tree_pixel.png');
        this.load.image('coin', 'assets/coin_pixel.png');
    }

    create() {
        this.scene.start('MainScene');
    }
}
