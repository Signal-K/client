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

        // Map tiles
        this.load.image('tiles', 'assets/map/spritesheet.png');
    },
    create: function ()
    {
        // create your world here
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