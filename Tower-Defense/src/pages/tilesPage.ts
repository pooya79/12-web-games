import { drawTileByGrid, waitForImageLoad, getTileSize } from "../tiles";

// Tile viewer canvas
const tilesCanvas = document.getElementById("tilesCanvas") as HTMLCanvasElement;
const tilesCtx = tilesCanvas.getContext("2d")!;

// Tilesheet dimensions
const TILES_ACROSS = 23;
const TILES_DOWN = 13;
const SCALE = 1.0; // Scale down tiles to fit more on screen

// Adjust canvas size to fit all tiles
const tileSize = getTileSize();
const scaledTileSize = tileSize * SCALE;
const LABEL_HEIGHT = 20;
await waitForImageLoad();

// Draw all tiles in the tile viewer
export function drawAllTiles() {
    try {
        // Calculate and set canvas size dynamically
        const canvasWidth = 20 + TILES_ACROSS * scaledTileSize;
        const canvasHeight = 20 + TILES_DOWN * (scaledTileSize + LABEL_HEIGHT);
        tilesCanvas.width = canvasWidth;
        tilesCanvas.height = canvasHeight;

        console.log(`Canvas size set to ${canvasWidth}x${canvasHeight}`);

        // Clear canvas
        tilesCtx.clearRect(0, 0, tilesCanvas.width, tilesCanvas.height);

        // Draw all tiles with their coordinates
        for (let row = 0; row < TILES_DOWN; row++) {
            for (let col = 0; col < TILES_ACROSS; col++) {
                const x = 10 + col * scaledTileSize;
                const y = 10 + row * (scaledTileSize + LABEL_HEIGHT);

                // Draw the tile
                drawTileByGrid(tilesCtx, col, row, x, y, SCALE);

                // Draw the label
                tilesCtx.fillStyle = "#000";
                tilesCtx.font = "10px Arial";
                tilesCtx.textAlign = "center";
                const label = `(${col},${row})`;
                tilesCtx.fillText(
                    label,
                    x + scaledTileSize / 2,
                    y + scaledTileSize + 12
                );
            }
        }

        console.log(`Drew all ${TILES_ACROSS * TILES_DOWN} tiles successfully`);
    } catch (error) {
        console.error("Error loading image:", error);
    }
}
