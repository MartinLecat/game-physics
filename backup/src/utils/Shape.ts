import Vector from "./Vector";

export default interface Shape {
    velocity: Vector;
    a: Vector;

    id: number;
    theta: number;
    omega: number;
    alpha: number;
    mass: number;
    J: number;

    topLeft: Vector;
    topRight: Vector;
    bottomLeft: Vector;
    bottomRight: Vector;

    inactive?: boolean;

    indexes?: { x: number; y: number }[];

    draw: (context: CanvasRenderingContext2D, drawPoints: boolean) => void;
    rotate: (angle: number) => any extends Shape ? any : null;
    move: (v: Vector) => any extends Shape ? any : null;
    vertex: (id: number) => Vector;
    getPos: () => { topLeft: { x: number; y: number }; bottomRight: { x: number; y: number } };
    center: () => Vector;
}
