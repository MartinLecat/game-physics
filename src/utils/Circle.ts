import Shape from "./Shape";
import Vector from "./Vector";

export type CircleOptions = {
    x: number;
    y: number;

    radius: number;
    fixed?: boolean;
    mass?: number;

    name?: string;
};

export default class Circle implements Shape {
    private position: Vector;
    private previousPosition: Vector;
    private acceleration: Vector;

    private radius: number;
    private fixed: boolean;
    private mass: number;

    private name: string;
    public id: number = Circle.CircleID++;
    public indexes?: { x: number; y: number }[];

    static CircleID: number = 0;

    constructor({ x, y, radius, fixed = false, mass = 1, name = "" }: CircleOptions) {
        this.position = new Vector(x, y);
        this.previousPosition = new Vector(x, y);
        this.acceleration = new Vector(0, 0);

        this.radius = radius;
        this.fixed = fixed;
        this.mass = mass;

        this.name = name;
    }
    /*
     * Manage fixation
     */
    setFixed(f: boolean): this {
        this.fixed = f;

        return this;
    }
    isFixed(): boolean {
        return this.fixed;
    }

    /*
     * Manage acceleration
     */
    setAcceleration(x: number, y: number): this;
    setAcceleration(v: Vector): this;
    setAcceleration(x: number | Vector, y?: number): this {
        if (typeof x === "number" && typeof y === "number") {
            this.acceleration = new Vector(x, y);
        } else {
            this.acceleration = x as Vector;
        }

        return this;
    }
    getAcceleration(): Vector {
        return this.acceleration;
    }

    /*
     * Manage position
     */
    setPosition(x: number, y: number): this;
    setPosition(v: Vector): this;
    setPosition(x: number | Vector, y?: number): this {
        if (typeof x === "number" && typeof y === "number") {
            this.position = new Vector(x, y);
        } else {
            this.position = x as Vector;
        }

        return this;
    }
    getPosition() {
        return this.position;
    }

    /*
     * Manage movement
     */
    move(x: number, y: number): this;
    move(v: Vector): this;
    move(x: number | Vector, y?: number): this {
        let v: Vector;
        if (typeof x === "number" && typeof y === "number") {
            v = new Vector(x, y);
        } else {
            v = x as Vector;
        }

        this.position = this.position.sum(v);

        return this;
    }

    /**
     * Retrieve shape occupied positions on grid
     *
     * @param {number} cellSize
     * @returns {{ minCol: number; maxCol: number; minRow: number; maxRow: number }}
     */
    getGridPosition(cellSize: number): { minCol: number; maxCol: number; minRow: number; maxRow: number } {
        return {
            minCol: Math.floor(Math.min(this.position.x + this.radius, this.position.x - this.radius) / cellSize),
            maxCol: Math.floor(Math.max(this.position.x + this.radius, this.position.x - this.radius) / cellSize),
            minRow: Math.floor(Math.min(this.position.y + this.radius, this.position.y - this.radius) / cellSize),
            maxRow: Math.floor(Math.max(this.position.y + this.radius, this.position.y - this.radius) / cellSize),
        };
    }

    /**
     * Draw shape on given canvas's context & debug informations
     *
     * @param {CanvasRenderingContext2D} context
     * @param {boolean} debug
     * @returns {this}
     */
    draw(context: CanvasRenderingContext2D, debug: boolean): this {
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

        return this;
    }

    /**
     * Update shape's position
     *
     * @param {number} dt
     * @returns {this}
     */
    update(dt: number): this {
        if (!this.fixed) {
            const velocity = this.position.sum(this.previousPosition.scale(-1));

            this.previousPosition = this.position;
            this.position = this.position
                .sum(velocity)
                .sum(this.acceleration.scale(dt ** 2))
                .sum(new Vector(0, this.mass / 9.81));
            this.acceleration = new Vector(0, 0);
        }

        return this;
    }
    getName(): "Circle" {
        return "Circle";
    }

    getRadius(): number {
        return this.radius;
    }
}
