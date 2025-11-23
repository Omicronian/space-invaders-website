import Phaser from 'phaser';

export default class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private playerLasers!: Phaser.Physics.Arcade.Group;
  private aliens!: Phaser.Physics.Arcade.Group;
  private alienLasers!: Phaser.Physics.Arcade.Group;
  private aliensNextWave = 0;
  private score = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private lives = 3;
  private livesText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {
    this.load.image('background', 'src/assets/background.png');
    this.load.image('ship', 'src/assets/ship.png');
    this.load.image('ship2', 'src/assets/ship2.png');
    this.load.image('ship3', 'src/assets/ship3.png');
    this.load.spritesheet('invader', 'src/assets/invader.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('kaboom', 'src/assets/kaboom.png', { frameWidth: 128, frameHeight: 128 });
    this.load.image('laser', 'src/assets/laser.png');
    this.load.image('laser2', 'src/assets/laser2.png');
    this.load.image('power-up', 'src/assets/power-up.png');
    this.load.audio('audio_beam', 'src/assets/audio/beam.ogg');
    this.load.audio('audio_explosion', 'src/assets/audio/explosion.ogg');
    this.load.audio('audio_pickup', 'src/assets/audio/pickup.ogg');
  }

  create() {
    this.add.image(400, 300, 'background');

    this.scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });
    this.livesText = this.add.text(780, 16, 'lives: 3', { fontSize: '32px', fill: '#000' });

    this.player = this.physics.add.sprite(400, 580, 'ship').setScale(2);
    this.player.setCollideWorldBounds(true);

    this.aliens = this.physics.add.group({
      key: 'invader',
      repeat: 11,
      setXY: { x: 12, y: 100, stepX: 70, stepY: 70 }
    });

    this.playerLasers = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
      runChildUpdate: true
    });

    this.alienLasers = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
      runChildUpdate: true
    });

    this.physics.add.collider(this.playerLasers, this.aliens, this.hitAlien, null, this);
    this.physics.add.overlap(this.player, this.alienLasers, this.hitPlayer, null, this);

    this.time.addEvent({ delay: 2000, callback: this.createAlienLaser, callbackScope: this, loop: true });
    this.time.addEvent({ delay: 1000 * Phaser.Math.Between(1, 5), callback: this.createPowerUp, callbackScope: this, loop: true });
  }

  update() {
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-400);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(400);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-500);
    }

    if (this.aliens.isEmpty()) {
      this.aliensNextWave = 0;
    } else {
      const rightmostAlien = this.aliens.getChildren().reduce((rightmost, alien) => Math.abs(rightmost.x) < Math.abs(alien.x) ? alien : rightmost);
      if (rightmostAlien.x > 750 && this.aliensNextWave !== 1) {
        this.aliensNextWave = 1;
        this.aliens.setVelocityX(-50);
      } else if (rightmostAlien.x < 50 && this.aliensNextWave !== 1) {
        this.aliensNextWave = 1;
        this.aliens.setVelocityX(50);
      }
    }
  }

  hitAlien(playerLaser: Phaser.Physics.Arcade.Image, alien: Phaser.Physics.Arcade.Sprite) {
    playerLaser.destroy();
    alien.destroy();

    this.score += 10;
    this.scoreText.setText('Score: ' + this.score);

    this.sound.play('audio_explosion');
  }

  hitPlayer(player: Phaser.Physics.Arcade.Sprite, laser: Phaser.Physics.Arcade.Image) {
    laser.destroy();
    this.lives--;
    this.livesText.setText('Lives: ' + this.lives);

    if (this.lives <= 0) {
      this.scene.restart();
      this.lives = 3;
      this.score = 0;
    }
  }

  createAlienLaser() {
    const alien = this.aliens.getChildren()[Math.floor(Math.random() * this.aliens.getChildren().length)];
    if (alien) {
      const laser = this.alienLasers.create(alien.x, alien.y, 'laser2').setScale(2);
      laser.setVelocityY(500);
      laser.checkWorldBounds = true;
      laser.outOfBoundsKill = true;
    }
  }

  createPowerUp() {
    const powerUp = this.physics.add.image(400, 10, 'power-up').setScale(2);
    powerUp.setVelocity(100, 300);
    powerUp.setCollideWorldBounds(true);
    powerUp.setBounce(1);
    powerUp.checkWorldBounds = true;
    powerUp.outOfBoundsKill = true;

    this.physics.add.overlap(this.player, powerUp, this.pickupPowerUp, null, this);
  }

  pickupPowerUp(player: Phaser.Physics.Arcade.Sprite, powerUp: Phaser.Physics.Arcade.Image) {
    powerUp.destroy();
    this.sound.play('audio_pickup');
  }
}
