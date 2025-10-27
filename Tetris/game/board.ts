export class Board {
    width: number = 10;
    height: number = 20;
    grid: number[][] = [];

    constructor() {
        this.reset();
    }

    reset() {
        this.grid = Array.from({ length: this.height }, () =>
            Array(this.width).fill(0)
        );
    }

    merge(piece: number[][], x: number, y: number) {
        piece.forEach((row, dy) =>
            row.forEach((val, dx) => {
                if (val) this.grid[y + dy]![x + dx] = val;
            })
        );
    }

    collides(piece: number[][], x: number, y: number): boolean {
        return piece.some((row, dy) =>
            row.some((val, dx) => {
                if (!val) return false;

                // Check boundaries
                if (x + dx < 0 || x + dx >= this.width) return true;
                if (y + dy < 0 || y + dy >= this.height) return true;

                // Check collision with existing blocks
                return this.grid[y + dy]![x + dx] !== 0;
            })
        );
    }

    clearLines(): number {
        let cleared = 0;
        this.grid = this.grid.filter((row) => {
            if (row.every((cell) => cell !== 0)) {
                cleared++;
                return false;
            }
            return true;
        });

        // Add empty rows at the top to maintain grid height
        while (this.grid.length < this.height) {
            this.grid.unshift(Array(this.width).fill(0));
        }

        return cleared;
    }
}
