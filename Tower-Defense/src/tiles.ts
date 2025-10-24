const image = new Image();
image.src = "../assets/Tilesheet/towerDefense_tilesheet.png";
let imageLoaded = false;

// Tilesheet grid configuration
const TILE_COLS = 23;
const TILE_ROWS = 13;
const tileSize = 64;

// List all available tiles as literal keys for IntelliSense
// Generate tile names: tile_0_0, tile_0_1, ..., tile_22_12
const generateTileNames = (): string[] => {
    const names: string[] = [];
    for (let row = 0; row < TILE_ROWS; row++) {
        for (let col = 0; col < TILE_COLS; col++) {
            names.push(`tile_${col}_${row}`);
        }
    }
    return names;
};

export const tileNames = generateTileNames();
export type TileName = string;

// Mapping from tile name to its position in the tilesheet
interface TileInfo {
    x: number;
    y: number;
    size: number;
}

// Generate tile map programmatically based on grid position
const generateTileMap = (): Record<string, TileInfo> => {
    const map: Record<string, TileInfo> = {};
    for (let row = 0; row < TILE_ROWS; row++) {
        for (let col = 0; col < TILE_COLS; col++) {
            const tileName = `tile_${col}_${row}`;
            map[tileName] = {
                x: col * tileSize,
                y: row * tileSize,
                size: tileSize,
            };
        }
    }
    return map;
};

const tileMap = generateTileMap();

// Draws one tile from the shared tilesheet
export function drawTile(
    name: TileName,
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number
): void {
    if (!imageLoaded) {
        console.warn("Image not loaded yet, cannot draw tile");
        return;
    }
    const t = tileMap[name];
    if (!t) {
        console.warn(`Tile "${name}" not found in tileMap`);
        return;
    }
    ctx.drawImage(
        image,
        t.x,
        t.y,
        t.size,
        t.size, // crop
        x,
        y,
        t.size,
        t.size // draw position
    );
}

// Export the image loading promise for waiting
export function waitForImageLoad(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (imageLoaded) {
            resolve();
        } else {
            image.onload = () => {
                imageLoaded = true;
                console.log("Tilesheet loaded successfully");
                resolve();
            };
            image.onerror = () => {
                console.error("Failed to load tilesheet image");
                reject(new Error("Failed to load tilesheet"));
            };
        }
    });
}

// Optional helper if you need raw info
export function getTileInfo(name: TileName): TileInfo {
    const info = tileMap[name];
    if (!info) {
        throw new Error(`Tile "${name}" not found in tileMap`);
    }
    return info;
}

// Draw a tile by its grid position in the tilesheet (0-indexed)
export function drawTileByGrid(
    ctx: CanvasRenderingContext2D,
    gridX: number,
    gridY: number,
    canvasX: number,
    canvasY: number,
    scale: number = 1
): void {
    if (!imageLoaded) {
        console.warn("Image not loaded yet, cannot draw tile");
        return;
    }
    const sourceX = gridX * tileSize;
    const sourceY = gridY * tileSize;
    const drawSize = tileSize * scale;

    ctx.drawImage(
        image,
        sourceX,
        sourceY,
        tileSize,
        tileSize, // crop from tilesheet
        canvasX,
        canvasY,
        drawSize,
        drawSize // draw position and size
    );
}

// Get the raw image (for measuring, etc.)
export function getTilesheetImage(): HTMLImageElement {
    return image;
}

// Get tile size constant
export function getTileSize(): number {
    return tileSize;
}
