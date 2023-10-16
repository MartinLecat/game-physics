import Shape from "./Shape";
import Vector from "./Vector";

export type RectangleOptions = {
    x: number;
    y: number;

    width: number;
    height: number;
    fixed?: boolean;
    mass?: number;

    name?: string;
};

export default class Rectangle implements Shape {
    private position: Vector;
    private previousPosition: Vector;
    private acceleration: Vector;

    private width: number;
    private height: number;
    private fixed: boolean;
    private mass: number;

    private name: string;
    public id: number = Rectangle.RectangleID++;

    static RectangleID: number = 0;

    constructor({ x, y, width, height, fixed = false, mass = 1, name = "" }: RectangleOptions) {
        this.position = new Vector(x, y);
        this.previousPosition = new Vector(x, y);
        this.acceleration = new Vector(0, 0);

        this.width = width;
        this.height = height;
        this.fixed = fixed;
        this.mass = mass;

        this.name = name;
    }

    update(dt: number) {
        if (this.fixed) return;

        const velocity = this.position.sum(this.previousPosition.scale(-1));

        this.previousPosition = this.position;
        this.position = this.position
            .sum(velocity)
            .sum(this.acceleration.scale(dt * dt))
            .sum(new Vector(0, this.mass / 9.81));
        this.acceleration = new Vector(0, 0);
    }
    draw(context: CanvasRenderingContext2D, debug: boolean): void {
        context.strokeStyle = "black";
        context.strokeRect(this.position.x, this.position.y, this.width, this.height);
        if (debug) {
            this.position.draw(context);
            context.textAlign = "center";
            context.textBaseline = "middle";
            context.font = `${this.height}px monospace`;
            context.fillStyle = "black";
            context.fillText(this.name, this.getCenter().x, this.getCenter().y, this.width);
        }
    }
    getGridPosition(cellSize: number): { minCol: number; maxCol: number; minRow: number; maxRow: number } {
        return {
            minCol: Math.floor(Math.min(this.position.x + this.width, this.position.x) / cellSize),
            maxCol: Math.floor(Math.max(this.position.x + this.width, this.position.x) / cellSize),
            minRow: Math.floor(Math.min(this.position.y + this.height, this.position.y) / cellSize),
            maxRow: Math.floor(Math.max(this.position.y + this.height, this.position.y) / cellSize),
        };
    }

    getCenter() {
        return new Vector(this.position.x + this.width, this.position.y + this.height).sum(this.position).scale(0.5);
    }

    setAcceleration(x: number, y: number): void;
    setAcceleration(v: Vector): void;
    setAcceleration(x: number | Vector, y?: number): void {
        if (typeof x === "number" && typeof y === "number") {
            this.acceleration = new Vector(x, y);
        } else {
            this.acceleration = x as Vector;
        }
    }
    setPosition(x: number, y: number): void;
    setPosition(v: Vector): void;
    setPosition(x: number | Vector, y?: number): void {
        if (typeof x === "number" && typeof y === "number") {
            this.position = new Vector(x, y);
        } else {
            this.position = x as Vector;
        }
    }

    setFixed(f: boolean): void {
        this.fixed = f;
    }
    isFixed(): boolean {
        return this.fixed;
    }

    getWidth() {
        return this.width;
    }
    getHeight() {
        return this.height;
    }
    getPosition() {
        return this.position;
    }
    getName(): "Rectangle" {
        return "Rectangle";
    }
}
