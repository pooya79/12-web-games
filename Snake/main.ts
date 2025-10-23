const canvas = document.getElementById("game") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

interface Position {
    x: number;
    y: number;
}

const box = 20;
const speed = 150; // ms per move
let snake: Position[] = [{ x: 10 * box, y: 10 * box }];
let food: Position = randomFood();
let direction: "LEFT" | "RIGHT" | "UP" | "DOWN" | null = null;
let score = 0;
let lastTime = 0;

document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
    if (e.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
    if (e.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
    if (e.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
});

function randomFood(): Position {
    let newFood: Position;
    do {
        newFood = {
            x: Math.floor(Math.random() * (canvas.width / box)) * box,
            y: Math.floor(Math.random() * (canvas.height / box)) * box,
        };
    } while (snake.some((s) => s.x === newFood.x && s.y === newFood.y));
    return newFood;
}

function resetGame() {
    snake = [{ x: 10 * box, y: 10 * box }];
    direction = null;
    score = 0;
    food = randomFood();
}

function draw(): void {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw snake
    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = i === 0 ? "#0f0" : "#7f7";
        ctx.fillRect(snake[i]!.x, snake[i]!.y, box, box);
    }

    // Draw food
    ctx.fillStyle = "red";
    ctx.fillRect(food.x, food.y, box, box);

    // Draw score
    ctx.fillStyle = "#fff";
    ctx.font = "16px Arial";
    ctx.fillText(`Score: ${score}`, 10, 20);

    // do nothing until player starts moving
    if (!direction) return;

    // Move snake
    let head = { ...snake[0]! };
    if (direction === "LEFT") head.x -= box;
    if (direction === "RIGHT") head.x += box;
    if (direction === "UP") head.y -= box;
    if (direction === "DOWN") head.y += box;

    // Check collision
    if (
        head.x < -box ||
        head.y < -box ||
        head.x > canvas.width ||
        head.y > canvas.height ||
        snake.some((s) => s.x === head.x && s.y === head.y)
    ) {
        alert("Game Over");
        resetGame();
        return;
    }

    // Eat food
    if (head.x === food.x && head.y === food.y) {
        score++;
        food = randomFood();
    } else {
        snake.pop();
    }

    snake.unshift(head);
}

function gameLoop(time: number) {
    if (time - lastTime > speed) {
        draw();
        lastTime = time;
    }
    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
