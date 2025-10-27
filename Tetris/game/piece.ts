const SHAPES = {
    I: { shape: [[1, 1, 1, 1]], color: "cyan" },
    O: {
        shape: [
            [2, 2],
            [2, 2],
        ],
        color: "yellow",
    },
    T: {
        shape: [
            [0, 3, 0],
            [3, 3, 3],
        ],
        color: "purple",
    },
    L: {
        shape: [
            [4, 0],
            [4, 0],
            [4, 4],
        ],
        color: "orange",
    },
    J: {
        shape: [
            [0, 5],
            [0, 5],
            [5, 5],
        ],
        color: "blue",
    },
    S: {
        shape: [
            [0, 6, 6],
            [6, 6, 0],
        ],
        color: "green",
    },
    Z: {
        shape: [
            [7, 7, 0],
            [0, 7, 7],
        ],
        color: "red",
    },
};

export class Piece {
    shape: number[][];
    color: string;
    x = 3;
    y = 0;

    constructor() {
        const keys = Object.keys(SHAPES);
        const key = keys[
            Math.floor(Math.random() * keys.length)
        ] as keyof typeof SHAPES;
        const selected = SHAPES[key];
        this.shape = selected.shape.map((r) => [...r]);
        this.color = selected.color;
    }

    rotate() {
        this.shape = this.shape[0]!.map((_, i) =>
            this.shape.map((r) => r[i]!).reverse()
        ) as number[][];
    }
}
