export default class Vector {
    public x: number;
    public y: number;

    static POINT_SIZE: number = 2;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    length() {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }
    length2() {
        return this.x ** 2 + this.y ** 2;
    }
    add(v: Vector) {
        return new Vector(this.x + v.x, this.y + v.y);
    }
    substract(v: Vector) {
        return new Vector(this.x - v.x, this.y - v.y);
    }
    scale(s: number) {
        return new Vector(this.x * s, this.y * s);
    }
    dot(v: Vector) {
        return this.x * v.x + this.y * v.y;
    }
    cross(v: Vector) {
        return this.x * v.x - this.y * v.y;
    }
    rotate(a: number, v: Vector) {
        let deltaX = this.x - v.x;
        let deltaY = this.y - v.y;

        let xPrime = v.x + (deltaX * Math.cos(a) - deltaY * Math.sin(a));
        let yPrime = v.y + (deltaX * Math.sin(a) + deltaY * Math.cos(a));

        return new Vector(xPrime, yPrime);
    }
    draw(context: CanvasRenderingContext2D) {
        context.strokeStyle = "blue";
        context.strokeRect(this.x - Vector.POINT_SIZE / 2, this.y - Vector.POINT_SIZE / 2, Vector.POINT_SIZE, Vector.POINT_SIZE);
    }
    toString() {
        return `[${this.x}, ${this.y}]`;
    }
}
