export default class Vector {
    public x: number;
    public y: number;

    static POINT_SIZE: number = 10;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    sum(v: Vector) {
        return new Vector(this.x + v.x, this.y + v.y);
    }
    scale(s: number) {
        return new Vector(this.x * s, this.y * s);
    }
    length() {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }
    draw(context: CanvasRenderingContext2D) {
        context.strokeStyle = "rgba(0,0,255,0.5)";
        context.strokeRect(this.x - Vector.POINT_SIZE / 2, this.y - Vector.POINT_SIZE / 2, Vector.POINT_SIZE, Vector.POINT_SIZE);
    }
}
