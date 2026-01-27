import Phaser from 'phaser';
import BootScene from './scenes/BootScene';
import MainScene from './scenes/MainScene';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'app',
    backgroundColor: '#5c9634', // Match the grass green
    pixelArt: true, // IMPORTANT: Keeps sprites crisp when scaled
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [BootScene, MainScene]
};

const game = new Phaser.Game(config);
