import Shape from "./Shape";
import Vector from "./Vector";

export type CircleOptions = {
    x: number;
    y: number;

    radius: number;
    fixed?: boolean;
    mass?: number;
    acceleration?: Vector;

    name?: string;
};

export default class Circle implements Shape {
    private position: Vector;
    private previousPosition: Vector;
    private acceleration: Vector;
    private baseAcceleration: Vector;

    private radius: number;
    private fixed: boolean;
    private mass: number;

    private name: string;
    public id: number = Circle.CircleID++;
    public indexes?: { x: number; y: number }[];

    static CircleID: number = 0;

    constructor({ x, y, radius, fixed = false, mass = 1, name = "", acceleration = new Vector(0, 0) }: CircleOptions) {
        this.position = new Vector(x, y);
        this.previousPosition = new Vector(x, y);
        this.acceleration = acceleration;
        this.baseAcceleration = acceleration;

        this.radius = radius;
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
            .sum(this.acceleration.scale(dt ** 2))
            .sum(new Vector(0, this.mass / 9.81));
        this.acceleration = this.baseAcceleration;
    }

    draw(context: CanvasRenderingContext2D, debug: boolean): void {
        context.strokeStyle = "black";
        context.beginPath();
        context.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
        context.stroke();

        if (debug) {
            this.position.draw(context);
            context.textAlign = "center";
            context.textBaseline = "middle";
            context.font = `${this.radius}px monospace`;
            context.fillStyle = "black";
            context.fillText(this.name, this.position.x, this.position.y, this.radius * 2);
        }
    }

    getGridPosition(cellSize: number): { minCol: number; maxCol: number; minRow: number; maxRow: number } {
        return {
            minCol: Math.floor(Math.min(this.position.x + this.radius, this.position.x - this.radius) / cellSize),
            maxCol: Math.floor(Math.max(this.position.x + this.radius, this.position.x - this.radius) / cellSize),
            minRow: Math.floor(Math.min(this.position.y + this.radius, this.position.y - this.radius) / cellSize),
            maxRow: Math.floor(Math.max(this.position.y + this.radius, this.position.y - this.radius) / cellSize),
        };
    }

    getAcceleration() {
        return this.acceleration;
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

    getRadius(): number {
        return this.radius;
    }
    getPosition() {
        return this.position;
    }
    getName(): "Circle" {
        return "Circle";
    }
}
