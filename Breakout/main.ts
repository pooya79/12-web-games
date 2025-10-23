const canvas = document.getElementById("game") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

// --- Base Classes ---
abstract class GameObject {
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;

    constructor(
        x: number,
        y: number,
        width: number,
        height: number,
        color: string
    ) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
    }

    abstract draw(ctx: CanvasRenderingContext2D): void;
}

// --- Paddle ---
class Paddle extends GameObject {
    speed = 150;
    moveLeft = false;
    moveRight = false;

    update(deltaTime: number) {
        if (this.moveLeft) {
            this.x -= this.speed * deltaTime;
        }
        if (this.moveRight) {
            this.x += this.speed * deltaTime;
        }
        this.x = Math.max(0, Math.min(canvas.width - this.width, this.x));
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

// --- Brick ---
class Brick extends GameObject {
    broken = false;

    draw(ctx: CanvasRenderingContext2D) {
        if (!this.broken) {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}

// --- Ball ---
class Ball extends GameObject {
    dx = 100;
    dy = -100;
    radius = this.width / 2;

    update(deltaTime: number, paddle: Paddle, bricks: Brick[]) {
        this.x += this.dx * deltaTime;
        this.y += this.dy * deltaTime;

        // wall bounce
        if (this.x < 0 || this.x + this.width > canvas.width) {
            this.dx *= -1;
        }
        if (this.y < 0) {
            this.dy *= -1;
        }

        // paddle collision
        if (
            this.y + this.height >= paddle.y &&
            this.x + this.width >= paddle.x &&
            this.x <= paddle.x + paddle.width
        ) {
            this.dy *= -1;
            this.y = paddle.y - this.height;
        }

        // brick collisions
        for (const brick of bricks) {
            if (
                !brick.broken &&
                this.x + this.width >= brick.x &&
                this.x <= brick.x + brick.width &&
                this.y + this.height >= brick.y &&
                this.y <= brick.y + brick.height
            ) {
                this.dy *= -1;
                brick.broken = true;
            }
        }
    }

    isOutOfBounds(): boolean {
        return this.y > canvas.height;
    }

    draw(ctx: CanvasRenderingContext2D) {
        // draw circle
        ctx.beginPath();
        ctx.arc(
            this.x + this.radius,
            this.y + this.radius,
            this.radius,
            0,
            Math.PI * 2
        );
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }
}

// --- Game Setup ---
let score: number;
let paddle: Paddle;
let ball: Ball;
const bricks: Brick[] = [];
const rows = 5,
    cols = 8,
    pad = 10,
    bw = 70,
    bh = 30;

for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
        // random color
        const color = `hsl(${Math.random() * 360}, 100%, 50%)`;
        bricks.push(
            new Brick(c * (bw + pad) + pad, r * (bh + pad) + pad, bw, bh, color)
        );
    }
}

function restartGame() {
    score = 0;
    paddle = new Paddle(
        canvas.width / 2 - 50,
        canvas.height - 30,
        100,
        10,
        "#0f0"
    );
    ball = new Ball(canvas.width / 2 - 10, canvas.height - 100, 20, 20, "#f00");
    bricks.forEach((brick) => (brick.broken = false));
}

// Initialize the game
restartGame();

// --- Input ---
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
        paddle.moveLeft = true;
    }
    if (e.key === "ArrowRight") {
        paddle.moveRight = true;
    }
});

document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft") {
        paddle.moveLeft = false;
    }
    if (e.key === "ArrowRight") {
        paddle.moveRight = false;
    }
});

// --- Game Loop ---
function drawAll() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    paddle.draw(ctx);
    ball.draw(ctx);
    bricks.forEach((brick) => brick.draw(ctx));

    ctx.font = "16px Arial";
    ctx.fillStyle = "#fff";
    ctx.fillText(`Score: ${score}`, 10, 20);
}

function updateAll(deltaTime: number) {
    paddle.update(deltaTime);
    ball.update(deltaTime, paddle, bricks);
    score = bricks.filter((brick) => brick.broken).length;

    if (ball.isOutOfBounds()) {
        // Handle game over
        alert("Game Over");
        restartGame();
    }
}

let lastTime = performance.now();
function gameLoop(time: number) {
    const deltaTime = (time - lastTime) / 1000; //seconds per frame
    lastTime = time;

    updateAll(deltaTime);
    drawAll();
    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
