const { Phaser } = require("./phaser");

class Entity extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, key, type) {
        super(scene, x, y, key); // Takes params when an Entity is instantiated and providing scene, x, y, key to the Phaser.GameObjects.Sprite base classes

        // Assign the scene of the Entity
        this.scene = scene;
        this.scene.add.existing(this); //#/ Add an instantiated entity to the rendering queue of the scene
        this.scene.physicsworld.enableBody(this, 0); // Set instantiated entities as physics objects in the physics world of the scene
        this.setData("type", type);
        this.setData("isDead", false);
    }
}

class Player extends Entity {
    constructor(scene, x, y, key) {
        super(scene, x, y, key, "Player");
        this.setData("speed", 200); // Determine the speed the player should move at
        this.play("sprPlayer");
    }

    // Player movement functions
    moveUp() {
        this.body.velocity.y = -this.getData("speed"); // Move upwards on the grid when the moveUp function is called
    }
    moveDown() {
        this.body.velocity.y = this.getData("speed"); // Get the data of the speed param set for the player
    }
    moveLeft() {
        this.body.velocity.x = -this.getData("speed");
    }
    moveRight() {
        this.body.velocity.x = this.getData("speed");
    }

    // Update function
    update() {
        this.body.setVelocity(0, 0); // Every frame the player's velocity/speed is set to 0 UNLESS a move__() function is called
        
        // Make the player unable to move off-screen
        this.x = Phaser.Math.Clamp(this.x, 0, this.scene.game.config.width);
        this.y = Phaser.Math.Clamp(this.y, 0, this.scene.game.config.height);
    }
}