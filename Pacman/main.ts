const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");

// --- Types ---
type Direction = "left" | "right" | "up" | "down";
type Map = number[][];

// --- Constants ---
const PACMAN_SPEED = 64; // pixels per second
const PACMAN_IMAGE_CHANGE_RATE = 8; // frames per second
const GHOST_SPEED = 58; // pixels per second
const TILE_SIZE = 32; // pixels
const IMAGE_SCALE = 1; // Scale factor for images
// --- Load Images ---
const pacmanImages: Record<Direction, HTMLImageElement[]> = {
    left: [new Image(), new Image(), new Image()],
    right: [new Image(), new Image(), new Image()],
    up: [new Image(), new Image(), new Image()],
    down: [new Image(), new Image(), new Image()],
};
const ghostImages = [new Image(), new Image(), new Image(), new Image()];
const blueGhostImage = new Image();
const appleImage = new Image();
const dotImage = new Image();
const strawberryImage = new Image();

// --- Set Image Sources ---
const imageBasePath = "./pacman-art/";
pacmanImages.left.forEach((img, index) => {
    img.src = `${imageBasePath}pacman-left/${index + 1}.png`;
});
pacmanImages.right.forEach((img, index) => {
    img.src = `${imageBasePath}pacman-right/${index + 1}.png`;
});
pacmanImages.up.forEach((img, index) => {
    img.src = `${imageBasePath}pacman-up/${index + 1}.png`;
});
pacmanImages.down.forEach((img, index) => {
    img.src = `${imageBasePath}pacman-down/${index + 1}.png`;
});

const ghostNames = ["blinky", "pinky", "inky", "clyde"];
ghostImages.forEach((img, index) => {
    img.src = `${imageBasePath}ghosts/${ghostNames[index]}.png`;
});
blueGhostImage.src = `${imageBasePath}ghosts/blue_ghost.png`;
appleImage.src = `${imageBasePath}other/apple.png`;
dotImage.src = `${imageBasePath}other/dot.png`;
strawberryImage.src = `${imageBasePath}other/strawberry.png`;

// --- Game Classes ---
abstract class GameObject {
    x: number;
    y: number;
    tileX: number;
    tileY: number;

    constructor(tileX: number, tileY: number) {
        this.tileX = tileX;
        this.tileY = tileY;
        this.x = tileX * TILE_SIZE;
        this.y = tileY * TILE_SIZE;
    }

    abstract draw(ctx: CanvasRenderingContext2D): void;
}

abstract class MovingObject extends GameObject {
    abstract changeDirection(newDirection: Direction): void;
    abstract move(deltaTime: number): void;
}

class Food extends GameObject {
    score: number;
    image: HTMLImageElement;

    constructor(
        tileX: number,
        tileY: number,
        image: HTMLImageElement,
        score: number
    ) {
        super(tileX, tileY);
        this.score = score;
        this.image = image;
    }

    draw(ctx: CanvasRenderingContext2D) {
        const imageSize = TILE_SIZE * IMAGE_SCALE;
        const offsetX = (TILE_SIZE - imageSize) / 2;
        const offsetY = (TILE_SIZE - imageSize) / 2;
        ctx.drawImage(
            this.image,
            this.x + offsetX,
            this.y + offsetY,
            imageSize,
            imageSize
        );
    }
}

class Pacman extends MovingObject {
    speed: number = PACMAN_SPEED;
    frameRate: number = PACMAN_IMAGE_CHANGE_RATE;
    currentImageIndex: number = 0;
    direction: Direction;

    constructor(tileX: number, tileY: number, direction: Direction) {
        super(tileX, tileY);
        this.direction = direction;
        this.direction = direction;
    }

    draw(ctx: CanvasRenderingContext2D) {
        const currentImage =
            pacmanImages[this.direction][Math.floor(this.currentImageIndex)]; // Get the current image based on direction and frame
        const imageSize = TILE_SIZE * IMAGE_SCALE;
        const offsetX = (TILE_SIZE - imageSize) / 2;
        const offsetY = (TILE_SIZE - imageSize) / 2;
        ctx.drawImage(
            currentImage!,
            this.x + offsetX,
            this.y + offsetY,
            imageSize,
            imageSize
        );
    }

    changeDirection(newDirection: Direction) {
        this.direction = newDirection;
    }

    move(deltaTime: number) {
        // Save old position
        const oldX = this.x;
        const oldY = this.y;

        // move in pixels
        switch (this.direction) {
            case "left":
                this.x -= this.speed * deltaTime;
                break;
            case "right":
                this.x += this.speed * deltaTime;
                break;
            case "up":
                this.y -= this.speed * deltaTime;
                break;
            case "down":
                this.y += this.speed * deltaTime;
                break;
        }

        // Keep entity aligned on the axis perpendicular to movement
        if (this.direction === "left" || this.direction === "right") {
            // Align to tile rows when moving horizontally
            this.y = Math.round(this.y / TILE_SIZE) * TILE_SIZE;
        } else {
            // Align to tile columns when moving vertically
            this.x = Math.round(this.x / TILE_SIZE) * TILE_SIZE;
        }

        // update tile position
        this.tileX = Math.round(this.x / TILE_SIZE);
        this.tileY = Math.round(this.y / TILE_SIZE);

        // Change image
        this.currentImageIndex =
            (this.currentImageIndex + this.frameRate * deltaTime) %
            pacmanImages[this.direction].length;
    }
}

class Ghost extends MovingObject {
    speed: number = GHOST_SPEED;
    imageIndex: number;
    direction: Direction;

    constructor(
        tileX: number,
        tileY: number,
        direction: Direction,
        imageIndex: number
    ) {
        super(tileX, tileY);
        this.direction = direction;
        this.imageIndex = imageIndex;
    }

    draw(ctx: CanvasRenderingContext2D) {
        const currentImage = ghostImages[this.imageIndex];
        const imageSize = TILE_SIZE * IMAGE_SCALE;
        const offsetX = (TILE_SIZE - imageSize) / 2;
        const offsetY = (TILE_SIZE - imageSize) / 2;
        ctx.drawImage(
            currentImage!,
            this.x + offsetX,
            this.y + offsetY,
            imageSize,
            imageSize
        );
    }

    changeDirection(newDirection: Direction) {
        this.direction = newDirection;
    }

    move(deltaTime: number) {
        // move in pixels
        switch (this.direction) {
            case "left":
                this.x -= this.speed * deltaTime;
                break;
            case "right":
                this.x += this.speed * deltaTime;
                break;
            case "up":
                this.y -= this.speed * deltaTime;
                break;
            case "down":
                this.y += this.speed * deltaTime;
                break;
        }

        // Keep entity aligned on the axis perpendicular to movement
        if (this.direction === "left" || this.direction === "right") {
            // Align to tile rows when moving horizontally
            this.y = Math.round(this.y / TILE_SIZE) * TILE_SIZE;
        } else {
            // Align to tile columns when moving vertically
            this.x = Math.round(this.x / TILE_SIZE) * TILE_SIZE;
        }

        // update tile position
        this.tileX = Math.round(this.x / TILE_SIZE);
        this.tileY = Math.round(this.y / TILE_SIZE);
    }
}

// --- Utility Functions ---
function isWallCollision(
    entity: MovingObject,
    map: Map,
    direction: Direction
): boolean {
    // Calculate the position after moving
    let nextX = entity.x;
    let nextY = entity.y;
    const moveDistance = 1; // Check one pixel ahead

    switch (direction) {
        case "left":
            nextX -= moveDistance;
            break;
        case "right":
            nextX += moveDistance;
            break;
        case "up":
            nextY -= moveDistance;
            break;
        case "down":
            nextY += moveDistance;
            break;
    }

    // Calculate which tiles we need to check (check corners and center)
    const tilesToCheck = [
        // Top-left corner
        { x: Math.floor(nextX / TILE_SIZE), y: Math.floor(nextY / TILE_SIZE) },
        // Top-right corner
        {
            x: Math.floor((nextX + TILE_SIZE - 1) / TILE_SIZE),
            y: Math.floor(nextY / TILE_SIZE),
        },
        // Bottom-left corner
        {
            x: Math.floor(nextX / TILE_SIZE),
            y: Math.floor((nextY + TILE_SIZE - 1) / TILE_SIZE),
        },
        // Bottom-right corner
        {
            x: Math.floor((nextX + TILE_SIZE - 1) / TILE_SIZE),
            y: Math.floor((nextY + TILE_SIZE - 1) / TILE_SIZE),
        },
    ];

    // Check if any of the corners would be in a wall
    for (const tile of tilesToCheck) {
        // Check bounds
        if (tile.y < 0 || tile.y >= map.length || tile.x < 0) {
            return true; // Out of bounds is treated as wall
        }
        const row = map[tile.y];
        if (!row || tile.x >= row.length) {
            return true; // Out of bounds is treated as wall
        }
        if (row[tile.x] === 1) {
            return true; // Hit a wall
        }
    }

    return false;
}

function isEntityCollision(entity: MovingObject, other: MovingObject): boolean {
    // Use distance-based collision for more accurate detection
    const dx = entity.x - other.x;
    const dy = entity.y - other.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < TILE_SIZE * 0.8; // Allow some overlap tolerance
}

// --- Map Definitions ---
// 0 = path with dot, 1 = wall, 2 = empty path, 3 = power pellet, 4 = special food
const level1_map: Map = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1],
    [1, 3, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 3, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1],
    [1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1],
    [1, 1, 1, 1, 0, 1, 0, 1, 1, 2, 2, 2, 2, 2, 2, 1, 1, 0, 1, 0, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 0, 1, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 1, 0, 1, 1, 1, 1],
    [1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1],
    [1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1],
    [1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1],
    [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
    [1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

// --- Game State ---
let currentMap = level1_map;
let pacman: Pacman;
let ghosts: Ghost[] = [];
let foods: Food[] = [];
let score = 0;
let lives = 3;
let gameOver = false;
let gameWon = false;
let powerMode = false;
let powerModeTimer = 0;
const POWER_MODE_DURATION = 10; // seconds

// --- Map Functions ---
function drawMap(ctx: CanvasRenderingContext2D, map: Map) {
    for (let y = 0; y < map.length; y++) {
        const row = map[y];
        if (!row) continue;
        for (let x = 0; x < row.length; x++) {
            const tile = row[x];

            if (tile === 1) {
                // Draw wall
                ctx.fillStyle = "#2121DE";
                ctx.fillRect(
                    x * TILE_SIZE,
                    y * TILE_SIZE,
                    TILE_SIZE,
                    TILE_SIZE
                );
                ctx.strokeStyle = "#1A1A9E";
                ctx.lineWidth = 2;
                ctx.strokeRect(
                    x * TILE_SIZE + 1,
                    y * TILE_SIZE + 1,
                    TILE_SIZE - 2,
                    TILE_SIZE - 2
                );
            }
        }
    }
}

function initializeFood(map: Map) {
    foods = [];
    for (let y = 0; y < map.length; y++) {
        const row = map[y];
        if (!row) continue;
        for (let x = 0; x < row.length; x++) {
            const tile = row[x];
            if (tile === 0) {
                // Regular dot
                foods.push(new Food(x, y, dotImage, 10));
            } else if (tile === 3) {
                // Power pellet
                foods.push(new Food(x, y, appleImage, 50));
            } else if (tile === 4) {
                // Special fruit
                foods.push(new Food(x, y, strawberryImage, 100));
            }
        }
    }
}

// --- Ghost AI ---
function getRandomDirection(): Direction {
    const directions: Direction[] = ["left", "right", "up", "down"];
    return directions[Math.floor(Math.random() * directions.length)]!;
}

function updateGhostDirection(ghost: Ghost, map: Map) {
    // Simple AI: Change direction randomly when hitting a wall or occasionally
    if (Math.random() < 0.02 || isWallCollision(ghost, map, ghost.direction)) {
        const possibleDirections: Direction[] = [];
        const directions: Direction[] = ["left", "right", "up", "down"];

        for (const dir of directions) {
            if (!isWallCollision(ghost, map, dir)) {
                possibleDirections.push(dir);
            }
        }

        if (possibleDirections.length > 0) {
            ghost.changeDirection(
                possibleDirections[
                    Math.floor(Math.random() * possibleDirections.length)
                ]!
            );
        }
    }
}

// --- Game Initialization ---
function initGame() {
    // Initialize Pacman
    pacman = new Pacman(12, 17, "right");

    // Initialize Ghosts
    ghosts = [
        new Ghost(10, 10, "right", 0),
        new Ghost(11, 10, "left", 1),
        new Ghost(12, 10, "right", 2),
        new Ghost(13, 10, "left", 3),
    ];

    // Initialize Food
    initializeFood(currentMap);

    // Reset game state
    score = 0;
    lives = 3;
    gameOver = false;
    gameWon = false;
    powerMode = false;
    powerModeTimer = 0;
}

// --- Input Handling ---
let nextDirection: Direction = "right";

document.addEventListener("keydown", (e) => {
    switch (e.key) {
        case "ArrowLeft":
        case "a":
            nextDirection = "left";
            break;
        case "ArrowRight":
        case "d":
            nextDirection = "right";
            break;
        case "ArrowUp":
        case "w":
            nextDirection = "up";
            break;
        case "ArrowDown":
        case "s":
            nextDirection = "down";
            break;
        case "r":
            if (gameOver || gameWon) {
                initGame();
            }
            break;
    }
});

// --- Game Loop ---
let lastTime = 0;

function checkFoodCollision() {
    for (let i = foods.length - 1; i >= 0; i--) {
        const food = foods[i];
        if (!food) continue;

        // Use both tile-based and distance-based collision for more forgiving detection
        const tileBased =
            pacman.tileX === food.tileX && pacman.tileY === food.tileY;

        // Distance-based collision (check if centers are close)
        const dx = pacman.x + TILE_SIZE / 2 - (food.x + TILE_SIZE / 2);
        const dy = pacman.y + TILE_SIZE / 2 - (food.y + TILE_SIZE / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        const distanceBased = distance < TILE_SIZE * 0.6; // Within 60% of tile size

        if (tileBased || distanceBased) {
            score += food.score;
            foods.splice(i, 1);

            // Check if it was a power pellet
            if (food.score === 50) {
                powerMode = true;
                powerModeTimer = POWER_MODE_DURATION;
            }

            // Check win condition
            if (foods.length === 0) {
                gameWon = true;
            }
        }
    }
}

function checkGhostCollision() {
    for (const ghost of ghosts) {
        if (isEntityCollision(pacman, ghost)) {
            if (powerMode) {
                // Eat ghost - respawn it at center
                ghost.tileX = 11 + Math.floor(Math.random() * 2);
                ghost.tileY = 10;
                ghost.x = ghost.tileX * TILE_SIZE;
                ghost.y = ghost.tileY * TILE_SIZE;
                score += 200;
            } else {
                // Lose a life
                lives--;
                if (lives <= 0) {
                    gameOver = true;
                } else {
                    // Reset positions
                    pacman.tileX = 12;
                    pacman.tileY = 17;
                    pacman.x = pacman.tileX * TILE_SIZE;
                    pacman.y = pacman.tileY * TILE_SIZE;
                }
            }
        }
    }
}

function drawUI(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "white";
    ctx.font = "24px Arial";
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`Lives: ${lives}`, 10, 60);

    if (powerMode) {
        ctx.fillStyle = "yellow";
        ctx.fillText(
            `POWER MODE: ${powerModeTimer.toFixed(1)}s`,
            canvas.width - 250,
            30
        );
    }

    if (gameOver) {
        ctx.fillStyle = "red";
        ctx.font = "48px Arial";
        ctx.fillText("GAME OVER", canvas.width / 2 - 150, canvas.height / 2);
        ctx.font = "24px Arial";
        ctx.fillText(
            "Press R to Restart",
            canvas.width / 2 - 100,
            canvas.height / 2 + 40
        );
    }

    if (gameWon) {
        ctx.fillStyle = "gold";
        ctx.font = "48px Arial";
        ctx.fillText("YOU WIN!", canvas.width / 2 - 120, canvas.height / 2);
        ctx.font = "24px Arial";
        ctx.fillText(
            "Press R to Restart",
            canvas.width / 2 - 100,
            canvas.height / 2 + 40
        );
    }
}

function gameLoop(currentTime: number) {
    if (!ctx) return;

    const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
    lastTime = currentTime;

    // Clear canvas
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw map
    drawMap(ctx, currentMap);

    // Draw food
    for (const food of foods) {
        food.draw(ctx);
    }

    if (!gameOver && !gameWon) {
        // Update power mode timer
        if (powerMode) {
            powerModeTimer -= deltaTime;
            if (powerModeTimer <= 0) {
                powerMode = false;
                powerModeTimer = 0;
            }
        }

        // Try to change Pacman's direction
        if (!isWallCollision(pacman, currentMap, nextDirection)) {
            pacman.changeDirection(nextDirection);
        }

        // Move Pacman if not hitting a wall
        if (!isWallCollision(pacman, currentMap, pacman.direction)) {
            pacman.move(deltaTime);
        }

        // Update and move ghosts
        for (const ghost of ghosts) {
            updateGhostDirection(ghost, currentMap);
            if (!isWallCollision(ghost, currentMap, ghost.direction)) {
                ghost.move(deltaTime);
            }
        }

        // Check collisions
        checkFoodCollision();
        checkGhostCollision();
    }

    // Draw Pacman
    pacman.draw(ctx);

    // Draw ghosts
    for (const ghost of ghosts) {
        const imageSize = TILE_SIZE * IMAGE_SCALE;
        const offsetX = (TILE_SIZE - imageSize) / 2;
        const offsetY = (TILE_SIZE - imageSize) / 2;
        if (powerMode) {
            ctx.drawImage(
                blueGhostImage,
                ghost.x + offsetX,
                ghost.y + offsetY,
                imageSize,
                imageSize
            );
        } else {
            ghost.draw(ctx);
        }
    }

    // Draw UI
    drawUI(ctx);

    requestAnimationFrame(gameLoop);
}

// --- Image Loading ---
let imagesLoaded = 0;
const totalImages =
    pacmanImages.left.length +
    pacmanImages.right.length +
    pacmanImages.up.length +
    pacmanImages.down.length +
    ghostImages.length +
    4; // blueGhost, apple, dot, strawberry

function imageLoaded() {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
        // All images loaded, start game
        initGame();
        requestAnimationFrame(gameLoop);
    }
}

// Add load listeners to all images
pacmanImages.left.forEach((img) => (img.onload = imageLoaded));
pacmanImages.right.forEach((img) => (img.onload = imageLoaded));
pacmanImages.up.forEach((img) => (img.onload = imageLoaded));
pacmanImages.down.forEach((img) => (img.onload = imageLoaded));
ghostImages.forEach((img) => (img.onload = imageLoaded));
blueGhostImage.onload = imageLoaded;
appleImage.onload = imageLoaded;
dotImage.onload = imageLoaded;
strawberryImage.onload = imageLoaded;

// Add error handlers
const handleImageError = (e: string | Event) => {
    if (typeof e !== "string") {
        console.error(
            "Failed to load image:",
            (e.target as HTMLImageElement).src
        );
    }
};
pacmanImages.left.forEach((img) => (img.onerror = handleImageError));
pacmanImages.right.forEach((img) => (img.onerror = handleImageError));
pacmanImages.up.forEach((img) => (img.onerror = handleImageError));
pacmanImages.down.forEach((img) => (img.onerror = handleImageError));
ghostImages.forEach((img) => (img.onerror = handleImageError));
blueGhostImage.onerror = handleImageError;
appleImage.onerror = handleImageError;
dotImage.onerror = handleImageError;
strawberryImage.onerror = handleImageError;
