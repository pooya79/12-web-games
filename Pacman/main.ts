const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");

// --- Types ---
type Direction = "left" | "right" | "up" | "down";
type Map = number[][];

// --- Constants ---
const PACMAN_SPEED = 16; // pixels per second
const PACMAN_IMAGE_CHANGE_RATE = 1; // frames per second
const GHOST_SPEED = 12; // pixels per second
const TILE_SIZE = 32; // pixels

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
    img.src = `${imageBasePath}ghost/${ghostNames[index]}.png`;
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
        ctx.drawImage(this.image, this.x, this.y);
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
        ctx.drawImage(currentImage!, this.x, this.y);
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

        // update tile position
        this.tileX = Math.floor(this.x / TILE_SIZE);
        this.tileY = Math.floor(this.y / TILE_SIZE);

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
        ctx.drawImage(currentImage!, this.x, this.y);
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

        // update tile position
        this.tileX = Math.floor(this.x / TILE_SIZE);
        this.tileY = Math.floor(this.y / TILE_SIZE);
    }
}

// --- Utility Functions ---
function isWallCollision(
    entity: MovingObject,
    map: Map,
    direction: Direction
): boolean {
    const nextTileX =
        entity.tileX +
        (direction === "right" ? 1 : direction === "left" ? -1 : 0);
    const nextTileY =
        entity.tileY + (direction === "down" ? 1 : direction === "up" ? -1 : 0);

    // Check if the next tile is a wall
    return map[nextTileY] && map[nextTileY][nextTileX] === 1;
}

function isEntityCollision(entity: MovingObject, other: MovingObject): boolean {
    return entity.tileX === other.tileX && entity.tileY === other.tileY;
}


