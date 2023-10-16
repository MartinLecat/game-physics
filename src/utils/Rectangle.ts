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
    private previousPosition: Vector;
    private acceleration: Vector;

    private topLeft: Vector;
    private topRight: Vector;
    private bottomLeft: Vector;
    private bottomRight: Vector;

    private width: number;
    private height: number;
    private fixed: boolean;
    private mass: number;

    private name: string;
    public id: number = Rectangle.RectangleID++;

    static RectangleID: number = 0;

    constructor({ x, y, width, height, fixed = false, mass = 1, name = "" }: RectangleOptions) {
        this.previousPosition = new Vector(x, y);
        this.acceleration = new Vector(0, 0);

        this.topLeft = new Vector(x, y);
        this.topRight = new Vector(x + width, y);
        this.bottomLeft = new Vector(x, y + height);
        this.bottomRight = new Vector(x + width, y + height);

        this.width = width;
        this.height = height;
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
     * Manage Position
     */
    setPosition(x: number, y: number): this;
    setPosition(v: Vector): this;
    setPosition(x: number | Vector, y?: number): this {
        let v: Vector;
        if (typeof x === "number" && typeof y === "number") {
            v = new Vector(x, y);
        } else {
            v = x as Vector;
        }

        return this;
    }
    getPosition() {
        return this.topLeft;
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

        this.topLeft = this.topLeft.sum(v);
        this.topRight = this.topRight.sum(v);
        this.bottomLeft = this.bottomLeft.sum(v);
        this.bottomRight = this.bottomRight.sum(v);

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
            minCol: Math.floor(Math.min(this.topLeft.x, this.topRight.x) / cellSize),
            maxCol: Math.floor(Math.max(this.topLeft.x, this.topRight.x) / cellSize),
            minRow: Math.floor(Math.min(this.bottomLeft.y, this.bottomRight.y) / cellSize),
            maxRow: Math.floor(Math.max(this.bottomLeft.y, this.bottomRight.y) / cellSize),
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
        context.strokeRect(this.topLeft.x, this.topLeft.y, this.width, this.height);
        if (debug) {
            this.topLeft.draw(context);
            this.topRight.draw(context);
            this.bottomLeft.draw(context);
            this.bottomRight.draw(context);
            context.textAlign = "center";
            context.textBaseline = "middle";
            context.font = `${this.height}px monospace`;
            context.fillStyle = "black";
            context.fillText(this.name, this.getCenter().x, this.getCenter().y, this.width);
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
            const velocity = this.getCenter().sum(this.previousPosition.scale(-1));

            this.previousPosition = this.getCenter();
            let f = new Vector(0, this.mass / 9.81).sum(velocity).sum(this.acceleration.scale(dt ** 2));

            this.topLeft = this.topLeft.sum(f);
            this.topRight = this.topRight.sum(f);
            this.bottomLeft = this.bottomLeft.sum(f);
            this.bottomRight = this.bottomRight.sum(f);

            this.acceleration = new Vector(0, 0);
        }

        return this;
    }
    getName(): "Rectangle" {
        return "Rectangle";
    }

    getCenter() {
        return this.bottomRight.sum(this.topLeft).scale(0.5);
    }
    getWidth() {
        return this.width;
    }
    getHeight() {
        return this.height;
    }
}
