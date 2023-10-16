import Circle from "./Circle";
import Rectangle from "./Rectangle";
import Vector from "./Vector";

export default interface Shape {
    indexes?: { x: number; y: number }[];
    id: number;

    update(dt: number): void;
    getName(): string;
    getPosition(): Vector;
    setPosition(x: number, y: number): void;
    setPosition(v: Vector): void;
    setAcceleration(x: number, y: number): void;
    setAcceleration(v: Vector): void;
    setFixed(f: boolean): void;
    isFixed(): boolean;
    draw(context: CanvasRenderingContext2D, debug: boolean): void;
    getGridPosition(cellSize: number): {
        minCol: number;
        maxCol: number;
        minRow: number;
        maxRow: number;
    };
}

export function isShape(sh: Shape, name: "Circle"): sh is Circle;
export function isShape(sh: Shape, name: "Rectangle"): sh is Rectangle;
export function isShape(sh: Shape, name: string) {
    return sh.getName() == name;
}
