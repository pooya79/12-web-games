import { drawTile, getTileInfo } from "../tiles";

interface Position {
    x: number;
    y: number;
    rotation: number;
}

type Path = Position[];

export abstract class Enemy {
    speed: number = 50; // 50 pixels per second

    constructor(
        public health: number,
        public position: Position,
        public path: Path
    ) {
        this.health = health;
        this.position = position;
        this.path = path;
    }
    abstract takeDamage(amount: number): void;
    abstract getPosition(): Position;
    abstract move(deltaTime: number): void;
    abstract draw(ctx: CanvasRenderingContext2D, deltaTime: number): void;
}

type soldierTypes = "infantry" | "medic" | "engineer" | "sniper";

export class Soldier extends Enemy {
    soldierType: soldierTypes;
    tileName!: string;

    constructor(
        health: number,
        position: Position,
        path: Path,
        soldierType: soldierTypes
    ) {
        super(health, position, path);
        this.soldierType = soldierType;
        if (soldierType === "infantry") {
            this.tileName = "tile_15_10";
        } else if (soldierType === "medic") {
            this.tileName = "tile_16_10";
        } else if (soldierType === "engineer") {
            this.tileName = "tile_17_10";
        } else if (soldierType === "sniper") {
            this.tileName = "tile_18_10";
        }
    }

    takeDamage(amount: number): void {
        this.health -= amount;
    }

    getPosition(): Position {
        return this.position;
    }

    move(deltaTime: number): void {
        let remainingDistance = this.speed * deltaTime;

        while (remainingDistance > 0 && this.path.length > 0) {
            const nextWaypoint = this.path[0]!;
            const dx = nextWaypoint.x - this.position.x;
            const dy = nextWaypoint.y - this.position.y;
            const distanceToWaypoint = Math.hypot(dx, dy);

            if (distanceToWaypoint <= remainingDistance) {
                // Reach the waypoint
                this.position.x = nextWaypoint.x;
                this.position.y = nextWaypoint.y;
                this.position.rotation = nextWaypoint.rotation;
                remainingDistance -= distanceToWaypoint;
                this.path.shift(); // Remove reached waypoint
            } else {
                // Move toward the waypoint
                const angle = Math.atan2(dy, dx);
                this.position.x += remainingDistance * Math.cos(angle);
                this.position.y += remainingDistance * Math.sin(angle);
                this.position.rotation = angle;
                remainingDistance = 0;
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D, deltaTime: number): void {
        // Implement this
    }
}

export class Tank extends Enemy {
    turretRotation: number;
    tankType: "green" | "sand";
    baseTileName!: string;
    turretTileName!: string;

    constructor(
        health: number,
        position: Position,
        turretRotation: number,
        tankType: "green" | "sand",
        path: Path
    ) {
        super(health, position, path);
        this.turretRotation = turretRotation;
        this.tankType = tankType;
        if (tankType === "green") {
            this.baseTileName = "tile_15_11";
            this.turretTileName = "tile_15_12";
        } else if (tankType === "sand") {
            this.baseTileName = "tile_15_21";
            this.turretTileName = "tile_15_22";
        }
    }

    takeDamage(amount: number): void {
        this.health -= amount;
    }

    getPosition(): Position {
        return this.position;
    }

    getTurretRotation(): number {
        return this.turretRotation;
    }

    move(deltaTime: number): void {
        let remainingDistance = this.speed * deltaTime;

        while (remainingDistance > 0 && this.path.length > 0) {
            const nextWaypoint = this.path[0]!;
            const dx = nextWaypoint.x - this.position.x;
            const dy = nextWaypoint.y - this.position.y;
            const distanceToWaypoint = Math.hypot(dx, dy);

            if (distanceToWaypoint <= remainingDistance) {
                // Reach the waypoint
                this.position.x = nextWaypoint.x;
                this.position.y = nextWaypoint.y;
                this.position.rotation = nextWaypoint.rotation;
                remainingDistance -= distanceToWaypoint;
                this.path.shift(); // Remove reached waypoint
            } else {
                // Move toward the waypoint
                const angle = Math.atan2(dy, dx);
                this.position.x += remainingDistance * Math.cos(angle);
                this.position.y += remainingDistance * Math.sin(angle);
                this.position.rotation = angle;
                remainingDistance = 0;
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D, deltaTime: number): void {
        // Implement this
    }
}
