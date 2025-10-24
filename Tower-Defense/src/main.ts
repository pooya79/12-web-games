import { drawTileByGrid, waitForImageLoad, getTileSize } from "./tiles";
import { pageManager } from "./pageManager";

// Game canvases
const backgroundCanvas = document.getElementById(
    "backgroundCanvas"
) as HTMLCanvasElement;
const gameCanvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
const backgroundCtx = backgroundCanvas.getContext("2d")!;
const gameCtx = gameCanvas.getContext("2d")!;

// Tile viewer canvas
const tilesCanvas = document.getElementById("tilesCanvas") as HTMLCanvasElement;
const tilesCtx = tilesCanvas.getContext("2d")!;

// Tilesheet dimensions
const TILES_ACROSS = 23;
const TILES_DOWN = 13;
const SCALE = 0.5; // Scale down tiles to fit more on screen

// Adjust canvas size to fit all tiles
const tileSize = getTileSize();
const scaledTileSize = tileSize * SCALE;
const LABEL_HEIGHT = 20;

// Initialize the page system
function initPageSystem() {
    pageManager.setupNavigation();

    // Load tiles when the tiles page is shown
    pageManager.onPageChange("tiles", async () => {
        await drawAllTiles();
    });

    // Initialize game when game page is shown
    pageManager.onPageChange("game", () => {
        initGame();
    });
}

// Draw all tiles in the tile viewer
async function drawAllTiles() {
    try {
        await waitForImageLoad();

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

// Initialize the game
function initGame() {
    console.log("Game initialized!");
    // Clear game canvases
    backgroundCtx.clearRect(
        0,
        0,
        backgroundCanvas.width,
        backgroundCanvas.height
    );
    gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

    // TODO: Add your game initialization logic here
    // For now, just draw a sample background
    backgroundCtx.fillStyle = "#90EE90";
    backgroundCtx.fillRect(
        0,
        0,
        backgroundCanvas.width,
        backgroundCanvas.height
    );

    gameCtx.fillStyle = "#333";
    gameCtx.font = "48px Arial";
    gameCtx.textAlign = "center";
    gameCtx.fillText(
        "Game starts here!",
        gameCanvas.width / 2,
        gameCanvas.height / 2
    );
}

// Start the app
initPageSystem();
