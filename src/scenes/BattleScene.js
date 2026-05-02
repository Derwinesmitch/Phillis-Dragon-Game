import Phaser from 'phaser';

export default class BattleScene extends Phaser.Scene {
    constructor() {
        super('BattleScene');
    }

    init(data) {
        // Data passed from selection
        this.opponentKey = data.opponentKey || 'dragon_fire';
        this.opponentName = data.opponentName || 'Fire Dragon';
        this.playerTeam = data.playerTeam || [{ name: 'Player Dragon', key: 'dragon_ice' }];
        this.currentDragonIndex = 0;
    }

    create() {
        // 1. Add Arena Background
        const arena = this.add.image(400, 300, 'battle_arena');
        const scale = Math.max(800 / arena.width, 600 / arena.height);
        arena.setScale(scale);

        // 2. Battle State
        this.maxHP = 100;
        this.playerHP = 100;
        this.opponentHP = 100;

        // 3. Add Dragons
        const currentDragon = this.playerTeam[this.currentDragonIndex];
        this.playerDragon = this.add.sprite(200, 400, currentDragon.key);
        this.playerDragon.setScale(0.25);
        this.playerDragon.setFlipX(true);
        this.playerDragon.setInteractive({ useHandCursor: true });

        this.opponentDragon = this.add.sprite(600, 400, this.opponentKey);
        this.opponentDragon.setScale(0.25);
        this.opponentDragon.setInteractive({ useHandCursor: true });

        // Idle Animations
        this.tweens.add({
            targets: [this.playerDragon, this.opponentDragon],
            y: '-=10',
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // 4. Health Bars
        this.createHealthBars();

        // 5. Interaction (Player Clicks Dragon to Attack)
        this.canPlayerAttack = true;
        this.playerDragon.on('pointerdown', () => {
            if (this.canPlayerAttack && this.opponentHP > 0) {
                this.executeAttack(this.playerDragon, this.opponentDragon, false);
                this.canPlayerAttack = false;
                this.time.delayedCall(1000, () => { this.canPlayerAttack = true; });
            }
        });

        // 6. Opponent Automatic Attack Timer
        this.scheduleOpponentAttack();

        // 7. UI Elements
        this.add.text(400, 50, 'BATTLE ARENA', {
            fontSize: '48px',
            fontFamily: '"Courier New", Courier, monospace',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6,
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.vsText = this.add.text(400, 150, 'VS', {
            fontSize: '64px',
            fontFamily: '"Courier New", Courier, monospace',
            fill: '#ff0000',
            stroke: '#000000',
            strokeThickness: 8,
            fontStyle: 'italic'
        }).setOrigin(0.5);

        this.add.text(200, 320, 'YOUR DRAGON', {
            fontSize: '20px',
            fill: '#00ff00',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        this.add.text(600, 320, this.opponentName, {
            fontSize: '20px',
            fill: '#ff3333',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Help Text
        this.helpText = this.add.text(400, 520, 'Click YOUR DRAGON to Attack!', {
            fontSize: '18px',
            fill: '#ffff00',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Back Button
        const backBtn = this.add.text(50, 550, '< Return to Island', {
            fontSize: '20px',
            fontFamily: '"Courier New", Courier, monospace',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true });

        backBtn.on('pointerdown', () => {
            this.scene.stop('BattleScene');
            this.scene.resume('MainScene');
            this.scene.resume('UIScene');
        });
    }

    scheduleOpponentAttack() {
        const delay = Phaser.Math.Between(2000, 5000);
        this.time.delayedCall(delay, () => {
            if (this.opponentHP > 0 && this.playerHP > 0) {
                this.executeAttack(this.opponentDragon, this.playerDragon, true);
                this.scheduleOpponentAttack();
            }
        });
    }

    executeAttack(attacker, target, isTargetPlayer) {
        // 1. Fireball Projectile
        const fireball = this.add.image(attacker.x, attacker.y, 'fireball');
        fireball.setScale(0.1);
        if (isTargetPlayer) fireball.setFlipX(true);

        this.tweens.add({
            targets: fireball,
            x: target.x,
            y: target.y,
            duration: 500,
            ease: 'Cubic.easeIn',
            onComplete: () => {
                fireball.destroy();
                this.handleDamage(isTargetPlayer);
            }
        });

        // 2. Attacker "Lunge" Animation
        this.tweens.add({
            targets: attacker,
            x: isTargetPlayer ? '-=30' : '+=30',
            duration: 100,
            yoyo: true,
            ease: 'Power2'
        });
    }

    createHealthBars() {
        // Player Bar (Left)
        this.playerBarBg = this.add.rectangle(200, 280, 200, 20, 0x333333);
        this.playerBar = this.add.rectangle(100, 280, 200, 20, 0x00ff00).setOrigin(0, 0.5);
        this.playerHPText = this.add.text(200, 255, '100 / 100', { fontSize: '16px', fill: '#ffffff' }).setOrigin(0.5);

        // Opponent Bar (Right)
        this.opponentBarBg = this.add.rectangle(600, 280, 200, 20, 0x333333);
        this.opponentBar = this.add.rectangle(500, 280, 200, 20, 0x00ff00).setOrigin(0, 0.5);
        this.opponentHPText = this.add.text(600, 255, '100 / 100', { fontSize: '16px', fill: '#ffffff' }).setOrigin(0.5);
    }

    handleDamage(isTargetPlayer) {
        const damage = 10;
        let targetDragon, targetBar, targetHPText, currentHP;

        if (isTargetPlayer) {
            this.playerHP = Math.max(0, this.playerHP - damage);
            targetDragon = this.playerDragon;
            targetBar = this.playerBar;
            targetHPText = this.playerHPText;
            currentHP = this.playerHP;
        } else {
            this.opponentHP = Math.max(0, this.opponentHP - damage);
            targetDragon = this.opponentDragon;
            targetBar = this.opponentBar;
            targetHPText = this.opponentHPText;
            currentHP = this.opponentHP;
        }

        // Damage Feedback (Shake)
        this.tweens.add({
            targets: targetDragon,
            x: isTargetPlayer ? '+=5' : '-=5',
            duration: 50,
            yoyo: true,
            repeat: 3
        });

        // Floating Damage Text
        const dmgText = this.add.text(targetDragon.x, targetDragon.y - 50, `-${damage}`, {
            fontSize: '24px',
            fill: '#ff0000',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: dmgText,
            y: '-=50',
            alpha: 0,
            duration: 1000,
            onComplete: () => dmgText.destroy()
        });

        // Update Bar
        const percentage = currentHP / this.maxHP;
        targetBar.width = 200 * percentage;
        targetHPText.setText(`${currentHP} / ${this.maxHP}`);

        // Update Color
        if (percentage < 0.25) targetBar.setFillStyle(0xff0000);
        else if (percentage < 0.5) targetBar.setFillStyle(0xffff00);

        // Check for victory/defeat
        if (currentHP <= 0) {
            if (isTargetPlayer) {
                this.currentDragonIndex++;
                if (this.currentDragonIndex < this.playerTeam.length) {
                    this.switchPlayerDragon();
                } else {
                    this.handleBattleEnd(true);
                }
            } else {
                this.handleBattleEnd(false);
            }
        }
    }

    switchPlayerDragon() {
        const nextDragon = this.playerTeam[this.currentDragonIndex];
        
        // 1. Hide current dragon with animation
        this.tweens.add({
            targets: this.playerDragon,
            alpha: 0,
            x: '-=50',
            duration: 500,
            onComplete: () => {
                // 2. Change texture and reset position
                this.playerDragon.setTexture(nextDragon.key);
                this.playerDragon.x = 200;
                
                // 3. Show new dragon
                this.tweens.add({
                    targets: this.playerDragon,
                    alpha: 1,
                    duration: 500
                });

                // 4. Reset HP
                this.playerHP = this.maxHP;
                this.playerBar.width = 200;
                this.playerBar.setFillStyle(0x00ff00);
                this.playerHPText.setText(`${this.maxHP} / ${this.maxHP}`);
            }
        });

        // 5. Feedback Text
        const switchText = this.add.text(400, 300, `GO ${nextDragon.name.toUpperCase()}!`, {
            fontSize: '48px',
            fill: '#00ff00',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);

        this.time.delayedCall(1500, () => switchText.destroy());
    }

    handleBattleEnd(isPlayerDefeated) {
        const resultText = isPlayerDefeated ? 'DEFEAT' : 'VICTORY!';
        const color = isPlayerDefeated ? '#ff0000' : '#ffff00';

        if (!isPlayerDefeated) {
            const mainScene = this.scene.get('MainScene');
            mainScene.coins += 10;
            mainScene.events.emit('updateCoinCount', mainScene.coins);
        }

        this.add.text(400, 300, resultText, {
            fontSize: '120px',
            fill: color,
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 10
        }).setOrigin(0.5);

        this.time.delayedCall(2000, () => {
            this.scene.stop('BattleScene');
            this.scene.resume('MainScene');
            this.scene.resume('UIScene');
        });
    }
}
