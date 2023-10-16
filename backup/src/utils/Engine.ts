import Shape from "./Shape";
import Vector from "./Vector";

/**
 * Physic Engine, with physics.
 *
 * @export
 * @class Engine
 * @typedef {Engine}
 */
export default class Engine {
    /**
     * Canvas element bound to the engine
     *
     * @public
     * @type {HTMLCanvasElement}
     */
    public canvas: HTMLCanvasElement;
    /**
     * 2D Context of engine's canvas
     *
     * @public
     * @type {CanvasRenderingContext2D}
     */
    public context: CanvasRenderingContext2D;

    /**
     * Time in seconds between two new frame
     *
     * @public
     * @type {number}
     */
    public deltaTime: number;
    /**
     * Description placeholder
     *
     * @public
     * @type {number}
     */
    public angularB: number;
    /**
     * Description placeholder
     *
     * @public
     * @type {number}
     */
    public b: number;
    /**
     * Interval ID of the loop
     *
     * @public
     * @type {number}
     */
    public timer: number;

    /**
     * List of shapes to take in calculation
     *
     * @public
     * @type {Shape[]}
     */
    public shapes: Shape[];

    /**
     * Object containing shapes by grid covering. Learn more {@link http://buildnewgames.com/broad-phase-collision-detection/ here}
     *
     * @public
     * @type {{ [key: string]: Shape[] }}
     */
    public collisionGrid: { [key: string]: Shape[] };
    /**
     * Size of collision grid cells. Learn more {@link http://buildnewgames.com/broad-phase-collision-detection/ here}
     *
     * @public
     * @type {number}
     */
    public gridCellSize: number;

    /**
     * Draw debug infos ?
     *
     * @static
     * @type {boolean}
     */
    static DEBUG: boolean = false;

    /**
     * Creates an instance of Engine.
     *
     * @constructor
     * @param {HTMLCanvasElement} canvas - Canvas to bind to the Engine
     * @param {Shape[]} shapes - Shapes to draw
     */
    constructor(canvas: HTMLCanvasElement, shapes: Shape[]) {
        this.canvas = canvas;
        this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;
        this.shapes = shapes;

        this.deltaTime = 0.02;
        this.angularB = -1;
        this.b = -1;

        this.timer = -1;
        this.gridCellSize = 10;
        this.collisionGrid = {};
        this.resetCollisionGrid();
    }
    /**
     * Reset collision grid and project shapes on grid
     */
    resetCollisionGrid() {
        // Empty collision data
        this.collisionGrid = {};
        for (let i = 0; i < this.shapes.length; i++) {
            let sh = this.shapes[i];
            // Empty shape's indexes
            sh.indexes = [];
            // Retrieve minimum and maximum rows/cols on the grid (take rotation in account)
            let minCol = Math.floor(Math.min(sh.topLeft.x, sh.topRight.x, sh.bottomLeft.x, sh.bottomRight.x) / this.gridCellSize);
            let maxCol = Math.floor(Math.max(sh.topLeft.x, sh.topRight.x, sh.bottomLeft.x, sh.bottomRight.x) / this.gridCellSize);
            let minRow = Math.floor(Math.min(sh.topLeft.y, sh.topRight.y, sh.bottomLeft.y, sh.bottomRight.y) / this.gridCellSize);
            let maxRow = Math.floor(Math.max(sh.topLeft.y, sh.topRight.y, sh.bottomLeft.y, sh.bottomRight.y) / this.gridCellSize);

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
    /**
     * Description placeholder
     *
     * @param {Vector[]} a
     * @param {Vector[]} b
     * @returns {Vector[]}
     */
    intersectSafe(a: Vector[], b: Vector[]): Vector[] {
        const result: Vector[] = [];

        // Copy A vector array using their string representation
        const aPositions = a.map((v) => v.toString());
        // Copy B vector array using their string representation
        const bPositions = b.map((v) => v.toString());

        for (const k in aPositions) {
            if (bPositions.includes(aPositions[k])) {
                // Save each A vector included in B
                result.push(a[k]);
            }
        }

        return result;
    }

    /**
     * Description placeholder
     *
     * @param {Shape} shape1
     * @param {Shape} shape2
     * @returns {(Vector | false)}
     */
    checkCollision(shape1: Shape, shape2: Shape): Vector | false {
        let testVectors = [
            shape1.topRight.substract(shape1.topLeft),
            shape1.bottomRight.substract(shape1.topRight),
            shape2.topRight.substract(shape2.topLeft),
            shape2.bottomRight.substract(shape2.topRight),
        ];
        let shape1InvolvedVertices: Vector[][] = [];
        let shape2InvolvedVertices: Vector[][] = [];

        for (let i = 0; i < 4; i++) {
            let internalProjections: number[] = [];
            let externalProjections: number[] = [];

            shape1InvolvedVertices[i] = [];
            shape2InvolvedVertices[i] = [];

            // Retrieve projections
            for (let j = 0; j < 4; j++) {
                internalProjections.push(testVectors[i].dot(shape1.vertex(j)));
                externalProjections.push(testVectors[i].dot(shape2.vertex(j)));
            }

            // Retrieve min and max values
            let externalMin = Math.min(...externalProjections);
            let externalMax = Math.max(...externalProjections);
            let internalMin = Math.min(...internalProjections);
            let internalMax = Math.max(...internalProjections);

            // Check projections for collision
            for (let j = 0; j < 4; j++) {
                if (internalMin <= externalProjections[j] && externalProjections[j] <= internalMax) {
                    shape1InvolvedVertices[i].push(shape1.vertex(j));
                }
                if (externalMin <= internalProjections[j] && internalProjections[j] <= externalMax) {
                    shape2InvolvedVertices[i].push(shape2.vertex(j));
                }
            }
        }

        let shape1Intersect = this.intersectSafe(
            this.intersectSafe(shape1InvolvedVertices[0], shape1InvolvedVertices[1]),
            this.intersectSafe(shape1InvolvedVertices[2], shape1InvolvedVertices[3])
        );
        let shape2Intersect = this.intersectSafe(
            this.intersectSafe(shape2InvolvedVertices[0], shape2InvolvedVertices[1]),
            this.intersectSafe(shape2InvolvedVertices[2], shape2InvolvedVertices[3])
        );

        if (shape1Intersect.length === 0 && shape2Intersect.length === 0) {
            return false;
        }
        if (shape1Intersect.length === 0 && shape2Intersect.length === 1) {
            console.log("b");
            return shape2Intersect[0];
        }
        if (shape1Intersect.length === 0 && shape2Intersect.length === 2) {
            console.log("c");
            return false;
        }
        if (shape1Intersect.length === 1 && shape2Intersect.length === 0) {
            console.log("d");
            return shape1Intersect[0];
        }
        if (shape1Intersect.length === 1 && shape2Intersect.length === 1) {
            console.log("e");
            return shape1Intersect[0];
        }
        if (shape1Intersect.length === 1 && shape2Intersect.length === 2) {
            console.log("f");
            return shape1Intersect[0];
        }
        if (shape1Intersect.length === 2 && shape2Intersect.length === 0) {
            console.log("g");
            return false;
        }
        if (shape1Intersect.length === 2 && shape2Intersect.length === 1) {
            console.log("h");
            return shape2Intersect[0];
        }
        if (shape1Intersect.length === 2 && shape2Intersect.length === 2) {
            console.log("i");
            return new Vector(0, 0);
        }

        console.log(shape1, shape2, shape1Intersect, shape2Intersect);
        this.stop();
        throw new Error("Could not identify collision profile");
    }
    /**
     * Description placeholder
     *
     * @param {Shape} shape1
     * @param {Shape} shape2
     * @returns {(Vector | false)}
     */
    checkCollision2(shape1: Shape, shape2: Shape): Vector | false {
        let vectorToTest = [
            shape1.topRight.substract(shape1.topLeft),
            shape1.bottomRight.substract(shape1.topRight),
            shape1.bottomLeft.substract(shape1.bottomRight),
            shape1.topLeft.substract(shape1.bottomLeft),

            shape2.topRight.substract(shape2.topLeft),
            shape2.bottomRight.substract(shape2.topRight),
            shape2.bottomLeft.substract(shape2.bottomRight),
            shape2.topLeft.substract(shape2.bottomLeft),
        ];
        let shape1Vertices: Vector[][] = [];
        let shape2Vertices: Vector[][] = [];
        for (let i = 0; i < vectorToTest.length; i++) {
            let internalProjections: number[] = [];
            let externalProjections: number[] = [];

            shape1Vertices[i] = [];
            shape2Vertices[i] = [];

            // Retrieve projections
            for (let j = 0; j < 4; j++) {
                internalProjections.push(vectorToTest[i].dot(shape1.vertex(j)));
                externalProjections.push(vectorToTest[i].dot(shape2.vertex(j)));
            }

            // Retrieve min and max values
            let externalMin = Math.min(...externalProjections);
            let externalMax = Math.max(...externalProjections);
            let internalMin = Math.min(...internalProjections);
            let internalMax = Math.max(...internalProjections);

            // Check projections for collision
            for (let j = 0; j < 4; j++) {
                if (internalMin <= externalProjections[j] && externalProjections[j] <= internalMax) {
                    shape1Vertices[i].push(shape1.vertex(j));
                }
                if (externalMin <= internalProjections[j] && internalProjections[j] <= externalMax) {
                    shape2Vertices[i].push(shape2.vertex(j));
                }
            }
        }
        const shape1Intersect = this.intersectSafe(
            this.intersectSafe(
                this.intersectSafe(shape1Vertices[0], shape1Vertices[1]),
                this.intersectSafe(shape1Vertices[2], shape1Vertices[3])
            ),
            this.intersectSafe(
                this.intersectSafe(shape1Vertices[4], shape1Vertices[5]),
                this.intersectSafe(shape1Vertices[6], shape1Vertices[7])
            )
        );
        const shape2Intersect = this.intersectSafe(
            this.intersectSafe(
                this.intersectSafe(shape2Vertices[0], shape2Vertices[1]),
                this.intersectSafe(shape2Vertices[2], shape2Vertices[3])
            ),
            this.intersectSafe(
                this.intersectSafe(shape2Vertices[4], shape2Vertices[5]),
                this.intersectSafe(shape2Vertices[6], shape2Vertices[7])
            )
        );
        if (shape1Intersect.length == 0 && shape2Intersect.length == 0) {
            return false;
        }
        if (shape1Intersect.length == 0 && shape2Intersect.length == 1) {
            return shape2Intersect[0];
        }
        if (shape1Intersect.length == 0 && shape2Intersect.length == 2) {
            return new Vector(0, 0);
        }
        if (shape1Intersect.length == 1 && shape2Intersect.length == 0) {
            return shape1Intersect[0];
        }
        if (shape1Intersect.length == 1 && shape2Intersect.length == 1) {
            return shape1Intersect[0];
        }
        if (shape1Intersect.length == 1 && shape2Intersect.length == 2) {
            return shape1Intersect[0];
        }
        if (shape1Intersect.length == 2 && shape2Intersect.length == 0) {
            return new Vector(0, 0);
        }
        if (shape1Intersect.length == 2 && shape2Intersect.length == 1) {
            return shape2Intersect[0];
        }
        if (shape1Intersect.length == 2 && shape2Intersect.length == 2) {
            return new Vector(0, 0);
        }

        return false;
    }
    /**
     * Description placeholder
     */
    loop() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.resetCollisionGrid();
        const checkHash: string[] = [];

        for (let i = 0; i < this.shapes.length; i++) {
            const currentShape = this.shapes[i];
            if (currentShape?.inactive !== true) {
                let f = new Vector(0, 0);

                /* Start Velocity Verlet */
                let dr = currentShape.velocity.scale(this.deltaTime).add(currentShape.a.scale(0.5 * this.deltaTime ** 2));
                currentShape.move(dr.scale(100));

                /* Gravity */
                f = f.add(new Vector(0, currentShape.mass * 9.81));
                /* Damping */
                f = f.add(currentShape.velocity.scale(this.b));

                /* Collision */
                if (currentShape.indexes) {
                    for (const { x, y } of currentShape.indexes) {
                        for (const sh of this.collisionGrid[`${x}_${y}`]) {
                            const hash = `${currentShape.id}-${sh.id}`;
                            if (!(currentShape == sh || checkHash.includes(hash))) {
                                checkHash.push(hash);

                                let collision = this.checkCollision2(currentShape, sh);
                                if (collision) {
                                    console.log("COLLISION", currentShape?.name, sh?.name, collision);

                                    let N = currentShape.center().substract(collision);
                                    N = N.scale(1 / N.length());
                                    currentShape.velocity = N.scale(-1.3 * currentShape.velocity.dot(N));

                                    // if (currentShape.omega !== 0) {
                                    //     currentShape.omega =
                                    //         -1 *
                                    //         0.2 *
                                    //         (currentShape.omega / Math.abs(currentShape.omega)) *
                                    //         currentShape.center().substract(collision).cross(velocityOld);
                                    // } else {
                                    //     currentShape.omega = -0.002 * currentShape.center().substract(collision).cross(velocityOld);
                                    // }
                                }
                            }
                        }
                    }
                }

                /* Finish Velocity Verlet */
                let newA = f.scale(currentShape.mass);
                let deltaV = currentShape.a.add(newA).scale(0.5 * this.deltaTime);
                currentShape.velocity = currentShape.velocity.add(deltaV);

                /* Rotation */
                // currentShape.alpha = (currentShape.omega * this.angularB) / currentShape.J;
                // currentShape.omega += currentShape.alpha * this.deltaTime;
                // currentShape.rotate(currentShape.omega * this.deltaTime);
            }

            /* Draw */
            currentShape.draw(this.context, Engine.DEBUG);
        }
        if (Engine.DEBUG) {
            this.context.strokeStyle = "rgba(2, 47, 31, 0.5)";
            this.context.fillStyle = "rgba(2, 47, 31, 0.5)";
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
    /**
     * Description placeholder
     */
    start() {
        this.timer = setInterval(() => {
            this.loop();
        }, this.deltaTime * 1000);
    }
    /**
     * Description placeholder
     */
    stop() {
        clearInterval(this.timer);
    }
}
