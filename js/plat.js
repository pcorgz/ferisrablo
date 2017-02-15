/* Compatibility
**********************************************/
(function() {
    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    window.requestAnimationFrame = requestAnimationFrame;
})();

/* DECLARATIONS
**********************************************/
/* CONSTANTS */
var PLAT_CANVAS = document.getElementById("platGame");
var PLAT_CONTEXT = PLAT_CANVAS.getContext("2d");
var TICKS_PER_FRAME = 4;
var GRAVITY = 1;
var TOP = "T";
var BOTTOM = "B";
var LEFT = "L";
var RIGHT = "R";
var TILE_FIXED_SIZE = 50;
// var TYPE_SPRITE = "sprite";
// var TYPE_TILE = "tile";
// var TYPE_BACKGROUND = "background";

/* GAME COMPONENTS */
var platPlayer;
var platBackgrounds;
var platTiles;

/* VARIABLES */
var platKeys; // keys down

/* IMAGES */
var platPlayerImage = new Image();
platPlayerImage.src = "Images/PlatGame/coin-sprite-animation-sprite-sheet.png";

var backImages = [];
var backImage_0 = new Image();
var backImage_1 = new Image();
var backImage_2 = new Image();
//var backImage_3 = new Image();
backImage_0.src = "Images/PlatGame/platBackground_0.png";
backImage_1.src = "Images/PlatGame/platBackground_1.png";
backImage_2.src = "Images/PlatGame/platBackground_2.png";
//backImage_3.src = "Images/PlatGame/platBackground_3.png";

backImages.push(backImage_0);
backImages.push(backImage_1);
backImages.push(backImage_2);
//backImages.push(backImage_3);

var platTileImage_bricks = new Image();
var platTileImage_dirt = new Image();
var platTileImage_grass = new Image();
platTileImage_bricks.src = "Images/PlatGame/platTile_bricks.png";
platTileImage_dirt.src = "Images/PlatGame/platTile_dirt.png";
platTileImage_grass.src = "Images/PlatGame/platTile_grass.png";

/* GAME COMPONENTS
**********************************************/
// Generic component
var gameComponent = function (gameContext, width, height, posX, posY, image, speed) {
    this.gameContext = gameContext,
    this.width = width,
    this.height = height,
    this.posX = posX,
    this.posY = posY,
    this.image = image,
    this.speed = speed,
    this.velX = 0,
    this.velY = 0,

    this.update = function () { // Move depending on vels
        this.posX += this.velX;
        this.posY += this.velY;
    },
    // Returns collision side of this (this.left cols with other.right? then dir = "L")
    this.collisionCheck = function(otherComp) {
        // get the vectors to check against
        var vX = (this.posX + (this.width / 2)) - (otherComp.component.posX + (otherComp.component.width / 2)),
            vY = (this.posY + (this.height / 2)) - (otherComp.component.posY + (otherComp.component.height / 2)),
            // add the half widths and half heights of the objects
            hWidths = (this.width / 2) + (otherComp.component.width / 2),
            hHeights = (this.height / 2) + (otherComp.component.height / 2),
            colDir = null;
     
        // if the x and y vector are less than the half width or half height, they we must be inside the object, causing a collision
        if (Math.abs(vX) < hWidths && Math.abs(vY) < hHeights) {
        // figures out on which side we are colliding (top, bottom, left, or right)
            var oX = hWidths - Math.abs(vX),
                oY = hHeights - Math.abs(vY);
            if (oX >= oY) {
                if (vY > 0) {
                    colDir = TOP;
                    this.posY += oY;
                } else {
                    colDir = BOTTOM;
                    this.posY -= oY;
                }
            } else {
                if (vX > 0) {
                    colDir = LEFT;
                    this.posX += oX;
                } else {
                    colDir = RIGHT;
                    this.posX -= oX;
                }
            }
        }
        return colDir;
    }
};

// Player, enemies, NPC's, ...
var liveComponent = function (gameContext, width, height, posX, posY, image, speed, friction, ticksPerFrame, numberOfFrames) {
    this.component = new gameComponent(gameContext, width, height, posX, posY, image, speed),
    this.ticksPerFrame = ticksPerFrame,
    this.numberOfFrames = numberOfFrames,
    this.isAlive = true,
    this.frameIndex = 0,
    this.tickCount = 0,
    this.onGround = false,
    this.jumping = false,
    this.friction = friction,

    this.update = function () {
        // Friction and gravity
        this.component.velX *= friction;
        this.component.velY += GRAVITY;

        this.onGround = false;
        // Every liveComponent checks collision with every tileComponent
        for (var i = 0; i < platTiles.length; i++) {
            var colDir = this.component.collisionCheck(platTiles[i]);

            if (colDir == LEFT || colDir == RIGHT) {
            //     this.component.velX = 0;
            } else if (colDir == BOTTOM) {
                this.onGround = true;
                this.jumping = false;
            } else if (colDir == TOP) {
                this.component.velY = 0;
            }
        }

        if (this.onGround) {
            this.component.velY = 0;
        }

        this.component.update(); // Moves
    },
    this.render = function () {
        this.tickCount++;

        if (this.tickCount > this.ticksPerFrame) {
            this.tickCount = 0;

            // If the current frame index is in range
            if (this.frameIndex < this.numberOfFrames - 1) {  
                // Go to the next frame
                this.frameIndex += 1;
            } else {
                this.frameIndex = 0;
            }
        }

        this.component.gameContext.drawImage(
            this.component.image,
            this.frameIndex * this.component.image.width / this.numberOfFrames,
            0,
            this.component.image.width / this.numberOfFrames,
            this.component.image.height,
            this.component.posX,
            this.component.posY,
            this.component.width,
            this.component.height);
    }
};

// Background images
var backgroundComponent = function (gameContext, width, height, posX, posY, image, speed) {
    this.component = new gameComponent(gameContext, width, height, posX, posY, image),
    this.update = function () {
        this.component.update();
    },
    this.render = function () {
        this.component.gameContext.drawImage(this.component.image, this.component.posX, this.component.posY);
        this.component.gameContext.drawImage(this.component.image, this.component.posX + this.component.width, this.component.posY);
    }
};

// Platforms, floor, walls, ...
var tileComponent = function (gameContext, gameCanvas, widthIndex, heightindex, xIndex, yIndex, image) {
    this.width = TILE_FIXED_SIZE * widthIndex,
    this.height = TILE_FIXED_SIZE * heightindex,
    this.posX = TILE_FIXED_SIZE * xIndex,
    this.posY = gameCanvas.height - TILE_FIXED_SIZE * yIndex,

    this.component = new gameComponent(gameContext, this.width, this.height, this.posX, this.posY, image),
    //this.pat = this.component.gameContext.createPattern(this.component.image, "repeat"),
    this.verticalTiles = this.width / image.width,
    this.horizontalTiles = this.height / image.height,
    this.speed = platPlayer.speed,

    this.update = function () {
        this.component.update();
    },
    this.render = function () {
        var ctx = this.component.gameContext;
        var img = this.component.image;
        // ctx.beginPath();
        for (var i = 0; i < this.verticalTiles; i++) {
            for (var j = 0; j < this.horizontalTiles; j++) {
                ctx.drawImage(img,
                    this.component.posX + img.width * i,
                    this.component.posY + img.height * j,
                    img.width,
                    img.height);
            }
        }
        ctx.rect(this.component.posX, this.component.posY, this.component.width, this.component.height);
    }
};

/* COMPONENTS FUNCTIONS
**********************************************/
/* INITS */
var platPlayerInit = function () {
    platPlayer = new liveComponent(
        PLAT_CONTEXT, 40, 40,
        PLAT_CANVAS.width / 10, PLAT_CANVAS.height / 10, platPlayerImage, 8,
        0.85, TICKS_PER_FRAME, 10);
};

var platBackgroundsInit = function () {
    platBackgrounds = [];

    for (var i = 0; i < backImages.length; i++) {
        var platBackground = new backgroundComponent(PLAT_CONTEXT, backImages[i].width, backImages[i].height,
            0, 0, backImages[i]);
        platBackgrounds.push(platBackground);
    }

    platBackgrounds[1].component.speed = 2.5;
};

var platTilesInit = function () {
    platTiles = [];

    // 0 a 400
    platTiles.push(
        new tileComponent(PLAT_CONTEXT, PLAT_CANVAS, 8, 1, 0, 1, platTileImage_grass)
    );
    platTiles.push(
        new tileComponent(PLAT_CONTEXT, PLAT_CANVAS, 2, 1, 0, 3, platTileImage_grass)
    );
    // 400 to 500 empty
    // 500 to 800
    platTiles.push(
        new tileComponent(PLAT_CONTEXT, PLAT_CANVAS, 6, 1, 10, 1, platTileImage_grass)
    );
    // 800 to 900
    platTiles.push(
        new tileComponent(PLAT_CONTEXT, PLAT_CANVAS, 2, 1, 16, 3, platTileImage_grass)
    );
    // 900 to 1000 empty
    // 1000 to 1100
    platTiles.push(
        new tileComponent(PLAT_CONTEXT, PLAT_CANVAS, 2, 1, 20, 4, platTileImage_grass)
    );
    platTiles.push(
        new tileComponent(PLAT_CONTEXT, PLAT_CANVAS, 2, 1, 20, 3, platTileImage_dirt)
    );
    platTiles.push(
        new tileComponent(PLAT_CONTEXT, PLAT_CANVAS, 2, 1, 20, 3, platTileImage_dirt)
    );
    platTiles.push(
        new tileComponent(PLAT_CONTEXT, PLAT_CANVAS, 2, 1, 20, 2, platTileImage_dirt)
    );
    platTiles.push(
        new tileComponent(PLAT_CONTEXT, PLAT_CANVAS, 2, 1, 20, 1, platTileImage_dirt)
    );
    // 1100 to 1300 empty
    // 1300 to 1350
    platTiles.push(
        new tileComponent(PLAT_CONTEXT, PLAT_CANVAS, 1, 1, 26, 1, platTileImage_grass)
    );
    // 1350 to 1450
    platTiles.push(
        new tileComponent(PLAT_CONTEXT, PLAT_CANVAS, 2, 1, 27, 2, platTileImage_grass)
    );
    platTiles.push(
        new tileComponent(PLAT_CONTEXT, PLAT_CANVAS, 2, 1, 27, 1, platTileImage_dirt)
    );
    // 1450 to 1600 empty
    // 1600 to 1700
    platTiles.push(
        new tileComponent(PLAT_CONTEXT, PLAT_CANVAS, 4, 1, 32, 1, platTileImage_grass)
    );
    // 1700 to 1800
    platTiles.push(
        new tileComponent(PLAT_CONTEXT, PLAT_CANVAS, 2, 1, 34, 2, platTileImage_grass)
    );
    platTiles.push(
        new tileComponent(PLAT_CONTEXT, PLAT_CANVAS, 2, 1, 34, 1, platTileImage_dirt)
    );
    // 1800 to 2800
    platTiles.push(
        new tileComponent(PLAT_CONTEXT, PLAT_CANVAS, 20, 1, 36, 3, platTileImage_grass)
    );
    platTiles.push(
        new tileComponent(PLAT_CONTEXT, PLAT_CANVAS, 20, 1, 36, 2, platTileImage_dirt)
    );
    platTiles.push(
        new tileComponent(PLAT_CONTEXT, PLAT_CANVAS, 20, 1, 36, 1, platTileImage_dirt)
    );
    // 2800 to 3000
    platTiles.push(
        new tileComponent(PLAT_CONTEXT, PLAT_CANVAS, 15, 11, 56, 11, platTileImage_bricks)
    );
    // width, height, posX, posY
};

/* UPDATES */
var platPlayerUpdate = function () {
    platPlayer.update();

    // Keyboard
    if (document.activeElement === PLAT_CANVAS) {
        // W = up
        if (platKeys && platKeys[87]) {
            // Go UP
        }
        // A = left
        if (platKeys && platKeys[65]) {
            if (platPlayer.component.velX < platPlayer.component.speed) {
                platPlayer.component.velX--;
            }
        }
        // S = down
        if (platKeys && platKeys[83]) {
            // Go DOWN
        }
        // D = right
        if (platKeys && platKeys[68]) {
            if (platPlayer.component.velX < platPlayer.component.speed) {
                platPlayer.component.velX++;
            }
        }
        // K = jump
        if (platKeys && platKeys[75]) {
            if (!platPlayer.jumping && platPlayer.onGround) {
                platPlayer.jumping = true;
                platPlayer.onGround = false;
                platPlayer.component.velY = -platPlayer.component.speed * 2;
            }
        }
    }

    if (platPlayer.component.posX <= 0) {
        platPlayer.component.posX = 0;
    } else if (platPlayer.component.posX >= PLAT_CANVAS.width / 3) {
        platPlayer.component.posX = PLAT_CANVAS.width / 3;
        platBackgrounds[2].component.velX = -Math.abs(platPlayer.component.velX / 4);
        for (var i = 0; i < platTiles.length; i++) {
            platTiles[i].component.velX = -Math.abs(platPlayer.component.velX);
        }
    }

    if (platPlayer.component.posY > PLAT_CANVAS.height + 10) {
        platPlayer.isAlive = false;
    }
};

var platBackgroundUpdate = function () {
    platBackgrounds[1].component.posX += platBackgrounds[1].component.velX;

    if (platBackgrounds[2].component.velX >= 0) {
        platBackgrounds[2].component.velX = 0;
    }
    platBackgrounds[2].component.velX *= platPlayer.friction;
    // platBackgrounds[3].velX *= platPlayer.friction;

    platBackgrounds[2].component.posX += platBackgrounds[2].component.velX;
    //platBackgrounds[3].posX += platBackgrounds[3].velX;

    if (document.activeElement === PLAT_CANVAS) {
        // D = right
        if (platKeys && platKeys[68] && platPlayer.isAlive) {
            if (platPlayer.component.posX >= PLAT_CANVAS.width / 3) {
                
            }
        }
    }

    for (var i = 1; i < backImages.length; i++) {
        if (platBackgrounds[i].component.posX <= -(platBackgrounds[i].component.width)) {
            platBackgrounds[i].component.posX = 0;
        }
    }
};

var platTilesUpdate = function () {
    for (var i = 0; i < platTiles.length; i++) {
        if (platTiles[i].component.velX >= 0) {
            platTiles[i].component.velX = 0;
        }
        platTiles[i].component.velX *= platPlayer.friction;

        if (document.activeElement === PLAT_CANVAS) {
            // D = right
            if (platKeys && platKeys[68] && platPlayer.isAlive) {
                if (platPlayer.component.posX >= PLAT_CANVAS.width / 3) {

                }
            }
        }
    }
};

/* GAME FUNCTIONS 
**********************************************/
// Initializes everything to 0 and starts main function
var PLAT_GAME_START = function () {
    platPlayerInit();
    platBackgroundsInit();
    platTilesInit();

    PLAT_CANVAS.tabIndex = 3;

    PLAT_CANVAS.addEventListener("keydown", function(e) {
        // Prevent default for spacebar, arrow keys, WASD and K
        if([32, 37, 38, 39, 40, 87, 65, 83, 68, 75].indexOf(e.keyCode) > -1) {
            e.preventDefault();
        }
        platKeys = (platKeys || []);
        platKeys[e.keyCode] = true;

        if ([75].indexOf(e.keyCode) > -1 && platPlayer.jumping) {
            platKeys[e.keyCode] = false;
        }
    });
    PLAT_CANVAS.addEventListener("keyup", function(e) {
        platKeys[e.keyCode] = false;
    });

    plat_main();
    PLAT_CANVAS.focus();

    // Remove start button and show restart button
    var parent = document.getElementById("canvases");
    var child = document.getElementById("btnPlatStart");
    parent.removeChild(child);
    document.getElementById("btnPlatRestart").style["display"] = "";
};

var PLAT_GAME_RESTART = function () {
    platPlayerInit();
    platBackgroundsInit();
    platTilesInit();

    PLAT_CANVAS.focus();
};

/* MAIN LOOP
**********************************************/
var plat_main = function () {
    // Updates
    if (platPlayer.isAlive) {
        platPlayerUpdate();
    }

    platBackgroundUpdate();
    for (var i = 0; i < platBackgrounds.length; i++) {
        platBackgrounds[i].update();
    }

    platTilesUpdate();
    for (var i = 0; i < platTiles.length; i++ ) {
        if (platTiles[i].component.posX + platTiles[i].component.width > -10) {
            platTiles[i].update();
        }
    }

    // Clear whole canvas before redraw
    PLAT_CONTEXT.clearRect(0, 0, PLAT_CANVAS.width, PLAT_CANVAS.height);

    // Renders
    for (var i = 0; i < platBackgrounds.length; i++) {
        platBackgrounds[i].render();
    }

    if (platPlayer.isAlive) {
        platPlayer.render();
    }

    for (var i = 0; i < platTiles.length; i++ ) {
        if (platTiles[i].component.posX + platTiles[i].component.width > -10) {
            platTiles[i].render();
        }
    }

    requestAnimationFrame(plat_main);
};

// E♥P c: