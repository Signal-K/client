const { Phaser } = require("./phaser");

class SceneMain extends Phaser.Scene {
    constructor() {
        super({ key: "SceneMain" });
    }
    preload() { // Load the game/scene's assets
        this.load.image("sprBg0", "assets/sprBg0.png")
        this.load.image("sprBg1", "assets/sprBg1.png");

        // Spritesheet -> loading the sprExplosion animation instead of a static image
        this.load.spritesheet("sprExplosion", "assets/sprExplosion.png", {
            frameWidth: 32,
            frameHeight: 32
        });

        this.load.spritesheet("sprEnemy0", "assets/sprEnemy0.png", {
            frameWidth: 16,
            frameHeight: 16
        });

        this.load.image("sprEnemy1", "assets/sprEnemy1.png");
        this.load.spritesheet("sprEnemy2", "assets/sprEnemy2.png", {
            frameWidth: 16,
            frameHeight: 16
        });

        this.load.image("sprLaserEnemy0", "assets/sprLaserEnemy0.png");
        this.load.image("sprLaserPlayer", "assets/sprLaserPlayer.png");

        this.load.spritesheet("sprPlayer", "assets/sprPlayer.png", {
            frameWidth: 16,
            frameHeight: 16
        });

        // Load the audio for the scene
        this.load.audio("sndExplode0", "assets/sndExplode0.wav");
        this.load.audio("sndExplode1", "assets/sndExplode1.wav");
        this.load.audio("sndLaser", "assets/sndLaser.wav");
    }
    create() {
        // Create our animations
        this.anims.create({
            key: "sprEnemy0",
            frames: this.anims.generateFrameNumbers("sprEnemy0"),
            frameRate: 20,
            repeat: -1
        });
        this.anims.create({
            key: "sprEnemy2",
            frames: this.anims.generateFrameNumbers("sprEnemy2"),
            frameRate: 20,
            repeat: -1
        });
        this.anims.create({
            key: "sprExplosion",
            frames: this.anims.generateFrameNumbers("sprExplosion"),
            frameRate: 20,
            repeat: 0
        });
        this.anims.create({
            key: "sprPlayer",
            frames: this.generateFrameNumbers("sprPlayer"),
            frameRate: 20,
            repeat: -1
        });

        // Sound effects
        this.sfx = {
            explosions: [ // Array for the 2 explosion sounds
                this.sound.add("sndExplode0"),
                this.sound.add('sndExplode1')
            ],
            laser: this.sound.add("sndLaser")
        };

        // Create an instance of the player
        this.player = new this.player(
            this,
            this.game.config.width * 0.5,
            this.game.config.height * 0.5,
            "sprPlayer"
        );
    }
}