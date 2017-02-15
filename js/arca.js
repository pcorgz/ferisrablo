var arcaPlayer;
var pellet; // 2. A lead projectile used as ammunition in rifled air guns. << https://en.wiktionary.org/wiki/pellet >>
var pelletInitState = true; // true when is not moving/no been launched yet
var arcaPlayerInitPos = {};
var pelletInitPos = {};
var highScore = 0;
var score = 0;
var initLives = 2;
var livesLeft = initLives;
var rows; // "Enemy" blocks
var blocksLeft;

var GAME_START = function () {
    arcaPlayerInitPos = {
        x : GAME_AREA.canvas.width / 2 - 50,
        y : 350
    };
    arcaPlayer = new component(100, 10, arcaPlayerInitPos.x, arcaPlayerInitPos.y, "./images/ArcaGame/arcaPlayer.png", 10, 0);

    pelletInitPos = {
        x : GAME_AREA.canvas.width / 2 - 5,
        y : 340
    };
    pellet = new component(10, 10, pelletInitPos.x, pelletInitPos.y, "./images/ArcaGame/pellet.png", 5, -5);

    GAME_AREA.initBlocks();

    GAME_AREA.start();
    GAME_AREA.canvas.focus();
    
    var parent = document.getElementById("canvases");
    var child = document.getElementById("btnArcaStart");
    parent.removeChild(child);
    document.getElementById("btnArcaRestart").style["display"] = "";
};

var GAME_AREA = {
    canvas: document.getElementById("arcaGame"),
    start: function() {
        this.canvas.width = 570;
        this.canvas.height = 400;
        this.canvas.tabIndex = 2;
        this.context = this.canvas.getContext("2d");
        this.frameNo = 0;
        this.interval = setInterval(GAME_UPDATE, 17);

        this.canvas.addEventListener("keydown", function(e) {
            if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
                e.preventDefault();
            }
            GAME_AREA.keys = (GAME_AREA.keys || []);
            GAME_AREA.keys[e.keyCode] = (e.type == "keydown");
        });
        addEventListener("keyup", function(e) {
            GAME_AREA.keys[e.keyCode] = (e.type == "keydown");  
        });
    },
    stop: function () {
        clearInterval(this.interval);
    },
    clear: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    restartPelletPlayer: function () {
        arcaPlayer.posX = arcaPlayerInitPos.x;
        arcaPlayer.posY = arcaPlayerInitPos.y;

        pelletInitState = true;
        pellet.speedX = Math.abs(pellet.speedX); // always to the right
        pellet.posX = pelletInitPos.x;
        pellet.posY = pelletInitPos.y;
    },
    restartGame: function () {
        this.restartPelletPlayer();
        this.initBlocks();
        highScore = score;
        score = 0;
        livesLeft = initLives;
        this.canvas.focus();
    },
    initBlocks: function () {
        var marginTB = 5;   // margin top + bottom
        var marginLR = 5;  // margin left + right
        var canvasPadding = 30;
        var fixedWidth = 60;
        var fixedHeight = 20;
        
        rows = {};
        blocksLeft = 0;
        for (var row = 0; row < 5; row++) {
            for (var column = 0; column < 8; column++) {
                var posX = column * fixedWidth + (marginLR * column) + canvasPadding;
                var posY = row * fixedHeight + (marginTB * row) + canvasPadding;
                var imagePath = "../images/ArcaGame/arcaRow" + (row + 1) + ".png";

                var block = new component (fixedWidth, fixedHeight, posX, posY, imagePath, 0, 0);

                rows[row * 8 + column] = block; // 0*10+0=0, 0*10+1=1, 2*10+3=23 etc
                blocksLeft++;
            }
        }
    }
};

var component = function (width, height, posX, posY, imagePath, speedX, speedY) {
    this.width = width,
    this.height = height,
    this.posX = posX,
    this.posY = posY,
    this.image = new Image(),
    this.image.src = imagePath,
    this.speedX = speedX,
    this.speedY = speedY,
    this.isAlive = true,
    this.update = function () {
        ctx = GAME_AREA.context;
        ctx.drawImage(this.image, this.posX, this.posY);
    },
    this.crashWith = function(otherobj) {
        var myleft = this.posX;
        var myright = this.posX + (this.width);
        var mytop = this.posY;
        var mybottom = this.posY + (this.height);
        var otherleft = otherobj.posX;
        var otherright = otherobj.posX + (otherobj.width);
        var othertop = otherobj.posY;
        var otherbottom = otherobj.posY + (otherobj.height);
        
        var crash = true;
        if ((myleft > otherright) || (mytop > otherbottom)
                || (myright < otherleft) || (mybottom < othertop)) {
            crash = false;
        }

        var crashRight = false,
            crashLeft = false;
        var crashLeftSide = false,
            crashTopSide = false,
            crashRightSide = false,
            crashBottomSide = false;
        if (crash) {
            var myCenter = this.width / 2 + myleft;
            var otherCenter = otherobj.width / 2 + otherleft;
            if (myCenter >= otherCenter) { // hit on right side
                crashRight = true;
            } else {
                crashLeft = true;
            }

            if (mytop == otherbottom) {
                crashTopSide = true;
            } else if (mybottom == othertop) {
                crashBottomSide = true;
            } else if (myleft == otherright) {
                crashLeftSide = true;
            } else if (myright == otherleft) {
                crashRightSide = true;
            }
        }
        
        return {
            crash: crash,
            crashRight      : crashRight,
            crashLeft       : crashLeft,
            crashLeftSide   : crashLeftSide,
            crashTopSide    : crashTopSide,
            crashRightSide  : crashRightSide,
            crashBottomSide : crashBottomSide
        };
    }
};

var GAME_UPDATE = function () {
    GAME_AREA.clear();
    GAME_AREA.frameNo++;

    moveArcaPlayer();
    movePellet();
    arcaPlayer.update();
    pellet.update();
    updateEnemyBlocks();

    if (blocksLeft == 0) {
        GAME_AREA.restartPelletPlayer();
        GAME_AREA.initBlocks();
    }

    if (livesLeft < 0) {
        highScore = score;
        GAME_AREA.restartGame();
    }

    /* score & extra lives */
    ctx = GAME_AREA.context;
    ctx.font = "20px sans-serif";
    ctx.fillText("Score: " + score, 25, 385);
    ctx.fillText("High Score: " + (score >= highScore ? score : highScore),
            GAME_AREA.canvas.width/2 - 50,
            385)
    ctx.fillText("Extra: ", 450, 385);
    for (var lileft = 1; lileft <= livesLeft; lileft++) {
        ctx.drawImage(pellet.image,         // Image
            lileft * (pellet.image.width * 1.5) + 500,  // X
            370,                                // Y
            pellet.image.width * 1.2,         // width
            pellet.image.height * 1.2);       // height
    }
};

var moveArcaPlayer = function () {
    if (document.activeElement === GAME_AREA.canvas) {
        if (GAME_AREA.keys && GAME_AREA.keys[37]) { // LEFT
            if (arcaPlayer.posX <= 0) {
                arcaPlayer.posX = 0;

                if (pelletInitState) {
                    pellet.posX = 45;
                }
            } else {
                arcaPlayer.posX -= arcaPlayer.speedX;

                if (pelletInitState) {
                    pellet.posX -= arcaPlayer.speedX;
                }
            }
        }
        if (GAME_AREA.keys && GAME_AREA.keys[39]) { // RIGHT
            if (arcaPlayer.posX >= GAME_AREA.canvas.width - arcaPlayer.width) {
                arcaPlayer.posX = GAME_AREA.canvas.width - arcaPlayer.width;

                if (pelletInitState) {
                    pellet.posX = GAME_AREA.canvas.width - 55;
                }
            } else {
                arcaPlayer.posX += arcaPlayer.speedX;

                if (pelletInitState) {
                    pellet.posX += arcaPlayer.speedX;
                }
            }
        }
    }
};

var movePellet = function () {
    if (pelletInitState) {
        if (GAME_AREA.keys && GAME_AREA.keys[32]) { // Spacebar pressed
            pelletInitState = false;
        }
    } else {
        if (pellet.posX <= 0 ) {
            pellet.speedX = Math.abs(pellet.speedX); // crash with left side of canvas
        }
        if (pellet.posX >= GAME_AREA.canvas.width - pellet.width) { // ^^ right side
            pellet.speedX = -Math.abs(pellet.speedX);
        }
        if (pellet.posY <= 0) {
            pellet.speedY = Math.abs(pellet.speedY);   // ^^ top side
        }

        // Collision with player
        var pelletPlayerCrash = pellet.crashWith(arcaPlayer);
        if (pelletPlayerCrash.crash) {
            pellet.speedY = -Math.abs(pellet.speedY);
        }
        if (pelletPlayerCrash.crashRight) {
            pellet.speedX = Math.abs(pellet.speedX);
        }
        if (pelletPlayerCrash.crashLeft) {
            pellet.speedX = -Math.abs(pellet.speedX);
        }

        // update pellet position
        pellet.posX += pellet.speedX;
        pellet.posY += pellet.speedY;

        // leaves through bottom side
        if (pellet.posY > GAME_AREA.canvas.height) {
            livesLeft--;
            GAME_AREA.restartPelletPlayer();
        }
    }
};

var updateEnemyBlocks = function () {
    for (var iBlock = 0; iBlock < Object.keys(rows).length; iBlock++) {
        var block = rows[iBlock]
        if (block.isAlive) {
            block.update();

            var pelletBlockCrash = pellet.crashWith(block);
            if (pelletBlockCrash.crash) {
                block.isAlive = false;
                score += 10;
                blocksLeft--;

                if (pelletBlockCrash.crashTopSide) { // top side of ball
                    pellet.speedY = Math.abs(pellet.speedY);
                }
                if (pelletBlockCrash.crashBottomSide) {
                    pellet.speedY = -Math.abs(pellet.speedY);
                }
                if (pelletBlockCrash.crashLeftSide) {
                    pellet.speedX = Math.abs(pellet.speedX);
                }
                if (pelletBlockCrash.crashRightSide) {
                    pellet.speedX = -Math.abs(pellet.speedX);
                }
            }
        }
    }
};