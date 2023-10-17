import Circle from "./Circle";
import Rectangle from "./Rectangle";
import Vector from "./Vector";

export default interface Shape {
    indexes?: { x: number; y: number }[];
    id: number;

    setFixed(f: boolean): this;
    isFixed(): boolean;

    setAcceleration(x: number, y: number): this;
    setAcceleration(v: Vector): this;
    getAcceleration(): Vector;

    setPosition(x: number, y: number): this;
    setPosition(v: Vector): this;
    getPosition(): Vector;
    getPreviousPosition(): Vector;

    move(x: number, y: number): this;
    move(v: Vector): this;

    getGridPosition(cellSize: number): {
        minCol: number;
        maxCol: number;
        minRow: number;
        maxRow: number;
    };
    draw(context: CanvasRenderingContext2D, debug: boolean): this;
    update(dt: number): this;
    getName(): string;
}

export function isShape(sh: Shape, name: "Circle"): sh is Circle;
export function isShape(sh: Shape, name: "Rectangle"): sh is Rectangle;
export function isShape(sh: Shape, name: string) {
    return sh.getName() == name;
}
