import { Board } from "./board";
import { Piece } from "./piece";

const COLORS = [
    "#000000", // 0 - empty
    "cyan", // 1
    "yellow", // 2
    "purple", // 3
    "orange", // 4
    "blue", // 5
    "green", // 6
    "red", // 7
];

export class Game {
    board = new Board();
    piece = new Piece();
    nextPiece = new Piece();
    ctx: CanvasRenderingContext2D;
    nextPieceCtx: CanvasRenderingContext2D | null = null;
    dropCounter = 0;
    dropInterval = 800;
    lastTime = 0;
    score = 0;
    lines = 0;
    level = 1;
    gameOver = false;

    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;

        // Get next piece canvas
        const nextPieceCanvas = document.getElementById(
            "nextPieceCanvas"
        ) as HTMLCanvasElement;
        if (nextPieceCanvas) {
            this.nextPieceCtx = nextPieceCanvas.getContext("2d");
        }

        this.loop = this.loop.bind(this);
        document.addEventListener("keydown", (e) => this.handleInput(e));
        this.updateUI();
        requestAnimationFrame(this.loop);
    }

    handleInput(e: KeyboardEvent) {
        if (this.gameOver) return;
        if (e.key === "ArrowLeft") this.move(-1);
        else if (e.key === "ArrowRight") this.move(1);
        else if (e.key === "ArrowUp") this.rotate();
        else if (e.key === "ArrowDown") this.drop();
        else if (e.key === " ") {
            e.preventDefault();
            this.hardDrop();
        }
    }

    updateUI() {
        const scoreEl = document.getElementById("score");
        const linesEl = document.getElementById("lines");
        const levelEl = document.getElementById("level");

        if (scoreEl) scoreEl.textContent = this.score.toString();
        if (linesEl) linesEl.textContent = this.lines.toString();
        if (levelEl) levelEl.textContent = this.level.toString();
    }

    move(dir: number) {
        this.piece.x += dir;
        if (this.board.collides(this.piece.shape, this.piece.x, this.piece.y))
            this.piece.x -= dir;
    }

    rotate() {
        const old = this.piece.shape.map((r) => [...r]);
        this.piece.rotate();
        if (this.board.collides(this.piece.shape, this.piece.x, this.piece.y))
            this.piece.shape = old;
    }

    hardDrop() {
        while (
            !this.board.collides(
                this.piece.shape,
                this.piece.x,
                this.piece.y + 1
            )
        ) {
            this.piece.y++;
        }
        this.drop();
    }

    drop() {
        this.piece.y++;
        if (this.board.collides(this.piece.shape, this.piece.x, this.piece.y)) {
            this.piece.y--;
            this.board.merge(this.piece.shape, this.piece.x, this.piece.y);
            const linesCleared = this.board.clearLines();

            if (linesCleared > 0) {
                this.lines += linesCleared;
                this.score += linesCleared * 100 * this.level;

                // Level up every 10 lines
                this.level = Math.floor(this.lines / 10) + 1;
                this.dropInterval = Math.max(100, 800 - (this.level - 1) * 50);

                this.updateUI();
            }

            this.piece = this.nextPiece;
            this.nextPiece = new Piece();

            // Check game over
            if (
                this.board.collides(
                    this.piece.shape,
                    this.piece.x,
                    this.piece.y
                )
            ) {
                this.gameOver = true;
            }
        }
        this.dropCounter = 0;
    }

    loop(time: number) {
        const delta = time - this.lastTime;
        this.lastTime = time;

        if (!this.gameOver) {
            this.dropCounter += delta;
            if (this.dropCounter > this.dropInterval) this.drop();
        }

        this.draw();
        requestAnimationFrame(this.loop);
    }

    draw() {
        const { ctx, board, piece } = this;
        ctx.fillStyle = "#1a202c";
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        const scale = 20;

        // Draw board grid
        ctx.strokeStyle = "#2d3748";
        ctx.lineWidth = 0.5;
        for (let y = 0; y < this.board.height; y++) {
            for (let x = 0; x < this.board.width; x++) {
                ctx.strokeRect(x * scale, y * scale, scale, scale);
            }
        }

        // Draw board pieces
        board.grid.forEach((row, y) =>
            row.forEach((val, x) => {
                if (val) {
                    ctx.fillStyle = COLORS[val] || "gray";
                    ctx.fillRect(
                        x * scale + 1,
                        y * scale + 1,
                        scale - 2,
                        scale - 2
                    );

                    // Add shine effect
                    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
                    ctx.fillRect(
                        x * scale + 1,
                        y * scale + 1,
                        scale - 2,
                        scale / 3
                    );
                }
            })
        );

        // Draw ghost piece (shadow)
        if (!this.gameOver) {
            let ghostY = this.piece.y;
            while (
                !this.board.collides(this.piece.shape, this.piece.x, ghostY + 1)
            ) {
                ghostY++;
            }

            ctx.globalAlpha = 0.3;
            piece.shape.forEach((row, y) =>
                row.forEach((val, x) => {
                    if (val) {
                        ctx.fillStyle = piece.color;
                        ctx.fillRect(
                            (piece.x + x) * scale + 1,
                            (ghostY + y) * scale + 1,
                            scale - 2,
                            scale - 2
                        );
                    }
                })
            );
            ctx.globalAlpha = 1.0;
        }

        // Draw current piece
        if (!this.gameOver) {
            piece.shape.forEach((row, y) =>
                row.forEach((val, x) => {
                    if (val) {
                        ctx.fillStyle = piece.color;
                        ctx.fillRect(
                            (piece.x + x) * scale + 1,
                            (piece.y + y) * scale + 1,
                            scale - 2,
                            scale - 2
                        );

                        // Add shine effect
                        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
                        ctx.fillRect(
                            (piece.x + x) * scale + 1,
                            (piece.y + y) * scale + 1,
                            scale - 2,
                            scale / 3
                        );
                    }
                })
            );
        }

        // Draw next piece
        this.drawNextPiece();

        // Draw game over overlay
        if (this.gameOver) {
            ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.fillStyle = "white";
            ctx.font = "bold 24px Arial";
            ctx.textAlign = "center";
            ctx.fillText(
                "GAME OVER",
                ctx.canvas.width / 2,
                ctx.canvas.height / 2 - 15
            );
            ctx.font = "16px Arial";
            ctx.fillText(
                `Score: ${this.score}`,
                ctx.canvas.width / 2,
                ctx.canvas.height / 2 + 15
            );
            ctx.font = "12px Arial";
            ctx.fillText(
                "Refresh to play again",
                ctx.canvas.width / 2,
                ctx.canvas.height / 2 + 40
            );
        }
    }

    drawNextPiece() {
        if (!this.nextPieceCtx) return;

        const ctx = this.nextPieceCtx;
        const canvas = ctx.canvas;

        // Clear canvas
        ctx.fillStyle = "#1a202c";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Calculate center position
        const scale = 15;
        const pieceWidth = this.nextPiece.shape[0]!.length;
        const pieceHeight = this.nextPiece.shape.length;
        const offsetX = (canvas.width - pieceWidth * scale) / 2;
        const offsetY = (canvas.height - pieceHeight * scale) / 2;

        // Draw next piece
        this.nextPiece.shape.forEach((row, y) =>
            row.forEach((val, x) => {
                if (val) {
                    ctx.fillStyle = this.nextPiece.color;
                    ctx.fillRect(
                        offsetX + x * scale + 1,
                        offsetY + y * scale + 1,
                        scale - 2,
                        scale - 2
                    );

                    // Add shine effect
                    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
                    ctx.fillRect(
                        offsetX + x * scale + 1,
                        offsetY + y * scale + 1,
                        scale - 2,
                        scale / 3
                    );
                }
            })
        );
    }
}
