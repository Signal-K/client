var BootScene = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function BootScene ()
    {
        Phaser.Scene.call(this, { key: 'BootScene' });
    },

    preload: function ()
    {
        // Load the resources here

        // Map tiles
        this.load.image('tiles', 'assets/map/spritesheet.png');

        // map in json format
        this.load.tilemapTiledJSON('map', 'assets/map/map.json');

        // The two characters
        this.load.spritesheet('player', 'assets/RPG_assets.png', { frameWidth: 16, frameHeight: 16});
    },

    create: function ()
    {
        this.scene.start('WorldScene');
    }
});

var WorldScene = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function WorldScene ()
    {
        Phaser.Scene.call(this, { key: 'WorldScene' });
    },
    preload: function ()
    {
        // Load the resources here for world scene
    },
    create: function ()
    {
        // create your world here
        var map = this.make.tilemap({ key: 'map' }); // Create world scene with map loaded in preload function of BootScene

        // Load layers of the map
        var tiles = map.addTilesetImage('spritesheet', 'tiles'); // Creates tileset image
        var grass = map.createStaticLayer('Grass', tiles, 0, 0); // Adds grass layer to the map
            var obstacles = map.createStaticLayer('Obstacles', tiles, 0, 0); // Adds obstacle layer to the map
            obstacles.setCollisionByExclusion([-1]); 

        // Add player/character sprite
        this.player = this.physics.add.sprite(50, 100, 'player', 6); // Parameters (in order): x,y coord, image resource, frame (of image resource/character/object)

        // Using Phaser.io 3 Arcade Physics to move around on the world map
        this.physics.world.bounds.width = map.widthInPixels;
        this.physics.world.bounds.height = map.heightInPixels;
        this.player.setCollideWorldBounds(true);

        this.cursors = this.input.keyboard.createCursorKeys();
    },
    update: function (time, delta)
    { // Set body velocity of the sprite/character object according to the direction we want to move the character
        this.player.body.setVelocity(0);

            // Horizontal movement
            if (this.cursors.left.isDown)
            {
                this.player.body.setVelocityX(-80);
            }
            else if (this.cursors.right.isDown)
            {
                this.player.body.setVelocityX(80);
            }

            // Vertical movement
            if (this.cursors.up.isDown)
            {
                this.player.body.setVelocityY(-80);
            }
            else if (this.cursors.down.isDown)
            {
                this.player.body.setVelocityY(80);
            }
    }
});

var config = {
    type: Phaser.AUTO,
    parent: 'content',
    width: 320,
    heigh: 240,
    zoom: 2,
    pixelArt: true, // prevents blue of the textures when scaled
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }
        }
    },
    scene: [
        BootScene,
        WorldScene
    ]
};
var game = new Phaser.Game(config);