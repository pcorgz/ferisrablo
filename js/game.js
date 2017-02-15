// Create the gameCanvas
// var gameCanvas = document.createElement("canvas");
var gameCanvas = document.getElementById("gameCanvas");
var gameCtx = gameCanvas.getContext("2d");
// gameCanvas.id = "gameCanvas";
gameCanvas.width = 512;
gameCanvas.height = 480;
gameCanvas.tabIndex = 1;
// document.getElementById("canvases").appendChild(gameCanvas);

var isNight = false;

// Background image
var bgReady = false;
var bgImage = new Image();
bgImage.onload = function () {
    bgReady = true;
};
bgImage.src = "images/background.png";

// Background image 2
var bg2Ready = false;
var bg2Image = new Image();
bg2Image.onload = function () {
    bg2Ready = true;
};
bg2Image.src = "images/background_night.png";

// Hero image
var heroReady = false;
var heroImage = new Image();
heroImage.onload = function () {
    heroReady = true;
};
heroImage.src = "images/hero.png";

// Monster image
var monsterReady = false;
var monsterImage = new Image();
monsterImage.onload = function () {
    monsterReady = true;
};
monsterImage.src = "images/monster.png";

// Game objects
var hero = {
    speed: 256 // movement in pixels per second
};
var monster = {
    initSpeed: 20,
    maxSpeed: 520,
    speedX: 20,
    speedY: 20
};
var monstersCaught = 0;
var nightMonsters = 0;

// Handle keyboard controls
var keysDown = {};

addEventListener("keydown", function (e) {
    keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
    delete keysDown[e.keyCode];
}, false);

var then;

// Starts the hero in the middle and place the monster
var startGame = function () {
    playerInit();

    placeMonster();

    // Let's play this game!
    then = Date.now();
    // Start main thread
    main();

    gameCanvas.focus();

    var parent = document.getElementById("canvases");
    var child = document.getElementById("btnStart");
    parent.removeChild(child);

    document.getElementById("btnReset").style["display"] = "";
};

// Reset the game
var reset = function () {
    isNight = false;
    gameCanvas.focus();
    monstersCaught = 0;
    nightMonsters = 0;
    monster.speedX = monster.initSpeed;
    monster.speedY = monster.initSpeed;

    playerInit();
    placeMonster();
};

var playerInit = function () {
    hero.x = gameCanvas.width / 2;
    hero.y = gameCanvas.height / 2;
};

var placeMonster = function () {
    // Throw the monster somewhere on the screen randomly
    monster.x = 32 + (Math.random() * (gameCanvas.width - 64));
    monster.y = 32 + (Math.random() * (gameCanvas.height - 64));

    var randX = Math.floor((Math.random() * 10) + 1);
    var randY = Math.floor((Math.random() * 10) + 1);

    if (randX > 5)
        monster.speedX *= -1
    if (randY > 5)
        monster.speedY *= -1;
};

// Update game objects
var updateGame = function (modifier) {

    movePlayer(modifier);
    moveMonster(modifier);

    if (isNight) {
        monster2Sprite.update();
    } else {
        monsterSprite.update();
    }

    // Are they touching?
    if (
        hero.x <= (monster.x + 32)
        && monster.x <= (hero.x + 32)
        && hero.y <= (monster.y + 32)
        && monster.y <= (hero.y + 32)
    ) {
        if (isNight) {
            ++nightMonsters;
        } else {
            ++monstersCaught;
        }
        if (monstersCaught % 3 == 0 || nightMonsters % 3 == 0) {
            if (monster.speedX < monster.maxSpeed
                && monster.speedY < monster.maxSpeed) {
                if (monster.speedX >= 0)
                    monster.speedX += 50;
                else
                    monster.speedX -= 50;

                if (monster.speedY >= 0)
                    monster.speedY += 50;
                else
                    monster.speedY -= 50;
            }
        }

        placeMonster();
    }
};

var movePlayer = function (modifier) {
    // Only when canvas is focused
    if (document.activeElement === gameCanvas) {
        if (38 in keysDown) { // Player holding up
            if (hero.y <= 0)
                hero.y = 0;
            else
                hero.y -= hero.speed * modifier;
        }
        if (40 in keysDown) { // Player holding down
            if (hero.y >= gameCanvas.height - 32)
                hero.y =  gameCanvas.height - 32;
            else
                hero.y += hero.speed * modifier;
        }
        if (37 in keysDown) { // Player holding left
            if (isNight) {
                if (hero.x <= -16) {
                    isNight = false;
                    hero.x = gameCanvas.width - 32;
                } else {
                    hero.x -= hero.speed * modifier;
                }
            } else {
                if (hero.x <= 0)
                    hero.x = 0;
                else
                    hero.x -= hero.speed * modifier;
            }
        }
        if (39 in keysDown) { // Player holding right
            if (!isNight) {
                if (hero.x >= gameCanvas.width - 16) {
                    isNight = true;
                    hero.x = 0;
                } else {
                    hero.x += hero.speed * modifier;
                }
            } else {
                if (hero.x >= gameCanvas.width - 32){}
                    //hero.x = gameCanvas.width - 32;
                else
                    hero.x += hero.speed * modifier;
            }
        }
    }
};

var moveMonster = function (modifier) {
    monster.x += monster.speedX * modifier;
    monster.y += monster.speedY * modifier;
    
    if (monster.x <= 0 || monster.x >= gameCanvas.width - 32)
        monster.speedX *= -1;

    if (monster.y <= 0 || monster.y >= gameCanvas.height - 32)
        monster.speedY *= -1;
};

// Draw everything
var render = function () {
    if (isNight) {
        if (bg2Ready) {
            gameCtx.drawImage(bg2Image, 0, 0);
        }

        if (monsterSp2Ready) {
            monster2Sprite.render();
        }

    } else {
        if (bgReady) {
            gameCtx.drawImage(bgImage, 0, 0);
        }

        if (monsterSpReady) {
            monsterSprite.render();
        }
    }

    if (heroReady) {
        gameCtx.drawImage(heroImage, hero.x, hero.y);
    }

    // if (monsterReady) {
    //     gameCtx.drawImage(monsterImage, monster.x, monster.y);
    // }

    

    // Score
    gameCtx.fillStyle = "rgb(250, 250, 250)";
    gameCtx.font = "24px Helvetica";
    gameCtx.textAlign = "left";
    gameCtx.textBaseline = "top";
    gameCtx.fillText("Monsters caught: " + monstersCaught, 32, 32);
    gameCtx.fillText("Night Monsters caught: " + nightMonsters, 32, 64);
};

// The main game loop
var main = function () {
    var now = Date.now();
    var delta = now - then;

    updateGame(delta / 1000);
    render();

    then = now;

    // Request to do this again ASAP
    requestAnimationFrame(main);
};

var globalTicksPerFrame = 8;

var sprite = function (options) {
    var that = {},
        frameIndex = 0,
        tickCount = 0,
        ticksPerFrame = globalTicksPerFrame || 0,
        numberOfFrames = options.numberOfFrames || 1;;

    that.context = options.context;
    that.width = options.width;
    that.height = options.height;
    that.image = options.image;
    that.loop = options.loop;

    that.render = function () {
        that.context.drawImage(
            that.image,
            frameIndex * that.width / numberOfFrames,
            0,
            that.width / numberOfFrames,
            that.height,
            monster.x,
            monster.y,
            that.width / numberOfFrames,
            that.height);
    };

    that.update = function () {
        tickCount++;
        if (tickCount > ticksPerFrame) {
            tickCount = 0;

            // If current frameindex is in range
            if (frameIndex < numberOfFrames - 1) {
                // go to the next frame
                frameIndex++;
            } else if (that.loop) {
                frameIndex = 0;
            }
        }
    };

    return that;
};

// Monster image sprites
var monsterSpReady = false;
var monsterSp2Ready = false;
var monsterSpImage = new Image();
var monsterSp2Image = new Image();
monsterSpImage.onload = function () {
    monsterSpReady = true;
};
monsterSp2Image.onload = function () {
    monsterSp2Ready = true;
}
monsterSpImage.src = "images/monsterSprites.png";
monsterSp2Image.src = "images/monsterSprites_2.png";

var monsterSprite = sprite({
    context: gameCtx,
    width: 64,
    height: 32,
    image: monsterSpImage,
    numberOfFrames: 2,
    loop: true
});

var monster2Sprite = sprite({
    context: gameCtx,
    width: 64,
    height: 32,
    image: monsterSp2Image,
    numberOfFrames: 2,
    loop: true
});

// Cross-browser support for requestAnimationFrame
var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

gameCanvas.addEventListener("keydown", function(e) {
    // space and arrow keys
    if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
            e.preventDefault();
    }
}, false);