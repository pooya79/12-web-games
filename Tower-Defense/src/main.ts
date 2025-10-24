import { pageManager } from "./pageManager";
import { drawAllTiles } from "./pages/tilesPage";

// Game canvases
const backgroundCanvas = document.getElementById(
    "backgroundCanvas"
) as HTMLCanvasElement;
const gameCanvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
const backgroundCtx = backgroundCanvas.getContext("2d")!;
const gameCtx = gameCanvas.getContext("2d")!;


// Initialize the page system
function initPageSystem() {
    pageManager.setupNavigation();

    // Load tiles when the tiles page is shown
    pageManager.onPageEnter("tiles", () => {
        drawAllTiles();
    });

    // Initialize game when game page is shown
    pageManager.onPageEnter("game", () => {
        initGame();
    });

    // Clean up when exiting game page
    pageManager.onPageExit("game", () => {
        console.log("Exiting game page - cleaning up...");
        // TODO: Pause game, clear intervals, etc.
    });

    // Example: Clean up when exiting tiles page
    pageManager.onPageExit("tiles", () => {
        console.log("Exiting tiles viewer");
    });
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
