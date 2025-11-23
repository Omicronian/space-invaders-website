class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {
    this.load.image('sky', 'https://labs.phaser.io/assets/skies/space3.png');
    this.load.image('logo', 'https://labs.phaser.io/assets/sprites/phaser3-logo.png');
    this.load.image('ship', 'https://labs.phaser.io/assets/sprites/space-baddie.png');
    this.load.image('laser', 'https://labs.phaser.io/assets/particles/blue.png');
    this.load.spritesheet('invader', 'https://labs.phaser.io/assets/sprites/space-invaders.png', { frameWidth: 48, frameHeight: 32 });
    this.load.spritesheet('kaboom', 'https://labs.phaser.io/assets/particles/explosion.png', { frameWidth: 128, frameHeight: 128 });
  }

  create() {
    this.add.image(400, 300, 'sky');
    this.add.image(400, 100, 'logo').setScale(0.5);

    const group = this.add.group({ key: 'ship', repeat: 5, setXY: { x: 100, y: 250, stepX: 100 } });
    this.physics.add.collider(group, group);

    this.anims.create({
      key: 'kaboom',
      frames: this.anims.generateFrameNumbers('kaboom'),
      frameRate: 30,
      repeat: 0,
      hideOnComplete: true
    });

    this.input.keyboard.on('keydown-SPACE', () => {
      const laser = this.add.image(400, 500, 'laser').setScale(0.5);
      this.physics.add.existing(laser);
      laser.body.setVelocityY(-500);
    });
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  physics: { default: 'arcade', arcade: { gravity: { y: 0 } } },
  scene: GameScene
};

new Phaser.Game(config);
