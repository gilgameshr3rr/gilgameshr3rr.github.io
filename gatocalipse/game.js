console.log("game-larissa");

const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
const CANVAS_WIDTH = (canvas.width = 2048);
const CANVAS_HEIGHT = (canvas.height = 1536);

let gameSpeed = 10;
let gameFrame = 0;

const backgroundLayer1 = new Image();
backgroundLayer1.src = "background_01_static.png";
const backgroundLayer2 = new Image();
backgroundLayer2.src = "background_01_parallax_02.png";
const backgroundLayer3 = new Image();
backgroundLayer3.src = "background_01_parallax_05.png";

window.addEventListener("load", function () {
    class Layer {
        constructor(image, speedChange) {
            this.x = 0;
            this.y = 0;
            this.width = 2048;
            this.height = 1536;
            this.x2 = this.width;
            this.image = image;
            this.speedChange = speedChange;
            this.speed = gameSpeed * this.speedChange;
        }
        update() {
            this.speed = gameSpeed * this.speedChange;
            this.x = (gameFrame * this.speed) % this.width;
        }
        draw() {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
            ctx.drawImage(
                this.image,
                this.x + this.width,
                this.y,
                this.width,
                this.height
            );
        }
    }

    class Game {
        constructor(ctx, width, height) {
            this.ctx = ctx;
            this.width = width;
            this.height = height;
            this.obstacles = [];
            this.obstacleInterval = 500;
            this.obstacleTimer = 0;
            this.obstacleTypes = ["asteroid", "starship", "bomb"];
            this.gameOver = false;
            this.score = 0;
            const maxScore = 100;
            const minScore = 70;
            this.victoryScore = Math.floor(Math.random() * (maxScore - minScore) + minScore);

        }

        update(deltaTime) {
            this.obstacles = this.obstacles.filter((element) => !element.toDelete);
            if (this.obstacleTimer > this.obstacleInterval) {
                this.#addNewObstacle();
                this.obstacleTimer = 0;
            } else {
                this.obstacleTimer += deltaTime;
            }
            this.obstacles.forEach((element) => element.update(deltaTime));
        }

        draw() {
            this.ctx.fillStyle = "white"
            this.ctx.font = "90px sans-serif"
            this.ctx.fillText(`SCORE: ${this.score}`, 100, 100);
            this.ctx.fillText(`TARGET: ${this.victoryScore}`, 100, 200);
            this.obstacles.forEach((element) => element.draw(this.ctx));

        }

        stopGame(message) {
            this.ctx.fillStyle = "white"
            this.ctx.font = "200px sans-serif"
            this.ctx.textAlign = "center"
            this.ctx.fillText(message, this.width / 2, this.height / 2);
            this.gameOver = true;
        }

        #addNewObstacle() {
            const randomObstacle =
                this.obstacleTypes[Math.floor(Math.random() * this.obstacleTypes.length)];
            if (randomObstacle == "asteroid") this.obstacles.push(new Asteroid(this));
            else if (randomObstacle == "starship") this.obstacles.push(new Starship(this));
            else if (randomObstacle == "bomb") this.obstacles.push(new Bomb(this));
        }
    }

    class Base {
        left() {
            return this.x;
        }

        right() {
            return this.x + this.width;
        }

        top() {
            return this.y;
        }

        bottom() {
            return this.y + this.height;
        }

        collidedWith(obj) {
            // TODO fix collision
            // return (
            //     this.x < obj.x + obj.width &&
            //     this.x + this.width > obj.x &&
            //     this.y < obj.y + obj.height &&
            //     this.y + this.height > obj.y
            // );
            return !(
                this.bottom() < obj.top() ||
                this.top() > obj.bottom() ||
                this.right() < obj.left() ||
                this.left() > obj.right()
            );
        }
    }

    class Player extends Base {
        constructor(game) {
            super();
            this.game = game;
            this.width = 250;
            this.height = 250;
            this.x = 0;
            this.y = this.game.height - this.height;
            const playerImg = new Image();
            playerImg.src = "skeleton-06_attack_gun_0.png";
            this.image = playerImg;
            this.speed = 5;
            this.speedX = 0;
            this.speedY = 0;
        }
        draw(context) {
            context.drawImage(this.image, this.x, this.y, this.width, this.height);
        }

        update() {
            this.x += this.speedX;
            if (this.x < 0) this.x = 0;
            else if (this.x > this.game.width - this.width)
                this.x = this.game.width - this.width;

            this.y += this.speedY;
            if (this.y < 0) this.y = 0;
            else if (this.y > this.game.height - this.height)
                this.y = this.game.height - this.height;
        }

        checkCollision() {
            this.game.obstacles.forEach((obstacle, index) => {
                if (this.collidedWith(obstacle)) {
                    if (obstacle instanceof Asteroid || obstacle instanceof Bomb) {
                        this.game.stopGame("GAME OVER");
                    } else {
                        this.game.score += 10;
                        this.game.obstacles.splice(index, 1);
                    }
                }
            });
        }

        checkVictory() {
            if (this.game.score >= this.game.victoryScore) {
                this.game.stopGame("YOU WIN!!");
            }
        }
    }

    class Obstacle extends Base {
        constructor(game) {
            super();
            this.game = game;
            this.toDelete = false;
            this.counted = false;
        }

        update() {
            this.x -= this.speed;
            if (this.x < 0 - this.width) this.toDelete = true;
        }

        draw(ctx) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        }

        getRandomImage(images) {
            return images[Math.floor(Math.random() * images.length)];
        }
    }

    class Asteroid extends Obstacle {
        constructor(game) {
            super(game);
            this.x = this.game.width;
            this.y = Math.random() * this.game.height;
            this.speed = Math.random() * 0.1 + 10;
            const obstacleImg = new Image();
            obstacleImg.src = this.getRandomImage([
                "asteroid_09.png",
                "asteroid_01.png",
                "asteroid_11.png",
                "asteroid_13.png",
                "asteroid_10.png",
                "asteroid_03.png",
            ]);
            this.image = obstacleImg;
            this.width = 200;
            this.height = 200;
        }
    }

    class Starship extends Obstacle {
        constructor(game) {
            super(game);
            this.x = this.game.width;
            this.y = Math.random() * this.game.height;
            this.speed = Math.random() * 0.1 + 10;
            const obstacleImg = new Image();
            obstacleImg.src = this.getRandomImage(["CX16-X2.png", "DKO-api-X2.png"]);
            this.image = obstacleImg;
            this.width = 200;
            this.height = 200;
        }
    }

    class Bomb extends Obstacle {
        constructor(game) {
            super(game);
            this.x = this.game.width;
            this.y = Math.random() * this.game.height;
            this.speed = Math.random() * 0.1 + 10;
            const obstacleImg = new Image();
            obstacleImg.src = this.getRandomImage([
                "rocket_bx_single.png",
                "rocket_dsx_single.png",
                "bullet_long_single.png",
            ]);
            this.image = obstacleImg;
            this.width = 64;
            this.height = 34;
        }
    }

    const layer1 = new Layer(backgroundLayer1, 0);
    const layer2 = new Layer(backgroundLayer2, 0.5);
    const layer3 = new Layer(backgroundLayer3, 0.6);


    const gameLayers = [layer1, layer2, layer3];
    let game = new Game(ctx, CANVAS_WIDTH, CANVAS_HEIGHT);
    let player = new Player(game);

    document.onkeydown = function (e) {
        switch (e.keyCode) {
            case 38:
                player.speedY -= 9;
                break;
            case 40:
                player.speedY += 9;
                break;
            case 37:
                player.speedX -= 9;
                break;
            case 39:
                player.speedX += 9;
                break;
            // TODO
            // case 32: 
            //     if (game.gameOver) {
            //         // requestAnimationFrame(animateBackground);
            //         game = new Game(ctx, CANVAS_WIDTH, CANVAS_HEIGHT);
            //         player = new Player(game);
            //         animateBackground(0);
            //     }
            //     break;
        }
    };

    document.onkeyup = function (e) {
        player.speedX = 0;
        player.speedY = 0;
    };

    let lastTime = 1;
    function animateBackground(timeStamp) {
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        gameLayers.forEach((element) => {
            element.update();
            element.draw();
        });
        game.update(deltaTime);
        game.draw();
        player.draw(ctx);
        player.update();
        player.checkVictory();
        player.checkCollision();
        gameFrame--;
        if (!game.gameOver) {
            requestAnimationFrame(animateBackground);
        }
    }
    animateBackground(0);
});
