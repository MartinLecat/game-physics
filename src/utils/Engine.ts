// Based on https://ailef.tech/2022/11/12/creating-a-2d-physics-engine-from-scratch-in-javascript/
import Shape, { isShape } from "./Shape.ts";
import Vector from "./Vector.ts";

export default class Engine {
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private shapes: Shape[];

    private timer: number = -1;
    private lastUpdate: number;

    private collisionGrid: { [key: string]: Shape[] } = {};
    private gridCellSize: number = 50;

    public static DEBUG: boolean = false;

    constructor(canvas: HTMLCanvasElement, shapes: Shape[]) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d") as CanvasRenderingContext2D;
        this.shapes = shapes;

        this.lastUpdate = Date.now();
    }

    insertShape(sh: Shape) {
        this.shapes.push(sh);
    }

    createCollisionGrid() {
        this.collisionGrid = {};
        for (let i = 0; i < this.shapes.length; i++) {
            let sh = this.shapes[i];
            // Empty shape's indexes
            sh.indexes = [];
            // Retrieve minimum and maximum rows/cols on the grid (take rotation in account)
            const { minCol, maxCol, minRow, maxRow } = sh.getGridPosition(this.gridCellSize);

            for (let x = minCol; x <= maxCol; x++) {
                for (let y = minRow; y <= maxRow; y++) {
                    // If there's no array at the position
                    if (!this.collisionGrid[`${x}_${y}`]) {
                        // Create an empty array
                        this.collisionGrid[`${x}_${y}`] = [];
                    }
                    // Push the shape in the collision grid
                    this.collisionGrid[`${x}_${y}`].push(sh);
                    // Save index in the shape
                    sh.indexes.push({ x: x, y: y });
                }
            }
        }
    }

    checkCollisions(shape1: Shape, shape2: Shape) {
        if (isShape(shape1, "Circle") && isShape(shape2, "Circle")) {
            let diff = shape1.getPosition().sum(shape2.getPosition().scale(-1));
            let dist = diff.length();

            if (dist < shape1.getRadius() + shape2.getRadius()) {
                let t = diff.scale(1 / dist);
                let delta = shape1.getRadius() + shape2.getRadius() - dist;
                if (!shape1.isFixed()) shape1.move(t.scale(delta / 2));
                if (!shape2.isFixed()) shape2.move(t.scale(-delta / 2));
            }
        } else if (isShape(shape1, "Circle") && isShape(shape2, "Rectangle")) {
            let fakeCenterY = new Vector(shape1.getPosition().x, shape2.getCenter().y);
            let diff = shape1.getPosition().sum(fakeCenterY.scale(-1));
            let dist = diff.length();
            if (dist < shape1.getRadius() + shape2.getHeight() / 2) {
                let t = diff.scale(1 / dist);
                let delta = shape1.getRadius() + shape2.getHeight() / 2 - dist;
                if (!shape1.isFixed()) shape1.move(t.scale(delta / 2));
                if (!shape2.isFixed()) shape2.move(t.scale(-delta / 2));
            }
        } else if (isShape(shape1, "Rectangle") && isShape(shape2, "Circle")) {
            this.checkCollisions(shape2, shape1);
        }
    }
    applyConstraints() {
        for (const currentShape of this.shapes) {
            if (!isShape(currentShape, "Circle")) continue;
            if (currentShape.isFixed()) continue;

            // Left
            if (currentShape.getRadius() > currentShape.getPosition().x) {
                currentShape.setAcceleration(new Vector(-currentShape.getAcceleration().x, currentShape.getAcceleration().y));
                currentShape.setPosition(currentShape.getRadius(), currentShape.getPosition().y);
            }
            // Right
            if (currentShape.getPosition().x > this.canvas.width - currentShape.getRadius()) {
                currentShape.setAcceleration(new Vector(-currentShape.getAcceleration().x, currentShape.getAcceleration().y));
                currentShape.setPosition(this.canvas.width - currentShape.getRadius(), currentShape.getPosition().y);
            }
            // Bottom
            if (currentShape.getPosition().y > this.canvas.height - currentShape.getRadius()) {
                currentShape.setAcceleration(new Vector(currentShape.getAcceleration().x, -currentShape.getAcceleration().y));
                currentShape.setPosition(currentShape.getPosition().x, this.canvas.height - currentShape.getRadius());
            }
            // Top
            if (currentShape.getPosition().y < currentShape.getRadius()) {
                currentShape.setAcceleration(new Vector(currentShape.getAcceleration().x, -currentShape.getAcceleration().y));
                currentShape.setPosition(currentShape.getPosition().x, currentShape.getRadius());
            }
        }
    }

    loop(delta: number) {
        this.applyConstraints();
        this.createCollisionGrid();
        this.draw();

        const checkHash: string[] = [];

        for (const currentShape of this.shapes) {
            currentShape.update(delta);

            if (currentShape.indexes) {
                for (const { x, y } of currentShape.indexes) {
                    for (const sh of this.collisionGrid[`${x}_${y}`]) {
                        const hash = `${currentShape.id}-${sh.id}`;
                        if (!(currentShape == sh || checkHash.includes(hash))) {
                            checkHash.push(hash);
                            this.checkCollisions(currentShape, sh);
                        }
                    }
                }
            }
        }
    }
    draw() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.strokeStyle = "black";
        for (const sh of this.shapes) {
            sh.draw(this.context, Engine.DEBUG);
        }
        if (Engine.DEBUG) {
            this.context.strokeStyle = "rgba(2, 47, 31, 0.1)";
            this.context.fillStyle = "rgba(2, 47, 31, 0.1)";
            this.context.textAlign = "center";
            this.context.textBaseline = "middle";
            this.context.font = `${this.gridCellSize}px monospace`;

            for (const [k, v] of Object.entries(this.collisionGrid)) {
                const x = Number(k.split("_")[0]);
                const y = Number(k.split("_")[1]);
                this.context.strokeRect(x * this.gridCellSize, y * this.gridCellSize, this.gridCellSize, this.gridCellSize);
                this.context.fillText(
                    v.length.toString(),
                    x * this.gridCellSize + this.gridCellSize / 2,
                    y * this.gridCellSize + this.gridCellSize / 2,
                    this.gridCellSize
                );
            }
        }
    }
    start() {
        this.lastUpdate = Date.now();
        // Prevents having two loops
        this.stop();
        // Start loop interval
        this.timer = setInterval(() => {
            let delta = (Date.now() - this.lastUpdate) / 1000;
            this.loop(delta);
            this.lastUpdate = Date.now();
        }, 0.02 * 1000);
    }
    stop() {
        clearInterval(this.timer);
    }
}
