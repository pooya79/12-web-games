import { Enemy } from "./enemy";
import { drawTile, getTileInfo } from "../tiles";

interface Position {
    x: number;
    y: number;
    rotation: number;
}

abstract class Tower {
    position: Position;
    range: number;
    damage: number;
    attackSpeed: number;
    lockedEnemy: Enemy | null = null;

    abstract baseTileName: string;
    abstract turretTileName: string;

    private searchForEnemyRate: number = 0.2; // 0.2 seconds
    private lastSearchTime: number = 0;

    constructor(
        position: Position,
        range: number,
        damage: number,
        attackSpeed: number,
        baseTileName: string,
        turretTileName: string
    ) {
        this.position = position;
        this.range = range;
        this.damage = damage;
        this.attackSpeed = attackSpeed;
    }

    abstract findNearestEnemy(): Enemy | null;
    abstract attack(target: Enemy): void;
    abstract draw(
        ctx: CanvasRenderingContext2D,
        deltaTime: number,
        drawTile: Function
    ): void;
}

class BasicTower extends Tower {
    baseTileName = "basic_tower_base";
    turretTileName = "basic_tower_turret";

    findNearestEnemy(): Enemy | null {
        // Implementation for finding the nearest enemy
        return null;
    }

    attack(target: Enemy): void {
        // Implementation for attacking the target enemy
    }

    draw(ctx: CanvasRenderingContext2D, deltaTime: number): void {
        // Implementation for drawing the tower
    }
}

class AdvancedTower extends Tower {
    baseTileName = "advanced_tower_base";
    turretTileName = "advanced_tower_turret";

    findNearestEnemy(): Enemy | null {
        // Implementation for finding the nearest enemy
        return null;
    }

    attack(target: Enemy): void {
        // Implementation for attacking the target enemy
    }

    draw(ctx: CanvasRenderingContext2D, deltaTime: number): void {
        // Implementation for drawing the tower
    }
}

class RocketTower extends Tower {
    baseTileName = "rocket_tower_base";
    turretTileName = "rocket_tower_turret";

    findNearestEnemy(): Enemy | null {
        // Implementation for finding the nearest enemy
        return null;
    }

    attack(target: Enemy): void {
        // Implementation for attacking the target enemy
    }

    draw(ctx: CanvasRenderingContext2D, deltaTime: number): void {
        // Implementation for drawing the tower
    }
}
